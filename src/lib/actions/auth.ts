"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  DEFAULT_PASSWORD_POLICY,
  validatePassword,
} from "@/lib/auth/password-policy";
import {
  createSession,
  destroyCurrentSession,
  revokeAllSessions,
} from "@/lib/auth/session-store";
import { getCurrentSession, isSetupRequired } from "@/lib/session";

/**
 * Authentication actions (BO-AUTH-01): login, logout, password change,
 * password-reset request, and the Initial Setup Wizard. Every auth
 * event writes an audit entry against the user's tenant. Login errors
 * are deliberately generic — no account enumeration.
 */

type ActionState = { error: string } | null;
type PasswordChangeState = { error: string } | { success: true } | null;

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

function normalizeEmail(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim().toLowerCase();
}

/** Human wording for non-active statuses shown *after* a correct password. */
const STATUS_MESSAGES: Record<string, string> = {
  inactive: "This account is disabled. Contact your administrator.",
  suspended: "This account is suspended. Contact your administrator.",
  invited:
    "This account is pending invitation setup. Contact your administrator.",
};

// ── Login / logout ───────────────────────────────────────────────────────

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) return { error: GENERIC_LOGIN_ERROR };

  const user = await db.user.findUnique({ where: { email } });

  // Unknown email or no credential set: same generic answer, and no
  // audit entry — there is no tenant to attribute the attempt to.
  if (!user?.passwordHash) return { error: GENERIC_LOGIN_ERROR };

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    await recordAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "auth.login_failed",
      entityType: "User",
      entityId: user.id,
      description: `Failed sign-in attempt for ${user.email} (wrong password).`,
    });
    return { error: GENERIC_LOGIN_ERROR };
  }

  if (user.status !== "active") {
    await recordAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "auth.login_failed",
      entityType: "User",
      entityId: user.id,
      description: `Sign-in blocked for ${user.email} (status: ${user.status}).`,
      metadata: { status: user.status },
    });
    return {
      error: STATUS_MESSAGES[user.status] ?? "This account cannot sign in.",
    };
  }

  await createSession(user.id, rememberMe);
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await recordAudit({
    companyId: user.companyId,
    userId: user.id,
    action: "auth.login_succeeded",
    entityType: "User",
    entityId: user.id,
    description: `${user.firstName} ${user.lastName} signed in.`,
    metadata: { rememberMe },
  });

  redirect("/dashboard");
}

export async function logout() {
  const session = await getCurrentSession();
  await destroyCurrentSession();
  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "auth.logout",
    entityType: "User",
    entityId: session.user.id,
    description: `${session.user.firstName} ${session.user.lastName} signed out.`,
  });
  redirect("/login");
}

// ── Password management ──────────────────────────────────────────────────

export async function changePassword(
  _prev: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const session = await getCurrentSession();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next !== confirm) return { error: "New passwords do not match." };
  const failures = validatePassword(next, DEFAULT_PASSWORD_POLICY);
  if (failures.length > 0) return { error: failures.join(" ") };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash || !(await verifyPassword(user.passwordHash, current))) {
    return { error: "Current password is incorrect." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });
  // Security: a password change invalidates every other session.
  await revokeAllSessions(user.id, session.sessionId);
  await recordAudit({
    companyId: session.company.id,
    userId: user.id,
    action: "auth.password_changed",
    entityType: "User",
    entityId: user.id,
    description: `${session.user.firstName} ${session.user.lastName} changed their password.`,
  });

  return { success: true };
}

export async function requestPasswordReset(
  _prev: { done: boolean } | null,
  formData: FormData
): Promise<{ done: boolean }> {
  const email = normalizeEmail(formData.get("email"));
  if (email) {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      await recordAudit({
        companyId: user.companyId,
        userId: user.id,
        action: "auth.password_reset_requested",
        entityType: "User",
        entityId: user.id,
        description: `Password reset requested for ${user.email}.`,
      });
    }
  }
  // Always the same outcome — no account enumeration. Reset emails are
  // delivered once email integration lands (future build order).
  return { done: true };
}

