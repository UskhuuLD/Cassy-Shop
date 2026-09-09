import "server-only";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Stock is intentionally NOT decremented when an order is placed — only once
// it's actually paid, so an abandoned/unpaid checkout never locks up
// inventory another customer could otherwise buy. This is the single place
// that flips an order to paid and performs that decrement, called from three
// places that can each independently notice a payment succeeded: the Wire
// webhook, the checkout success page's reconcile-with-Wire poll, and the
// admin orders page's sweep over still-pending Wire orders. The atomic
// `updateMany({ where: { paid: false } })` claim below means whichever of
// those gets there first is the only one that actually decrements stock,
// even if two of them race for the same order.
export async function confirmOrderPaid(orderCode: string, extra?: { wirePaymentIntentId?: string }): Promise<boolean> {
  const claimed = await prisma.$transaction(async (tx) => {
    const claim = await tx.order.updateMany({
      where: { code: orderCode, paid: false },
      data: { paid: true, ...(extra?.wirePaymentIntentId ? { wirePaymentIntentId: extra.wirePaymentIntentId } : {}) },
    });
    if (claim.count === 0) return false;

    const order = await tx.order.findUnique({ where: { code: orderCode }, include: { items: true } });
    if (!order) return false;

    for (const item of order.items) {
      await tx.productVariant.updateMany({
        where: {
          productId: item.productId,
          size: item.size || "ONE SIZE",
          color: item.color || "",
          stock: { gte: item.qty },
        },
        data: { stock: { decrement: item.qty } },
      });
    }
    return true;
  });

  if (claimed) {
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
  }
  return claimed;
}
