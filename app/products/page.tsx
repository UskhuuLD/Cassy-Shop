import { Suspense } from "react";
import ProductBrowser from "@/components/product-browser";
import { getActiveProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function Products() {
  const [products, categories] = await Promise.all([getActiveProducts(), getCategories()]);

  return (
    <main className="container-page py-10">
      <Suspense fallback={<div className="py-20 text-center text-zinc-400">Ачааллаж байна...</div>}>
        <ProductBrowser products={products} categories={categories} />
      </Suspense>
    </main>
  );
}
