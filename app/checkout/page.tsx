"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart-context";
import { shopInfo } from "@/lib/shop-info";
import { placeOrderAction } from "./actions";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [ok, setOk] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const deliveryFee = total >= shopInfo.freeDeliveryThreshold ? 0 : shopInfo.deliveryFee;
  const grandTotal = total + deliveryFee;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length || pending) return;
    setPending(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const result = await placeOrderAction(
      {
        customer: String(form.get("customer") || ""),
        phone: String(form.get("phone") || ""),
        address: String(form.get("address") || ""),
        instagram: String(form.get("instagram") || "").trim(),
        facebook: String(form.get("facebook") || "").trim(),
        note: String(form.get("note") || ""),
      },
      items.map((item) => ({ productId: item.product.id, size: item.size, qty: item.qty }))
    );

    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setOrderId(result.orderCode);
    setOk(true);
    clear();
  }

  if (ok) {
    return (
      <main className="container-page py-20">
        <div className="card mx-auto max-w-xl p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f2dbe4] text-2xl">✓</div>
          <h1 className="serif mt-5 text-4xl">Захиалга амжилттай</h1>
          <p className="mt-3 text-zinc-600">Захиалга admin хэсэгт нэмэгдлээ. Тантай утсаар холбогдоно.</p>
          <p className="mt-3 text-sm font-bold">Захиалгын дугаар: {orderId}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_390px]">
      <form onSubmit={submit} className="card p-6 md:p-8">
        <h1 className="serif text-4xl">Delivery details</h1>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <input name="customer" required className="input" placeholder="Овог нэр" />
          <input name="phone" required className="input" placeholder="Утасны дугаар" />
          <input name="address" required className="input md:col-span-2" placeholder="Дүүрэг, хороо, байр, тоот" />
          <input name="instagram" className="input" placeholder="Instagram нэр" />
          <input name="facebook" className="input" placeholder="Facebook нэр" />
          <textarea name="note" className="input min-h-28 md:col-span-2" placeholder="Нэмэлт тайлбар" />
        </div>

        <h2 className="mt-8 font-bold">Төлбөр</h2>
        <div className="mt-3 rounded-2xl border border-dashed border-[#cfaabc] bg-[#fdf6f9] p-5">
          <p className="font-bold">QPay integration placeholder</p>
          <p className="mt-1 text-sm text-zinc-500">Энд өөрийн QPay API-г холбоход зориулсан хэсэг үлдээсэн.</p>
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <button disabled={!items.length || pending} className="btn btn-dark mt-7 w-full disabled:opacity-40">
          {pending ? "Илгээж байна..." : "ЗАХИАЛГА БАТАЛГААЖУУЛАХ"}
        </button>
      </form>

      <aside className="card h-fit p-6">
        <h2 className="font-bold">Таны захиалга</h2>
        {items.map((item) => {
          const price = item.product.salePrice ?? item.product.price;
          return (
            <div key={item.product.id + item.size} className="mt-4 flex gap-3">
              <img src={item.product.image} alt={item.product.name} className="h-16 w-12 rounded-lg object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-zinc-500">
                  {item.size} × {item.qty}
                </p>
              </div>
              <b className="text-sm">{money(price * item.qty)}</b>
            </div>
          );
        })}
        <div className="mt-5 space-y-2 border-t border-[#eadde3] pt-5 text-sm">
          <div className="flex justify-between">
            <span>Бараа</span>
            <span>{money(total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Хүргэлт</span>
            <span>{deliveryFee ? money(deliveryFee) : "Үнэгүй"}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold">
            <span>Нийт</span>
            <span>{money(grandTotal)}</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
