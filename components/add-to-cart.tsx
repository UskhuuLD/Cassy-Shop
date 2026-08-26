"use client";
import { useState } from "react";
import { useCart } from "./cart-context";
import type { PublicProduct } from "@/lib/products";

export default function AddToCart({ p }: { p: PublicProduct }) {
  const [size, setSize] = useState(p.sizes[0] || "ONE SIZE");
  const [color, setColor] = useState(p.colors[0] || "");
  const [done, setDone] = useState(false);
  const { add } = useCart();
  const soldOut = p.stock <= 0;

  return (
    <div>
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
                onClick={() => setColor(c)}
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
                image: p.images[0]?.url || "/products/product-1.jpg",
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
  );
}
