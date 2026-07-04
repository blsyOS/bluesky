import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { KNOWN_COMPANY_FLAGS } from "@/lib/company";
import { FlagList } from "./flag-list";

export const metadata: Metadata = { title: "Feature Flags" };

export default async function CompanyFlagsPage() {
  const session = await getCurrentSession();
  const rows = await db.companyFeatureFlag.findMany({
    where: { companyId: session.company.id },
  });
  const enabledByKey = new Map(rows.map((r) => [r.key, r.enabled]));

  return (
    <div className="max-w-3xl">
      <FlagList
        flags={KNOWN_COMPANY_FLAGS.map((flag) => ({
          ...flag,
          enabled: enabledByKey.get(flag.key) ?? false,
        }))}
      />
    </div>
  );
}
