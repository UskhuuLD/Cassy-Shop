"use server";

import { prisma } from "@/lib/prisma";

export async function getOrderPaymentStatusAction(orderCode: string): Promise<{ found: boolean; paid: boolean }> {
  const order = await prisma.order.findUnique({ where: { code: orderCode }, select: { paid: true } });
  if (!order) return { found: false, paid: false };
  return { found: true, paid: order.paid };
}
