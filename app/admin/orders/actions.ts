"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import type { OrderStatus } from "@prisma/client";
import type { ActionResult } from "@/app/admin/products/actions";

export async function updateOrderStatusAction(id: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, message: "Захиалгын төлөв шинэчлэгдлээ." };
}

export async function deleteOrderAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, message: "Захиалга устгагдлаа." };
}
