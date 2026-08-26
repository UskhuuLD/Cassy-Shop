"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { SHOP_SETTINGS_KEY, type ShopInfo } from "@/lib/shop-settings";
import type { ActionResult } from "@/app/admin/products/actions";

export async function updateShopSettingsAction(data: ShopInfo): Promise<ActionResult> {
  await requireAdmin();

  for (const [key, value] of Object.entries(data)) {
    if (!String(value).trim()) {
      return { ok: false, message: `"${key}" талбарыг бөглөнө үү.` };
    }
  }

  await prisma.shopSettings.upsert({
    where: { key: SHOP_SETTINGS_KEY },
    create: { key: SHOP_SETTINGS_KEY, ...data },
    update: data,
  });

  revalidatePath("/", "layout");
  return { ok: true, message: "Дэлгүүрийн мэдээлэл шинэчлэгдлээ." };
}
