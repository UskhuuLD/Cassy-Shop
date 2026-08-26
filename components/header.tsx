"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { useCategories } from "./category-context";
import { logoutAction } from "@/app/login/actions";
import type { ShopInfo } from "@/lib/shop-settings";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

type SearchResult = { id: string; slug: string; name: string; price: number; image: string };

export default function Header({
  customer,
  shopInfo,
}: {
  customer: { name: string | null } | null;
  shopInfo: ShopInfo;
}) {
  const { count } = useCart();
  const { ids } = useWishlist();
  const categories = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => setResults(data.results || []))
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const navLinks = [
    { href: "/products", label: "NEW IN" },
    ...categories.slice(0, 2).map((c) => ({ href: `/products?category=${c.slug}`, label: c.name.toUpperCase() })),
    { href: "/products?sale=1", label: "SALE", accent: true },
  ];

  return (
    <>
      <div className="bg-[#2b2027] py-2 text-center text-[11px] tracking-[.17em] text-white">
        {shopInfo.delivery.toUpperCase()} • INSTAGRAM @{shopInfo.instagram.toUpperCase()}
      </div>
      <header className="sticky top-0 z-50 border-b border-[#eadde3] bg-white/95 backdrop-blur">
        <div className="container-page flex h-20 items-center gap-7">
          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Цэс">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <Link href="/" className="serif text-3xl font-bold tracking-tight">
            CASSY
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold md:flex">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} className={l.accent ? "text-[#c9536f]" : ""}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
            <label className="flex items-center rounded-full border border-[#eadde3] px-4">
              <Search size={18} className="text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => setTimeout(() => setQuery(""), 150)}
                placeholder="Бараа хайх..."
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
              />
            </label>
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#eadde3] bg-white shadow-soft">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onMouseDown={() => setQuery("")}
                    className="flex items-center gap-3 border-b border-[#f3e9ee] px-4 py-2.5 last:border-0 hover:bg-[#faf5f7]"
                  >
                    <img src={p.image} alt="" className="h-10 w-8 rounded object-cover" />
                    <span className="flex-1 text-sm">{p.name}</span>
                    <span className="text-xs font-bold text-[#a76f83]">{money(p.price)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/wishlist" className="relative">
              <Heart size={21} />
              {ids.length > 0 && <span className="counter">{ids.length}</span>}
            </Link>
            {customer ? (
              <div className="relative">
                <button onClick={() => setAccountOpen((v) => !v)} aria-label="Хэрэглэгчийн цэс">
                  <User size={21} />
                </button>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-48 overflow-hidden rounded-2xl border border-[#eadde3] bg-white shadow-soft">
                      <Link
                        href="/account/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-3 text-sm hover:bg-[#faf5f7]"
                      >
                        Миний захиалга
                      </Link>
                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-[#faf5f7]"
                        >
                          Гарах
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <User size={21} />
              </Link>
            )}
            <Link href="/cart" className="relative">
              <ShoppingBag size={22} />
              {count > 0 && <span className="counter">{count}</span>}
            </Link>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[#eadde3] bg-white px-5 py-4 md:hidden">
            <label className="flex items-center rounded-full border border-[#eadde3] px-4">
              <Search size={18} className="text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Бараа хайх..."
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </label>
            {results.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-[#eadde3]">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      setQuery("");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 border-b border-[#f3e9ee] px-4 py-2.5 last:border-0"
                  >
                    <img src={p.image} alt="" className="h-10 w-8 rounded object-cover" />
                    <span className="flex-1 text-sm">{p.name}</span>
                    <span className="text-xs font-bold text-[#a76f83]">{money(p.price)}</span>
                  </Link>
                ))}
              </div>
            )}
            <nav className="mt-4 flex flex-col gap-1 text-sm font-semibold">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 hover:bg-[#f9edf2] ${l.accent ? "text-[#c9536f]" : ""}`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
