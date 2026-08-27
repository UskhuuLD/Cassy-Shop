import SuccessStatus from "./success-status";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main className="container-page py-20">
      <div className="card mx-auto max-w-xl p-12 text-center">
        {order ? (
          <>
            <SuccessStatus orderCode={order} />
            <p className="mt-3 text-sm font-bold">Захиалгын дугаар: {order}</p>
          </>
        ) : (
          <p className="text-zinc-600">Захиалгын дугаар олдсонгүй.</p>
        )}
      </div>
    </main>
  );
}
