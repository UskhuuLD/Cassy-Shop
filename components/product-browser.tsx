"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./product-card";
import type { PublicProduct } from "@/lib/products";
import type { CategoryLite } from "./category-context";
import { Search, SlidersHorizontal } from "lucide-react";

export default function ProductBrowser({ products, categories }: { products: PublicProduct[]; categories: CategoryLite[] }) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const isSale = searchParams.get("sale") === "1";

  const [q, setQ] = useState("");
  const [cat, setCat] = useState(urlCategory && categories.some((c) => c.slug === urlCategory) ? urlCategory : "All");
  const [sort, setSort] = useState("new");

  const list = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (cat === "All" || p.category.slug === cat) &&
            p.name.toLowerCase().includes(q.toLowerCase()) &&
            (!isSale || !!p.salePrice)
        )
        .sort((a, b) =>
          sort === "low"
            ? (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
            : sort === "high"
              ? (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
              : 0
        ),
    [q, cat, sort, products, isSale]
  );

  return (
    <>
      <div className="flex flex-col justify-between gap-5 border-b border-[#eadde3] pb-7 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{isSale ? "SALE" : "SHOP"}</p>
          <h1 className="serif mt-2 text-5xl">{isSale ? "Хямдралтай бараа" : "All outfits"}</h1>
          <p className="mt-3 text-zinc-500">{list.length} бүтээгдэхүүн</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat("All")} className={`filter-pill ${cat === "All" ? "active" : ""}`}>
            All
          </button>
          {categories.map((c) => (
            <button onClick={() => setCat(c.slug)} key={c.id} className={`filter-pill ${cat === c.slug ? "active" : ""}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <label className="flex flex-1 items-center rounded-full border border-[#eadde3] px-4">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="Бараа хайх..." />
        </label>
        <label className="flex items-center gap-2 rounded-full border border-[#eadde3] px-4">
          <SlidersHorizontal size={17} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent py-3 outline-none">
            <option value="new">Шинэ эхэнд</option>
            <option value="low">Үнэ: багаас</option>
            <option value="high">Үнэ: ихээс</option>
          </select>
        </label>
      </div>
      {list.length === 0 ? (
        <div className="card mt-9 p-14 text-center text-zinc-500">Илэрц олдсонгүй. Өөр үг эсвэл ангилал сонгоно уу.</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 py-9 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </>
  );
}
