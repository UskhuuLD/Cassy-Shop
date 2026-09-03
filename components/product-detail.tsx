"use client";
import { useRef, useState } from "react";
import { useCart } from "./cart-context";
import type { PublicProduct } from "@/lib/products";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

export default function ProductDetail({ p }: { p: PublicProduct }) {
  const images = p.images.length ? p.images : [{ id: "fallback", url: "/products/product-1.jpg", color: "" }];

  const [size, setSize] = useState(p.sizes[0] || "ONE SIZE");
  const [color, setColor] = useState(p.colors[0] || "");
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = images.findIndex((img) => img.color === (p.colors[0] || ""));
    return idx !== -1 ? idx : 0;
  });
  const [done, setDone] = useState(false);
  const { add } = useCart();
  const soldOut = p.stock <= 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(index: number) {
    const el = scrollRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActiveIndex(index);
  }

  function selectColor(c: string) {
    setColor(c);
    const idx = images.findIndex((img) => img.color === c);
    if (idx !== -1) scrollToIndex(idx);
  }

  // Keeps the highlighted thumbnail in sync when the customer swipes the
  // gallery by hand instead of clicking a thumbnail/color.
  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  }

  const activeImage = images[activeIndex]?.url ?? images[0].url;

  return (
    <>
      <div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-[30px] bg-[#f5eeee] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={p.name}
              className={`aspect-[4/5] w-full flex-none snap-start object-cover ${soldOut ? "opacity-60 grayscale" : ""}`}
            />
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`h-16 w-14 overflow-hidden rounded-xl border-2 ${
                  activeIndex === i ? "border-[#2b2027]" : "border-transparent"
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
