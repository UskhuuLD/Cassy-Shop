import AdminNav from "@/components/admin-nav";
import ProductsAdmin from "./products-table";
import { getAllProductsAdmin } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const [products, categories] = await Promise.all([getAllProductsAdmin(), getCategories()]);

  return (
    <main className="container-page py-10">
      <AdminNav />
      <ProductsAdmin initialProducts={products} categories={categories} />
    </main>
  );
}
