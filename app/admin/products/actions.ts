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

// Images (url + optional color tag) are submitted as a single JSON-encoded
// field rather than comma-joined, because a data: URL — used as a fallback
// when Cloudinary isn't configured — always contains its own comma
// ("data:image/jpeg;base64,<payload>"), which would corrupt a joined/split
// list. See product-form.tsx's use of formData.set("images", JSON.stringify(...)).
function readImages(formData: FormData): { url: string; color: string }[] {
  const raw = formData.get("images");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is { url: unknown; color?: unknown } => !!x && typeof x.url === "string")
      .map((x) => ({ url: x.url as string, color: typeof x.color === "string" ? x.color : "" }));
  } catch {
    return [];
  }
}

// Variants (size + color + stock) are submitted as a single JSON-encoded
// field for the same reason images are — see readImages below.
function readVariants(formData: FormData): { size: string; color: string; stock: number }[] {
  const raw = formData.get("variants");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is { size: unknown; color?: unknown; stock: unknown } => !!x && typeof x.size === "string")
      .map((x) => ({
        size: x.size as string,
        color: typeof x.color === "string" ? x.color : "",
        stock: Number(x.stock) || 0,
      }));
  } catch {
    return [];
  }
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    price: formData.get("price"),
    salePrice: formData.get("salePrice") ? formData.get("salePrice") : null,
    categoryId: formData.get("categoryId"),
    sizes: readListField(formData, "sizes"),
    colors: readListField(formData, "colors"),
    images: readImages(formData),
    variants: readVariants(formData),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    isNew: formData.get("isNew") === "on" || formData.get("isNew") === "true",
    isBestSeller: formData.get("isBestSeller") === "on" || formData.get("isBestSeller") === "true",
    isComingSoon: formData.get("isComingSoon") === "on" || formData.get("isComingSoon") === "true",
    comingSoonDays: formData.get("comingSoonDays") ? formData.get("comingSoonDays") : null,
  });
}

// A day count re-typed in the form always restarts the countdown from now;
// leaving it blank keeps whatever expiry (or lack of one) was already set.
function computeComingSoonUntil(isComingSoon: boolean, days: number | null | undefined, existingUntil: Date | null): Date | null {
  if (!isComingSoon) return null;
  if (days) return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return existingUntil;
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
      sizes: data.sizes,
      colors: data.colors,
      isActive: data.isActive,
      isNew: data.isNew,
      isBestSeller: data.isBestSeller,
      isComingSoon: data.isComingSoon,
      comingSoonUntil: computeComingSoonUntil(data.isComingSoon, data.comingSoonDays, null),
      images: { create: data.images.map((img, position) => ({ url: img.url, color: img.color, position })) },
      variants: { create: data.variants },
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
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice ?? null,
        categoryId: data.categoryId,
        sizes: data.sizes,
        colors: data.colors,
        isActive: data.isActive,
        isNew: data.isNew,
          isBestSeller: data.isBestSeller,
        isComingSoon: data.isComingSoon,
        comingSoonUntil: computeComingSoonUntil(data.isComingSoon, data.comingSoonDays, existing.comingSoonUntil),
        images: { create: data.images.map((img, position) => ({ url: img.url, color: img.color, position })) },
        variants: { create: data.variants },
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
