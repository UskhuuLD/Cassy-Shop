import { NextRequest, NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/products";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ results: [] });

  const products = await getActiveProducts({ q });
  const results = products.slice(0, 6).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.salePrice ?? p.price,
    image: p.images[0]?.url || "/products/product-1.jpg",
  }));

  return NextResponse.json({ results });
}
