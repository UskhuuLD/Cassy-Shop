import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import AddToCart from "@/components/add-to-cart";

export const dynamic = "force-dynamic";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return notFound();

  const image = p.images[0]?.url || "/products/product-1.jpg";
  const soldOut = p.stock <= 0;

  return (
    <main className="container-page grid gap-10 py-10 md:grid-cols-2">
      <div className="overflow-hidden rounded-[30px] bg-[#f5eeee]">
        <img src={image} alt={p.name} className={`aspect-[4/5] w-full object-cover ${soldOut ? "opacity-60 grayscale" : ""}`} />
      </div>
      <div className="max-w-lg py-6">
        <p className="text-xs font-bold tracking-[.2em] text-[#a76f83]">{p.category.name}</p>
        <h1 className="serif mt-3 text-5xl">{p.name}</h1>
        <div className="mt-5 flex gap-3 text-xl font-bold">
          <span className={p.salePrice ? "text-[#c9536f]" : ""}>{money(p.salePrice ?? p.price)}</span>
          {p.salePrice && <span className="text-zinc-400 line-through">{money(p.price)}</span>}
        </div>
        <p className="mt-6 leading-7 text-zinc-600">{p.description}</p>
        <div className="my-7 border-y border-[#eadde3] py-5 text-sm">
          <p>✓ Хот дотор хүргэлт</p>
          <p className="mt-2">
            {soldOut ? (
              <span className="font-bold text-red-600">SOLD OUT — түр дууссан</span>
            ) : (
              <>✓ Үлдэгдэл: {p.stock} ширхэг</>
            )}
          </p>
          <p className="mt-2">✓ QPay холболтын placeholder бэлэн</p>
        </div>
        <AddToCart p={p} />
      </div>
    </main>
  );
}
