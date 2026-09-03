import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import ProductDetail from "@/components/product-detail";

export const dynamic = "force-dynamic";

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return notFound();

  return (
    <main className="container-page grid gap-10 py-10 md:grid-cols-2">
      <ProductDetail p={p} />
    </main>
  );
}
