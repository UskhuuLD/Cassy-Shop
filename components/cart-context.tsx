"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
};

export type CartItem = { product: CartProduct; size: string; qty: number };

type Ctx = {
  items: CartItem[];
  add: (p: CartProduct, size: string) => void;
  remove: (id: string, size: string) => void;
  change: (id: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("cassy-cart") || "[]"));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("cassy-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      add: (product, size) =>
        setItems((v) => {
          const i = v.find((x) => x.product.id === product.id && x.size === size);
          return i ? v.map((x) => (x === i ? { ...x, qty: x.qty + 1 } : x)) : [...v, { product, size, qty: 1 }];
        }),
      remove: (id, size) => setItems((v) => v.filter((x) => !(x.product.id === id && x.size === size))),
      change: (id, size, qty) =>
        setItems((v) => v.map((x) => (x.product.id === id && x.size === size ? { ...x, qty: Math.max(1, qty) } : x))),
      clear: () => setItems([]),
      count: items.reduce((s, x) => s + x.qty, 0),
      total: items.reduce((s, x) => s + (x.product.salePrice ?? x.product.price) * x.qty, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const v = useContext(CartContext);
  if (!v) throw new Error("CartProvider missing");
  return v;
};
