import "server-only";
import { prisma } from "@/lib/prisma";

const KEY = "shop";

export const defaultShopInfo = {
  name: "Cassy Online Shop",
  phone: "9911-2233",
  address: "Sunday Plaza 1 худалдааны төв, 7 давхар, лифтээр гараад баруун талаараа хойшоо чигээрээ яваад 710 тоот",
  delivery: "Хүргэлт 7,100₮ — буцаалтгүй",
  instagram: "cassy_online_shop",
  facebook: "cassyshoppe",
  hours: "Өдөр бүр 10:00–20:00",
};

export type ShopInfo = typeof defaultShopInfo;

export async function getShopInfo(): Promise<ShopInfo> {
  const row = await prisma.shopSettings.findUnique({ where: { key: KEY } });
  if (!row) return defaultShopInfo;
  return {
    name: row.name,
    phone: row.phone,
    address: row.address,
    delivery: row.delivery,
    instagram: row.instagram,
    facebook: row.facebook,
    hours: row.hours,
  };
}

export { KEY as SHOP_SETTINGS_KEY };
