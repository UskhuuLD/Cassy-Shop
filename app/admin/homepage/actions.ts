"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { SITE_CONTENT_KEY } from "@/lib/site-content";
import type { ActionResult } from "@/app/admin/products/actions";

export async function updateSiteContentAction(images: {
  heroImage?: string;
  styleEditImage1?: string;
  styleEditImage2?: string;
}): Promise<ActionResult> {
  await requireAdmin();

  await prisma.siteContent.upsert({
    where: { key: SITE_CONTENT_KEY },
    create: { key: SITE_CONTENT_KEY, ...images },
    update: images,
  });

  revalidatePath("/");
  return { ok: true, message: "Нүүр хуудасны зураг шинэчлэгдлээ." };
}
