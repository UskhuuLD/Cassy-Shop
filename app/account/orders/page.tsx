import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

const money = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";
const dateFmt = new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium", timeStyle: "short" });

const statusLabel: Record<OrderStatus, string> = {
  NEW: "Шинэ",
  CONFIRMED: "Баталгаажсан",
  SHIPPED: "Илгээгдсэн",
  DELIVERED: "Хүргэгдсэн",
  CANCELLED: "Цуцлагдсан",
};

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container-page py-12">
      <h1 className="serif text-4xl">Миний захиалга</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-zinc-500">
          Танд одоогоор захиалга байхгүй байна.{" "}
          <Link href="/products" className="font-bold text-[#2b2027]">
            Дэлгүүр лүү очих
          </Link>
        </p>
      ) : (
        <div className="mt-7 space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">Захиалга #{order.code}</p>
                  <p className="text-sm text-zinc-500">{dateFmt.format(order.createdAt)}</p>
                </div>
                <span className="rounded-full bg-[#f2dbe4] px-3 py-1 text-xs font-bold text-[#7a3352]">
                  {statusLabel[order.status]}
                </span>
              </div>
              <div className="mt-4 divide-y divide-[#eadde3]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5 text-sm">
                    {item.image && <img src={item.image} alt="" className="h-12 w-9 rounded-lg object-cover" />}
                    <span className="flex-1">
                      {item.name} {item.size ? `(${item.size})` : ""} × {item.qty}
                    </span>
                    <span className="font-semibold">{money(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-[#eadde3] pt-4 text-sm font-bold">
                <span>Нийт дүн</span>
                <span>{money(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
