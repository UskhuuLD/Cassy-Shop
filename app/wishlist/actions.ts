"use server";

import { getProductsByIds } from "@/lib/products";

export async function getWishlistProductsAction(ids: string[]) {
  return getProductsByIds(ids);
}
