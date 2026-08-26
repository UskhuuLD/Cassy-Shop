import "server-only";
import { prisma } from "@/lib/prisma";

const KEY = "homepage";

const defaults = {
  heroImage: "/products/product-19.jpg",
  styleEditImage1: "/products/product-13.jpg",
  styleEditImage2: "/products/product-16.jpg",
};

export async function getSiteContent() {
  const row = await prisma.siteContent.findUnique({ where: { key: KEY } });
  return {
    heroImage: row?.heroImage || defaults.heroImage,
    styleEditImage1: row?.styleEditImage1 || defaults.styleEditImage1,
    styleEditImage2: row?.styleEditImage2 || defaults.styleEditImage2,
  };
}

export { KEY as SITE_CONTENT_KEY };
