import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const publicProductInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type PublicProduct = Prisma.ProductGetPayload<{ include: typeof publicProductInclude }>;

export function getActiveProducts(params?: { category?: string; sale?: boolean; q?: string }) {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (params?.category && params.category !== "All") {
    where.category = { slug: params.category };
  }
  if (params?.sale) {
    where.salePrice = { not: null };
  }
  if (params?.q) {
    where.name = { contains: params.q, mode: "insensitive" };
  }
  return prisma.product.findMany({
    where,
    include: publicProductInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: publicProductInclude,
  });
}

export function getNewArrivals(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: publicProductInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function getBestSellers(take = 4) {
  return prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    include: publicProductInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function getProductsByIds(ids: string[]) {
  if (!ids.length) return Promise.resolve([]);
  return prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: publicProductInclude,
  });
}

// ---- Admin: sees everything, including disabled products ----
export function getAllProductsAdmin() {
  return prisma.product.findMany({
    include: publicProductInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function getProductByIdAdmin(id: string) {
  return prisma.product.findUnique({ where: { id }, include: publicProductInclude });
}
