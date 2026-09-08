"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "./wishlist-context";
import { useCart } from "./cart-context";
import type { PublicProduct } from "@/lib/products";
import { totalStock } from "@/lib/product-stock";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

export default function ProductCard({ p }: { p: PublicProduct }) {
  const { toggle, has } = useWishlist();
  const { add } = useCart();
  const images = p.images.length ? p.images : [{ id: "fallback", url: "/products/product-1.jpg" }];
  const soldOut = totalStock(p) <= 0;
  const comingSoon = p.isComingSoon && (!p.comingSoonUntil || new Date(p.comingSoonUntil).getTime() > Date.now());
  const displayPrice = p.salePrice ?? p.price;
  const [activeIndex, setActiveIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  }

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const variant = p.variants.find((v) => v.stock > 0) ?? p.variants[0];
    add(
      {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        salePrice: p.salePrice,
        image: images[activeIndex]?.url ?? images[0].url,
      },
      variant?.size ?? p.sizes[0] ?? "ONE SIZE",
      variant?.color ?? p.colors[0] ?? ""
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const badge = comingSoon
    ? "ТУН УДАХГҮЙ"
    : soldOut
      ? "SOLD OUT"
      : p.salePrice
        ? "SALE"
        : p.isBestSeller
          ? "BESTSELLER"
          : p.isNew
            ? "NEW"
            : null;

  return (
    <article className="group">
      <Link href={`/products/${p.slug}`} className="relative block overflow-hidden rounded-[24px] bg-[#f5eeee]">
        {images.length > 1 ? (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={p.name}
                className={`aspect-[3/4] w-full flex-none snap-start object-cover ${soldOut ? "opacity-60 grayscale" : ""}`}
              />
            ))}
          </div>
        ) : (
          <img
            src={images[0].url}
            alt={p.name}
            className={`aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.035] ${soldOut ? "opacity-60 grayscale" : ""}`}
          />
        )}
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
              comingSoon
                ? "bg-[#a76f83] text-white"
                : soldOut
                  ? "bg-[#2b2027] text-white"
                  : badge === "SALE"
                    ? "bg-[#c9536f] text-white"
                    : "bg-white"
            }`}
          >
            {badge}
          </span>
        )}
      </Link>
      {images.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {images.map((img, i) => (
            <span
              key={img.id}
              className={`h-1 rounded-full transition-all ${
                i === activeIndex ? "w-5 bg-[#2b2027]" : "w-3 bg-[#eadde3]"
              }`}
            />
          ))}
        </div>
      )}
      <div className="relative pt-3">
        <button
          aria-label="wishlist"
          onClick={() => toggle(p.id)}
          className={`absolute right-0 top-3 rounded-full p-2 ${has(p.id) ? "bg-[#f5dce6] text-[#9d5670]" : "bg-[#faf5f7]"}`}
        >
          <Heart size={17} fill={has(p.id) ? "currentColor" : "none"} />
        </button>
        <p className="text-xs uppercase tracking-wider text-zinc-500">{p.category.name}</p>
        <Link href={`/products/${p.slug}`} className="mt-1 block pr-10 font-medium">
          {p.name}
        </Link>
        <div className="mt-2 flex gap-2 text-sm font-bold">
          <span className={p.salePrice ? "text-[#c9536f]" : ""}>{money(displayPrice)}</span>
          {p.salePrice && <span className="text-zinc-400 line-through">{money(p.price)}</span>}
        </div>
        {!soldOut && (
          <button
            onClick={quickAdd}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#eadde3] py-2.5 text-xs font-bold text-[#2b2027] transition hover:bg-[#2b2027] hover:text-white"
          >
            <ShoppingBag size={15} />
            {added ? "НЭМЭГДЛЭЭ ✓" : "Сагсанд нэмэх"}
          </button>
        )}
      </div>
    </article>
  );
}
