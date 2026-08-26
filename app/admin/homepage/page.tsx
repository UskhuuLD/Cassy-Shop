import AdminNav from "@/components/admin-nav";
import HomepageEditor from "./homepage-editor";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  const content = await getSiteContent();

  return (
    <main className="container-page py-10">
      <AdminNav />
      <h1 className="serif text-5xl">Нүүр хуудасны зураг</h1>
      <HomepageEditor initial={content} />
    </main>
  );
}
