import "server-only";
import { prisma } from "@/lib/prisma";

export function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export async function getCategoriesWithCounts() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return categories;
}
