import AdminNav from "@/components/admin-nav";
import FaqAdmin from "./faq-admin";
import { getFaqs } from "@/lib/faq";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <main className="container-page py-10">
      <AdminNav />
      <FaqAdmin initial={faqs} />
    </main>
  );
}
