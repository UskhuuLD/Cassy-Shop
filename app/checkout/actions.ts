"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { shopInfo } from "@/lib/shop-info";
import { getCustomerSession } from "@/lib/customer-auth";
import { createPaymentIntent, createCheckoutSession } from "@/lib/wire";

export type CheckoutCartItem = { productId: string; size: string; color: string; qty: number };

function variantKey(productId: string, size: string, color: string) {
  return `${productId}::${size || "ONE SIZE"}::${color || ""}`;
}

export type CheckoutResult =
  | { ok: true; orderCode: string; checkoutUrl?: string }
  | { ok: false; message: string };

export async function placeOrderAction(
  customer: { phone: string; address: string; instagram: string; facebook: string; note: string; pickup: boolean },
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
    include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Aggregate requested qty per exact (product, size, color) combo to check
  // stock accurately even when the same product appears multiple times.
  const requestedQtyByVariant = new Map<string, number>();
  for (const item of cartItems) {
    const key = variantKey(item.productId, item.size, item.color);
    requestedQtyByVariant.set(key, (requestedQtyByVariant.get(key) || 0) + item.qty);
  }

  // A variant that's out of (or short on) stock no longer blocks the order —
  // it becomes a захиалгаар ирнэ (made-to-order/backorder) item instead of a
  // lost sale. Only a genuinely invalid combo (not one of the product's
  // actual size/color options) is rejected.
  const variantByKey = new Map<string, { id: string; stock: number }>();
  for (const [key, qty] of requestedQtyByVariant) {
    const [productId, size, color] = key.split("::");
    const product = productMap.get(productId);
    if (!product || !product.isActive) {
      return { ok: false, message: "Сагс дахь зарим бараа дэлгүүрээс хасагдсан байна. Сагсаа шинэчилнэ үү." };
    }
    const variant = product.variants.find((v) => v.size === size && v.color === color);
    if (!variant) {
      return {
        ok: false,
        message: `"${product.name}" (${size}${color ? ", " + color : ""}) сонголт олдсонгүй. Сагсаа шинэчилнэ үү.`,
      };
    }
    variantByKey.set(key, variant);
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + (product.salePrice ?? product.price) * item.qty;
  }, 0);
  // Delivery is paid in cash to the driver on handover, not collected online —
  // `total` (what the QPay charge is for) is products only. `deliveryFee` is
  // still stored so the admin/driver knows how much to collect on delivery.
  const deliveryFee = customer.pickup ? 0 : subtotal >= shopInfo.freeDeliveryThreshold ? 0 : shopInfo.deliveryFee;
  const total = subtotal;
  const code = `CS-${Date.now().toString().slice(-8)}`;

  const social = [customer.instagram && `IG: ${customer.instagram}`, customer.facebook && `FB: ${customer.facebook}`]
    .filter(Boolean)
    .join(" • ");
  const customerLabel = customer.instagram.trim() ? `@${customer.instagram.trim()}` : `@${customer.facebook.trim()}`;

  const session = await getCustomerSession();

  // Stock is only reserved for real here, not decremented yet, when Wire
  // payment is coming next — an order the customer never actually pays for
  // (abandons the QPay page, closes the tab, etc.) must not lock up
  // inventory another customer could buy. confirmOrderPaid() (lib/order-payment.ts)
  // does the actual decrement once payment is confirmed, from three places:
  // the Wire webhook, the checkout success page's poll, and the admin orders
  // page's sweep. Without Wire configured there's no "paid" event coming at
  // all (COD/manual-transfer flow), so that case still decrements immediately.
  const usesOnlinePayment = !!process.env.WIRE_API_KEY;

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
          pickup: customer.pickup,
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
                color: item.color,
                qty: item.qty,
                price: product.salePrice ?? product.price,
              };
            }),
          },
        },
      });

      if (!usesOnlinePayment) {
        // gte guard just means a variant already at/below 0 stops decrementing
        // further — it doesn't block the order (захиалгаар ирнэ / backorder).
        for (const [key, qty] of requestedQtyByVariant) {
          const variant = variantByKey.get(key)!;
          await tx.productVariant.updateMany({
            where: { id: variant.id, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          });
        }
      }
    });
  } catch {
    return { ok: false, message: "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }

  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  for (const p of products) revalidatePath(`/products/${p.slug}`);

  // The order is already committed above regardless of what happens next —
  // QPay is an additive online-payment option on top of the existing
  // COD/manual-transfer flow, not a replacement for it. If Wire isn't
  // configured, or the account/API call fails for any reason (e.g. no
  // connector attached yet on Wire's side), we fall back to the plain "order
  // placed, we'll contact you" flow instead of losing the sale — and since
  // that means no "paid" event will ever arrive for this order, decrement its
  // stock right here instead of leaving it stuck reserved forever.
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
      for (const [key, qty] of requestedQtyByVariant) {
        const variant = variantByKey.get(key)!;
        await prisma.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
      }
    }
  }

  return { ok: true, orderCode: code, checkoutUrl };
}
