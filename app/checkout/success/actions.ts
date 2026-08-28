"use server";

import { prisma } from "@/lib/prisma";
import { getPaymentIntent } from "@/lib/wire";

export async function getOrderPaymentStatusAction(orderCode: string): Promise<{ found: boolean; paid: boolean }> {
  const order = await prisma.order.findUnique({
    where: { code: orderCode },
    select: { paid: true, wirePaymentIntentId: true },
  });
  if (!order) return { found: false, paid: false };
  if (order.paid) return { found: true, paid: true };

  // Fallback in case Wire's webhook never arrives (misconfigured endpoint,
  // dropped delivery, etc.) — ask Wire directly whether this PaymentIntent
  // actually succeeded, and self-heal our record if so. This is what makes
  // the success page eventually show "paid" even if the webhook is broken.
  if (order.wirePaymentIntentId) {
    try {
      const intent = await getPaymentIntent(order.wirePaymentIntentId);
      if (intent.status === "succeeded") {
        await prisma.order.update({ where: { code: orderCode }, data: { paid: true } });
        return { found: true, paid: true };
      }
    } catch (err) {
      console.error("Wire PaymentIntent reconciliation check failed:", err);
    }
  }

  return { found: true, paid: false };
}
