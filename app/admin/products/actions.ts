"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { productSchema } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import { uploadProductImage } from "@/lib/cloudinary";

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

function revalidateStorefront(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/wishlist");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/products/${slug}`);
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `product-${Date.now().toString(36)}`;
  let candidate = root;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

function readListField(formData: FormData, key: string): string[] {
  const raw = formData.get(key);
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    price: formData.get("price"),
    salePrice: formData.get("salePrice") ? formData.get("salePrice") : null,
    categoryId: formData.get("categoryId"),
    stock: formData.get("stock"),
    sizes: readListField(formData, "sizes"),
    colors: readListField(formData, "colors"),
    images: readListField(formData, "images"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    isNew: formData.get("isNew") === "on" || formData.get("isNew") === "true",
    isBestSeller: formData.get("isBestSeller") === "on" || formData.get("isBestSeller") === "true",
  });
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Мэдээлэл дутуу байна." };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(data.name);

  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      salePrice: data.salePrice ?? null,
      categoryId: data.categoryId,
      stock: data.stock,
      sizes: data.sizes,
      colors: data.colors,
      isActive: data.isActive,
      isNew: data.isNew,
      isBestSeller: data.isBestSeller,
      images: { create: data.images.map((url, position) => ({ url, position })) },
    },
  });

  revalidateStorefront(slug);
  return { ok: true, message: "Бараа амжилттай нэмэгдлээ." };
}

export async function updateProductAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, message: "Бараа олдсонгүй." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Мэдээлэл дутуу байна." };
  }
  const data = parsed.data;
  const slug = data.name !== existing.name ? await uniqueSlug(data.name, id) : existing.slug;

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice ?? null,
        categoryId: data.categoryId,
        stock: data.stock,
        sizes: data.sizes,
        colors: data.colors,
        isActive: data.isActive,
        isNew: data.isNew,
        isBestSeller: data.isBestSeller,
        images: { create: data.images.map((url, position) => ({ url, position })) },
      },
    }),
  ]);

  revalidateStorefront(slug);
  if (slug !== existing.slug) revalidateStorefront(existing.slug);
  return { ok: true, message: "Бараа шинэчлэгдлээ." };
}

export type DeleteProductResult =
  | { ok: true; message: string }
  | { ok: false; message: string; requiresConfirmation?: boolean; orderCount?: number };

export async function deleteProductAction(id: string, confirmed = false): Promise<DeleteProductResult> {
  await requireAdmin();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, message: "Бараа олдсонгүй." };

  const orderCount = await prisma.orderItem
    .findMany({ where: { productId: id }, select: { orderId: true }, distinct: ["orderId"] })
    .then((rows) => rows.length);

  if (orderCount > 0 && !confirmed) {
    return {
      ok: false,
      requiresConfirmation: true,
      orderCount,
      message: `⚠️ Энэ бараа ${orderCount} захиалгад орсон байна. Устгавал захиалгын түүхэн мэдээлэл алдагдаж болзошгүй. Үүний оронд идэвхгүй болгохыг зөвлөж байна.`,
    };
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P2003") {
      return {
        ok: false,
        message: "Энэ барааг устгах боломжгүй — өмнө нь захиалгад орсон байна. Үүний оронд идэвхгүй болгоно уу.",
      };
    }
    throw err;
  }

  revalidateStorefront(existing.slug);
  return { ok: true, message: "Бараа устгагдлаа." };
}

export async function toggleProductActiveAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, message: "Бараа олдсонгүй." };

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidateStorefront(updated.slug);
  return { ok: true, message: updated.isActive ? "Бараа идэвхжлээ." : "Бараа идэвхгүй боллоо." };
}

export async function deactivateProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, message: "Бараа олдсонгүй." };

  const updated = await prisma.product.update({ where: { id }, data: { isActive: false } });
  revalidateStorefront(updated.slug);
  return { ok: true, message: "Бараа идэвхгүй боллоо." };
}

export async function updateStockAction(id: string, stock: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isFinite(stock) || stock < 0) {
    return { ok: false, message: "Нөөц зөв тоо байх ёстой." };
  }
  const updated = await prisma.product.update({ where: { id }, data: { stock } });
  revalidateStorefront(updated.slug);
  return { ok: true, message: "Нөөц шинэчлэгдлээ." };
}

export async function uploadImageAction(dataUrl: string): Promise<{ url: string } | { error: string }> {
  await requireAdmin();
  if (!dataUrl.startsWith("data:image/")) {
    return { error: "Зөвхөн зургийн файл оруулна уу." };
  }
  if (dataUrl.length > 8_000_000) {
    return { error: "Зургийн хэмжээ хэт том байна (10MB-с бага байх ёстой)." };
  }
  try {
    const url = await uploadProductImage(dataUrl);
    return { url };
  } catch {
    return { error: "Зураг оруулахад алдаа гарлаа." };
  }
}
