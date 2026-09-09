import AdminNav from "@/components/admin-nav";
import { prisma } from "@/lib/prisma";
import { getPaymentIntent } from "@/lib/wire";
import { confirmOrderPaid } from "@/lib/order-payment";
import OrdersTable from "./orders-table";

export const dynamic = "force-dynamic";

// Self-heal orders whose Wire webhook never arrived (misconfigured endpoint,
// dropped delivery, signature/timestamp mismatch, etc.) — same reconciliation
// the checkout success page does, but here it covers every still-pending
// order each time an admin opens this page, not just the one the customer
// happens to revisit. confirmOrderPaid also decrements the paid order's
// variant stock — deferred until now instead of at checkout, so an
// abandoned/unpaid order never locks up inventory.
async function reconcilePendingWireOrders(orders: { code: string; paid: boolean; wirePaymentIntentId: string | null }[]) {
  if (!process.env.WIRE_API_KEY) return;
  const pending = orders.filter((o) => !o.paid && o.wirePaymentIntentId);
  await Promise.all(
    pending.map(async (o) => {
      try {
        const intent = await getPaymentIntent(o.wirePaymentIntentId!);
        if (intent.status === "succeeded") {
          const claimed = await confirmOrderPaid(o.code);
          if (claimed) o.paid = true;
        }
      } catch (err) {
        console.error(`Wire reconciliation failed for order ${o.code}:`, err);
      }
    })
  );
}

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  await reconcilePendingWireOrders(orders);

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