// ── Initial Setup Wizard ─────────────────────────────────────────────────

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function completeInitialSetup(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // The wizard is permanently disabled once any user exists.
  if (!(await isSetupRequired())) {
    return { error: "Initial setup has already been completed." };
  }

  // Organization
  const orgName = String(formData.get("orgName") ?? "").trim();
  const subdomain = slugify(String(formData.get("subdomain") ?? ""));
  if (!orgName || !subdomain) {
    return { error: "Organization name and subdomain are required." };
  }

  // Platform administrator
  const paFirst = String(formData.get("paFirstName") ?? "").trim();
  const paLast = String(formData.get("paLastName") ?? "").trim();
  const paEmail = normalizeEmail(formData.get("paEmail"));
  const paPassword = String(formData.get("paPassword") ?? "");
  const paConfirm = String(formData.get("paConfirm") ?? "");
  if (!paFirst || !paLast || !paEmail) {
    return { error: "Platform administrator name and email are required." };
  }
  if (paPassword !== paConfirm) {
    return { error: "Platform administrator passwords do not match." };
  }
  const paFailures = validatePassword(paPassword, DEFAULT_PASSWORD_POLICY);
  if (paFailures.length > 0) {
    return { error: `Platform administrator password: ${paFailures.join(" ")}` };
  }

  // Organization administrator (may be the same person)
  const sameAdmin = formData.get("sameAdmin") === "on";
  const oaFirst = String(formData.get("oaFirstName") ?? "").trim();
  const oaLast = String(formData.get("oaLastName") ?? "").trim();
  const oaEmail = normalizeEmail(formData.get("oaEmail"));
  const oaPassword = String(formData.get("oaPassword") ?? "");
  const oaConfirm = String(formData.get("oaConfirm") ?? "");
  if (!sameAdmin) {
    if (!oaFirst || !oaLast || !oaEmail) {
      return { error: "Organization administrator name and email are required." };
    }
    if (oaEmail === paEmail) {
      return {
        error:
          'Use "same person" instead of repeating the platform administrator\'s email.',
      };
    }
    if (oaPassword !== oaConfirm) {
      return { error: "Organization administrator passwords do not match." };
    }
    const oaFailures = validatePassword(oaPassword, DEFAULT_PASSWORD_POLICY);
    if (oaFailures.length > 0) {
      return {
        error: `Organization administrator password: ${oaFailures.join(" ")}`,
      };
    }
  }

  // Catalog prerequisites (products + system roles come from the seed).
  const [products, platformAdminRole, companyAdminRole] = await Promise.all([
    db.product.findMany({ where: { status: "active" } }),
    db.role.findFirst({ where: { key: "platform_admin", isSystemRole: true } }),
    db.role.findFirst({ where: { key: "company_admin", isSystemRole: true } }),
  ]);
  if (!platformAdminRole || !companyAdminRole || products.length === 0) {
    return {
      error:
        "The platform catalog is not seeded. Run `npm run db:seed`, then retry setup.",
    };
  }

  // First organization, provisioned with the product catalog enabled
  // (mirrors previous provisioning; admins can disable products later).
  const company = await db.company.create({
    data: {
      name: orgName,
      slug: slugify(orgName),
      subdomain,
      status: "active",
      settings: { create: {} },
      products: {
        create: products.map((p) => ({
          productId: p.id,
          status: "active",
          enabledAt: new Date(),
        })),
      },
    },
  });

  // Platform administrator (also holds organization admin permissions —
  // the platform_admin role includes company.manage).
  const platformAdmin = await db.user.create({
    data: {
      companyId: company.id,
      firstName: paFirst,
      lastName: paLast,
      email: paEmail,
      status: "active",
      passwordHash: await hashPassword(paPassword),
      productRoles: {
        create: products.map((p) => ({
          productId: p.id,
          roleId: platformAdminRole.id,
        })),
      },
    },
  });

  // Organization administrator: a second person, or an extra role grant
  // when the platform administrator manages the organization too.
  let orgAdminId = platformAdmin.id;
  if (sameAdmin) {
    await db.userProductRole.createMany({
      data: products.map((p) => ({
        userId: platformAdmin.id,
        productId: p.id,
        roleId: companyAdminRole.id,
      })),
    });
  } else {
    const orgAdmin = await db.user.create({
      data: {
        companyId: company.id,
        firstName: oaFirst,
        lastName: oaLast,
        email: oaEmail,
        status: "active",
        passwordHash: await hashPassword(oaPassword),
        productRoles: {
          create: products.map((p) => ({
            productId: p.id,
            roleId: companyAdminRole.id,
          })),
        },
      },
    });
    orgAdminId = orgAdmin.id;
  }

  await recordAudit({
    companyId: company.id,
    userId: platformAdmin.id,
    action: "auth.initial_setup_completed",
    entityType: "Company",
    entityId: company.id,
    description: `Initial platform setup completed: organization "${orgName}" provisioned with platform and organization administrators.`,
    metadata: {
      subdomain,
      productsEnabled: products.map((p) => p.key),
      organizationAdminUserId: orgAdminId,
      sameAdmin,
    },
  });

  redirect("/login?setup=complete");
}
