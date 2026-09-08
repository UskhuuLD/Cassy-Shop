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

export type CartItem = { product: CartProduct; size: string; color: string; qty: number };

type Ctx = {
  items: CartItem[];
  add: (p: CartProduct, size: string, color: string) => void;
  remove: (id: string, size: string, color: string) => void;
  change: (id: string, size: string, color: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("cassy-cart") || "[]");
      setItems(Array.isArray(parsed) ? parsed.map((x: CartItem) => ({ ...x, color: x.color ?? "" })) : []);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("cassy-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      add: (product, size, color) =>
        setItems((v) => {
          const i = v.find((x) => x.product.id === product.id && x.size === size && x.color === color);
          return i ? v.map((x) => (x === i ? { ...x, qty: x.qty + 1 } : x)) : [...v, { product, size, color, qty: 1 }];
        }),
      remove: (id, size, color) =>
        setItems((v) => v.filter((x) => !(x.product.id === id && x.size === size && x.color === color))),
      change: (id, size, color, qty) =>
        setItems((v) =>
          v.map((x) => (x.product.id === id && x.size === size && x.color === color ? { ...x, qty: Math.max(1, qty) } : x))
        ),
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
