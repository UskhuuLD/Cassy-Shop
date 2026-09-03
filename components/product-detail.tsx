"use client";
import { useState } from "react";
import { useCart } from "./cart-context";
import type { PublicProduct } from "@/lib/products";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

export default function ProductDetail({ p }: { p: PublicProduct }) {
  const [size, setSize] = useState(p.sizes[0] || "ONE SIZE");
  const [color, setColor] = useState(p.colors[0] || "");
  const [manualImage, setManualImage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { add } = useCart();
  const soldOut = p.stock <= 0;

  const fallbackImage = p.images[0]?.url || "/products/product-1.jpg";
  // A customer clicking a thumbnail directly always wins; otherwise the
  // selected color's tagged photo (if any) drives the main image.
  const colorImage = color ? p.images.find((img) => img.color === color)?.url : undefined;
  const activeImage = manualImage ?? colorImage ?? fallbackImage;

  function selectColor(c: string) {
    setColor(c);
    setManualImage(null); // let the color choice drive the photo again
  }

  return (
    <>
      <div>
        <div className="overflow-hidden rounded-[30px] bg-[#f5eeee]">
          <img
            src={activeImage}
            alt={p.name}
            className={`aspect-[4/5] w-full object-cover ${soldOut ? "opacity-60 grayscale" : ""}`}
          />
        </div>
        {p.images.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {p.images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setManualImage(img.url)}
                className={`h-16 w-14 overflow-hidden rounded-xl border-2 ${
                  activeImage === img.url ? "border-[#2b2027]" : "border-transparent"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
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

        {p.sizes.length > 0 && (
          <>
            <p className="mb-3 text-sm font-bold">SIZE</p>
            <div className="mb-6 flex gap-2">
              {p.sizes.map((s) => (
                <button
                  onClick={() => setSize(s)}
                  key={s}
                  className={`h-11 min-w-11 rounded-full border px-4 ${size === s ? "border-[#2b2027] bg-[#2b2027] text-white" : "border-[#eadde3]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
        {p.colors.length > 0 && (
          <>
            <p className="mb-3 text-sm font-bold">COLOR</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {p.colors.map((c) => (
                <button
                  onClick={() => selectColor(c)}
                  key={c}
                  className={`rounded-full border px-4 py-2 text-sm ${color === c ? "border-[#2b2027] bg-[#2b2027] text-white" : "border-[#eadde3]"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}
        {soldOut ? (
          <button disabled className="btn w-full cursor-not-allowed bg-zinc-200 text-zinc-500">
            SOLD OUT
          </button>
        ) : (
          <button
            onClick={() => {
              add(
                {
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.price,
                  salePrice: p.salePrice,
                  image: activeImage,
                },
                size
              );
              setDone(true);
              setTimeout(() => setDone(false), 1600);
            }}
            className="btn btn-dark w-full"
          >
            {done ? "САГСАНД НЭМЭГДЛЭЭ ✓" : "САГСАНД НЭМЭХ"}
          </button>
        )}
      </div>
    </>
  );
}
