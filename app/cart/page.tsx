"use client";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { shopInfo } from "@/lib/shop-info";

const m = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

export default function Cart() {
  const { items, total, remove, change } = useCart();
  const deliveryFee = total >= shopInfo.freeDeliveryThreshold ? 0 : shopInfo.deliveryFee;

  return (
    <main className="container-page py-10">
      <h1 className="serif text-5xl">Your bag</h1>
      {!items.length ? (
        <div className="card mt-8 p-12 text-center">
          <p>Таны сагс хоосон байна.</p>
          <Link href="/products" className="btn btn-dark mt-5">
            SHOP OUTFITS
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((x) => {
              const price = x.product.salePrice ?? x.product.price;
              return (
                <div key={x.product.id + x.size} className="card flex gap-4 p-4">
                  <img src={x.product.image} className="h-36 w-28 rounded-2xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold">{x.product.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">Size: {x.size}</p>
                      </div>
                      <button onClick={() => remove(x.product.id, x.size)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-[#eadde3]">
                        <button className="p-2" onClick={() => change(x.product.id, x.size, x.qty - 1)}>
                          <Minus size={15} />
                        </button>
                        <span className="px-2 text-sm">{x.qty}</span>
                        <button className="p-2" onClick={() => change(x.product.id, x.size, x.qty + 1)}>
                          <Plus size={15} />
                        </button>
                      </div>
                      <b>{m(price * x.qty)}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="card h-fit p-6">
            <h2 className="text-xl font-bold">Order summary</h2>
            <div className="mt-5 flex justify-between text-sm">
              <span>Барааны дүн</span>
              <span>{m(total)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span>Хүргэлт</span>
              <span>{deliveryFee ? m(deliveryFee) : "Үнэгүй"}</span>
            </div>
            <div className="my-5 border-t border-[#eadde3]" />
            <div className="flex justify-between text-lg font-bold">
              <span>Нийт</span>
              <span>{m(total + deliveryFee)}</span>
            </div>
            <Link href="/checkout" className="btn btn-dark mt-6 w-full">
              ЗАХИАЛГА ҮРГЭЛЖЛҮҮЛЭХ
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
