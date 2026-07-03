import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ContactsWorkspace } from "./contacts-workspace";
import { listContacts } from "@/lib/actions/contacts";
import { CONTACT_TYPES } from "@/lib/contacts";

export const metadata: Metadata = { title: "Contacts" };

/**
 * Contacts — the operational contact directory. Exclusive to BlueSky Locate
 * (surfaced in the sidebar only under that product), though the route is
 * reachable by deep link. Contact data is user-entered; no fabricated
 * records are seeded.
 */
export default async function ContactsPage() {
  const contacts = await listContacts();

  return (
    <>
      <PageHeader
        title="Contacts"
        description="The operational contact directory for your locating company."
        breadcrumbs={[{ label: "Locate", href: "/locate" }, { label: "Contacts" }]}
      />
      <ContactsWorkspace
        contactTypes={CONTACT_TYPES}
        contacts={contacts.map((c) => ({
          id: c.id,
          contactType: c.contactType,
          subtype: c.subtype,
          status: c.status,
          organization: c.organization,
          contactName: c.contactName,
          title: c.title,
          email: c.email,
          officePhone: c.officePhone,
          mobilePhone: c.mobilePhone,
        }))}
      />
    </>
  );
}
