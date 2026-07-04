"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { getCurrentSession } from "@/lib/session";
import { CONTACT_STATUSES, isContactType } from "@/lib/contacts";
import { csvToJsonList } from "@/lib/lists";

export type CreateContactState = {
  ok?: boolean;
  error?: string;
} | null;

/** Creates an operational directory contact. Real, user-entered data. */
export async function createContact(
  _prev: CreateContactState,
  formData: FormData
): Promise<CreateContactState> {
  const session = await getCurrentSession();

  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactType = String(formData.get("contactType") ?? "").trim();
  if (!contactName) return { error: "Contact name is required." };
  if (!isContactType(contactType)) {
    return { error: "Choose a valid contact type." };
  }
  const status = String(formData.get("status") ?? "active");
  if (!CONTACT_STATUSES.includes(status as (typeof CONTACT_STATUSES)[number])) {
    return { error: `Invalid status: ${status}` };
  }

  const text = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    return v || null;
  };

  const contact = await db.contact.create({
    data: {
      companyId: session.company.id,
      contactType,
      subtype: text("subtype"),
      status,
      organization: text("organization"),
      contactName,
      title: text("title"),
      department: text("department"),
      officePhone: text("officePhone"),
      mobilePhone: text("mobilePhone"),
      email: text("email"),
      fax: text("fax"),
      billingAddress: text("billingAddress"),
      mailingAddress: text("mailingAddress"),
      physicalAddress: text("physicalAddress"),
      utilityServed: text("utilityServed"),
      serviceArea: text("serviceArea"),
      counties: csvToJsonList(String(formData.get("counties") ?? "")),
      states: csvToJsonList(String(formData.get("states") ?? "")),
      notes: text("notes"),
    },
  });

  await recordAudit({
    companyId: session.company.id,
    userId: session.user.id,
    action: "contact.created",
    entityType: "Contact",
    entityId: contact.id,
    description: `Contact "${contact.contactName}" was added to the directory.`,
    metadata: { contactType: contact.contactType },
  });

  revalidatePath("/contacts");
  return { ok: true };
}

export async function listContacts() {
  const session = await getCurrentSession();
  return db.contact.findMany({
    where: { companyId: session.company.id },
    orderBy: [{ contactType: "asc" }, { contactName: "asc" }],
  });
}
