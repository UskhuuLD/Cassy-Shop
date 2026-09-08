"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { faqSchema } from "@/lib/validation";
import type { ActionResult } from "@/app/admin/products/actions";

function revalidateAll() {
  revalidatePath("/faq");
  revalidatePath("/");
  revalidatePath("/admin/faq");
}

function parseFaqForm(formData: FormData) {
  return faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
  });
}

export async function createFaqAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseFaqForm(formData);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Алдаа гарлаа." };

  const count = await prisma.faqItem.count();
  await prisma.faqItem.create({ data: { ...parsed.data, order: count } });

  revalidateAll();
  return { ok: true, message: "Асуулт нэмэгдлээ." };
}

export async function updateFaqAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = parseFaqForm(formData);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Алдаа гарлаа." };

  await prisma.faqItem.update({ where: { id }, data: parsed.data });
  revalidateAll();
  return { ok: true, message: "Асуулт шинэчлэгдлээ." };
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.faqItem.delete({ where: { id } });
  revalidateAll();
  return { ok: true, message: "Асуулт устгагдлаа." };
}
