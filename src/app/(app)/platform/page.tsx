import { redirect } from "next/navigation";

/** /platform's index is the Companies list. */
export default function PlatformIndexPage() {
  redirect("/platform/companies");
}
