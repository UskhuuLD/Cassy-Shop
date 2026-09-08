import "server-only";
import { prisma } from "@/lib/prisma";

export function getFaqs() {
  return prisma.faqItem.findMany({ orderBy: { order: "asc" } });
}
