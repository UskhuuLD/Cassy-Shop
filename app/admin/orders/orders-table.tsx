"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction, deleteOrderAction } from "./actions";
import type { OrderStatus } from "@prisma/client";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

const statusLabels: Record<OrderStatus, string> = {
  NEW: "Шинэ",
  CONFIRMED: "Баталгаажсан",
  SHIPPED: "Илгээгдсэн",
  DELIVERED: "Хүргэгдсэн",
  CANCELLED: "Цуцлагдсан",
};

type OrderRow = {
  id: string;
  code: string;
  customer: string;
  phone: string;
  social: string;
  address: string;
  note: string;
  createdAt: Date;
  total: number;
  status: OrderStatus;
  pickup: boolean;
  paid: boolean;
  wirePaymentIntentId: string | null;
  items: { id: string; name: string; image: string; size: string; qty: number }[];
};

function PaymentBadge({ paid, wirePaymentIntentId }: { paid: boolean; wirePaymentIntentId: string | null }) {
  if (!wirePaymentIntentId) {
    return <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">Гараар</span>;
  }
  if (paid) {
    return <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-bold text-[#2e7d32]">Төлөгдсөн</span>;
  }
  return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Хүлээгдэж буй</span>;
}

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [rows, setRows] = useState(orders);
  const [isPending, startTransition] = useTransition();

  function onStatusChange(id: string, status: OrderStatus) {
    setRows((v) => v.map((o) => (o.id === id ? { ...o, status } : o)));
    startTransition(async () => {
      await updateOrderStatusAction(id, status);
    });
  }

  function onDelete(id: string) {
    if (!window.confirm("Энэ захиалгыг устгах уу?")) return;
    setRows((v) => v.filter((o) => o.id !== id));
    startTransition(async () => {
      await deleteOrderAction(id);
    });
  }

  return (
    <div className="card mt-8 overflow-x-auto">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead className="bg-[#f9edf2]">
          <tr>
            {["Дугаар", "Хэрэглэгч", "Утас", "Social", "Хаяг", "Бараа", "Огноо", "Дүн", "Төлбөр", "Статус", ""].map((label) => (
              <th className="p-4" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr className="border-t border-[#eadde3] align-top" key={order.id}>
              <td className="p-4 font-bold">{order.code}</td>
              <td className="p-4">{order.customer}</td>
              <td className="p-4">{order.phone}</td>
              <td className="max-w-48 p-4">{order.social || "—"}</td>
              <td className="max-w-56 p-4">
                {order.pickup && (
                  <span className="mb-1 inline-block rounded-full bg-[#f2dbe4] px-3 py-1 text-xs font-bold text-[#7a3352]">
                    Очиж авах
                  </span>
                )}
                <p>{order.address}</p>
                {order.note ? <p className="mt-1 text-xs text-zinc-500">Тайлбар: {order.note}</p> : null}
              </td>
              <td className="p-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      {item.image && <img src={item.image} alt="" className="h-10 w-8 rounded object-cover" />}
                      <span>
                        {item.name}
                        <br />
                        <span className="text-xs text-zinc-500">
                          {item.size} × {item.qty}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="whitespace-nowrap p-4">{new Date(order.createdAt).toLocaleString("mn-MN")}</td>
              <td className="whitespace-nowrap p-4 font-bold">{money(order.total)}</td>
              <td className="p-4">
                <PaymentBadge paid={order.paid} wirePaymentIntentId={order.wirePaymentIntentId} />
              </td>
              <td className="p-4">
                <select
                  className="rounded-full border border-[#eadde3] px-3 py-2"
                  value={order.status}
                  disabled={isPending}
                  onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-4">
                <button onClick={() => onDelete(order.id)} className="text-xs font-bold text-red-600">
                  Устгах
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
