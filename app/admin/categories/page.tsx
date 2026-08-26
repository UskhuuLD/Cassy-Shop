import AdminNav from "@/components/admin-nav";
import CategoriesAdmin from "./categories-admin";
import { getCategoriesWithCounts } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <main className="container-page py-10">
      <AdminNav />
      <CategoriesAdmin initial={categories} />
    </main>
  );
}
