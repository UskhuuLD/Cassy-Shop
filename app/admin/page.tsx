import AdminNav from "@/components/admin-nav";
import RevenueChart, { RevenuePoint } from "@/components/revenue-chart";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const m = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

async function getLast7DaysRevenue(): Promise<RevenuePoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    select: { createdAt: true, total: true },
  });

  const days: RevenuePoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const label = `${String(day.getMonth() + 1).padStart(2, "0")}/${String(day.getDate()).padStart(2, "0")}`;
    const total = orders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.toDateString() === day.toDateString();
      })
      .reduce((sum, o) => sum + o.total, 0);
    days.push({ d: label, v: total });
  }
  return days;
}

export default async function Admin() {
  const [totalProducts, activeProducts, outOfStock, totalOrders, revenueAgg, revenueData, bestSellers] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      getLast7DaysRevenue(),
      prisma.orderItem.groupBy({
        by: ["productId", "name"],
        _sum: { qty: true },
        orderBy: { _sum: { qty: "desc" } },
        take: 5,
      }),
    ]);

  const totalRevenue = revenueAgg._sum.total ?? 0;
  const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <main className="container-page py-10">
      <AdminNav />
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[.2em] text-[#a76f83]">ADMIN</p>
          <h1 className="serif mt-2 text-5xl">Dashboard</h1>
        </div>
        <p className="text-sm text-zinc-500">{new Date().toLocaleDateString("mn-MN")}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Нийт орлого", m(totalRevenue)],
          ["Нийт захиалга", totalOrders],
          ["Идэвхтэй бараа", `${activeProducts}/${totalProducts}`],
          ["Дуусаж буй бараа", outOfStock],
        ].map(([a, b]) => (
          <div className="card p-5" key={a as string}>
            <p className="text-sm text-zinc-500">{a}</p>
            <p className="mt-2 text-2xl font-bold">{b}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">7 хоногийн орлого</h2>
          <p className="text-sm text-zinc-500">Цуцлагдаагүй захиалгын дүнгээр тооцов. Дундаж захиалга: {m(avgOrder || 0)}</p>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Сүүлийн захиалгууд</h2>
            <a href="/admin/orders" className="text-sm font-bold text-[#a76f83] hover:underline">
              Бүгдийг харах →
            </a>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-zinc-500">Одоогоор захиалга алга.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="pb-3 font-semibold">Дугаар</th>
                    <th className="pb-3 font-semibold">Хэрэглэгч</th>
                    <th className="pb-3 font-semibold">Дүн</th>
                    <th className="pb-3 font-semibold">Төлөв</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-[#eadde3]">
                      <td className="py-3 font-bold">{o.code}</td>
                      <td className="py-3">{o.customer}</td>
                      <td className="py-3 font-bold">{m(o.total)}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-[#f9edf2] px-3 py-1 text-xs font-bold text-[#a76f83]">{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-5 text-xl font-bold">Хамгийн их зарагдсан</h2>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-zinc-500">Захиалга хийгдээгүй байна.</p>
          ) : (
            <ol className="space-y-3">
              {bestSellers.map((b, i) => (
                <li key={b.productId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#f9edf2] text-xs font-bold text-[#a76f83]">
                      {i + 1}
                    </span>
                    {b.name}
                  </span>
                  <b>{b._sum.qty ?? 0} ширхэг</b>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </main>
  );
}
