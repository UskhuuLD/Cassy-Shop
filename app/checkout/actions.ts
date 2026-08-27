"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { shopInfo } from "@/lib/shop-info";
import { getCustomerSession } from "@/lib/customer-auth";
import { createPaymentIntent, createCheckoutSession } from "@/lib/wire";

export type CheckoutCartItem = { productId: string; size: string; qty: number };

export type CheckoutResult =
  | { ok: true; orderCode: string; checkoutUrl?: string }
  | { ok: false; message: string };

export async function placeOrderAction(
  customer: { phone: string; address: string; instagram: string; facebook: string; note: string },
  cartItems: CheckoutCartItem[]
): Promise<CheckoutResult> {
  if (!cartItems.length) return { ok: false, message: "Сагс хоосон байна." };
  if (!customer.phone.trim() || !customer.address.trim()) {
    return { ok: false, message: "Утас, хаягаа бүрэн бөглөнө үү." };
  }
  if (!customer.instagram.trim() && !customer.facebook.trim()) {
    return { ok: false, message: "Instagram эсвэл Facebook нэрийн аль нэгийг бөглөнө үү." };
  }

  const productIds = [...new Set(cartItems.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Aggregate requested qty per product to check stock accurately even with multiple sizes
  const requestedQtyByProduct = new Map<string, number>();
  for (const item of cartItems) {
    requestedQtyByProduct.set(item.productId, (requestedQtyByProduct.get(item.productId) || 0) + item.qty);
  }

  for (const [productId, qty] of requestedQtyByProduct) {
    const product = productMap.get(productId);
    if (!product || !product.isActive) {
      return { ok: false, message: "Сагс дахь зарим бараа дэлгүүрээс хасагдсан байна. Сагсаа шинэчилнэ үү." };
    }
    if (product.stock < qty) {
      return { ok: false, message: `"${product.name}" барааны үлдэгдэл хүрэлцэхгүй байна (үлдэгдэл: ${product.stock}).` };
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + (product.salePrice ?? product.price) * item.qty;
  }, 0);
  const deliveryFee = subtotal >= shopInfo.freeDeliveryThreshold ? 0 : shopInfo.deliveryFee;
  const total = subtotal + deliveryFee;
  const code = `CS-${Date.now().toString().slice(-8)}`;

  const social = [customer.instagram && `IG: ${customer.instagram}`, customer.facebook && `FB: ${customer.facebook}`]
    .filter(Boolean)
    .join(" • ");
  const customerLabel = customer.instagram.trim() ? `@${customer.instagram.trim()}` : `@${customer.facebook.trim()}`;

  const session = await getCustomerSession();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          code,
          userId: session?.userId,
          customer: customerLabel,
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          social,
          note: customer.note.trim(),
          deliveryFee,
          total,
          items: {
            create: cartItems.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: product.id,
                name: product.name,
                image: product.images[0]?.url || "",
                size: item.size,
                qty: item.qty,
                price: product.salePrice ?? product.price,
              };
            }),
          },
        },
      });

      for (const [productId, qty] of requestedQtyByProduct) {
        const result = await tx.product.updateMany({
          where: { id: productId, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (result.count === 0) {
          throw new Error(`STOCK_CONFLICT:${productId}`);
        }
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.startsWith("STOCK_CONFLICT")) {
      return { ok: false, message: "Захиалга өгөх завсарт үлдэгдэл дуусчихлаа. Сагсаа шинэчлээд дахин оролдоно уу." };
    }
    return { ok: false, message: "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }

  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  for (const p of products) revalidatePath(`/products/${p.slug}`);

  // The order (and its stock decrement) is already committed above regardless
  // of what happens next — QPay is an additive online-payment option on top of
  // the existing COD/manual-transfer flow, not a replacement for it. If Wire
  // isn't configured, or the account/API call fails for any reason (e.g. no
  // connector attached yet on Wire's side), we fall back to the plain "order
  // placed, we'll contact you" flow instead of losing the sale.
  let checkoutUrl: string | undefined;
  if (process.env.WIRE_API_KEY) {
    try {
      const intent = await createPaymentIntent({
        amountMnt: total,
        description: `Cassy Shop захиалга ${code}`,
        orderCode: code,
      });
      const h = await headers();
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const origin = `${protocol}://${h.get("host")}`;
      const wireSession = await createCheckoutSession({
        paymentIntentId: intent.id,
        successUrl: `${origin}/checkout/success?order=${code}`,
        cancelUrl: `${origin}/checkout`,
        orderCode: code,
      });
      await prisma.order.update({
        where: { code },
        data: { wirePaymentIntentId: intent.id, wireCheckoutUrl: wireSession.url },
      });
      checkoutUrl = wireSession.url;
    } catch (err) {
      console.error("Wire checkout creation failed, falling back to COD flow:", err);
    }
  }

  return { ok: true, orderCode: code, checkoutUrl };
}
