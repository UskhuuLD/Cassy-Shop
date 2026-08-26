"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { categorySchema } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import type { ActionResult } from "@/app/admin/products/actions";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Алдаа гарлаа." };

  const name = parsed.data.name;
  const baseSlug = slugify(name) || `category-${Date.now().toString(36)}`;
  let slug = baseSlug;
  let n = 2;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const count = await prisma.category.count();
  try {
    await prisma.category.create({ data: { name, slug, order: count } });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P2002") return { ok: false, message: "Ийм нэртэй ангилал өмнө нь бүртгэгдсэн байна." };
    throw err;
  }

  revalidateAll();
  return { ok: true, message: "Ангилал нэмэгдлээ." };
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Алдаа гарлаа." };

  await prisma.category.update({ where: { id }, data: { name: parsed.data.name } });
  revalidateAll();
  return { ok: true, message: "Ангилал шинэчлэгдлээ." };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return {
      ok: false,
      message: `Энэ ангилалд ${productCount} бараа байгаа тул устгах боломжгүй. Эхлээд тэдгээр барааг өөр ангилалд шилжүүлнэ үү.`,
    };
  }
  await prisma.category.delete({ where: { id } });
  revalidateAll();
  return { ok: true, message: "Ангилал устгагдлаа." };
}
