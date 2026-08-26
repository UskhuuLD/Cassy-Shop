"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/components/wishlist-context";
import ProductCard from "@/components/product-card";
import { getWishlistProductsAction } from "./actions";
import type { PublicProduct } from "@/lib/products";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getWishlistProductsAction(ids)
      .then(setProducts)
      .finally(() => setReady(true));
  }, [ids]);

  return (
    <main className="container-page py-10">
      <p className="eyebrow">SAVED</p>
      <h1 className="serif mt-2 text-5xl">Таалагдсан бараа</h1>
      {!ready ? (
        <div className="card mt-8 p-12 text-center text-zinc-500">Ачааллаж байна...</div>
      ) : products.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p>Таалагдсан бараа алга байна.</p>
          <Link href="/products" className="btn btn-dark mt-5">
            SHOP OUTFITS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 py-9 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}
