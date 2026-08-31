"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "./wishlist-context";
import type { PublicProduct } from "@/lib/products";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

export default function ProductCard({ p }: { p: PublicProduct }) {
  const { toggle, has } = useWishlist();
  const image = p.images[0]?.url || "/products/product-1.jpg";
  const soldOut = p.stock <= 0;
  const displayPrice = p.salePrice ?? p.price;

  const badge = p.isComingSoon
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
        <img
          src={image}
          alt={p.name}
          className={`aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.035] ${soldOut ? "opacity-60 grayscale" : ""}`}
        />
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider ${
              p.isComingSoon
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
      </div>
    </article>
  );
}
