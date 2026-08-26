import AdminNav from "@/components/admin-nav";
import { prisma } from "@/lib/prisma";
import OrdersTable from "./orders-table";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <main className="container-page py-10">
      <AdminNav />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="serif text-5xl">Захиалгууд</h1>
          <p className="mt-2 text-sm text-zinc-500">Checkout-оор орсон захиалга энд автоматаар нэмэгдэнэ.</p>
        </div>
        <div className="rounded-full bg-[#f9edf2] px-4 py-2 text-sm font-bold">Нийт: {orders.length}</div>
      </div>

      {orders.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-lg font-bold">Одоогоор захиалга алга</p>
          <p className="mt-2 text-sm text-zinc-500">Хэрэглэгч checkout дээр захиалга баталгаажуулахад энд гарч ирнэ.</p>
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </main>
  );
}
