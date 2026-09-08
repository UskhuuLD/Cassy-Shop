// Pure stock helpers shared by server and client components — kept out of
// lib/products.ts because that file has `import "server-only"`, which breaks
// when client components (product-card.tsx, product-detail.tsx, the admin
// products table) import from it.
export function totalStock(p: { variants: { stock: number }[] }): number {
  return p.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function variantStock(
  p: { variants: { size: string; color: string; stock: number }[] },
  size: string,
  color: string
): number {
  const normalizedSize = size || "ONE SIZE";
  const normalizedColor = color || "";
  return p.variants.find((v) => v.size === normalizedSize && v.color === normalizedColor)?.stock ?? 0;
}
