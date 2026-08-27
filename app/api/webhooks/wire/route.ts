import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWireSignature } from "@/lib/wire-webhook";

type WireEvent = {
  id: string;
  type: string;
  livemode: boolean;
  data: {
    object: {
      id: string;
      amount?: number;
      metadata?: Record<string, string>;
    };
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.WIRE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("WIRE_WEBHOOK_SECRET is not set — rejecting webhook.");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("WirePayment-Signature");

  if (!verifyWireSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: WireEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  // Wire pings this on endpoint creation to activate it — just ack it.
  if (event.type === "endpoint.verification") {
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const orderCode = event.data.object.metadata?.order_code;
    if (!orderCode) {
      console.error("payment_intent.succeeded webhook missing metadata.order_code", event.data.object.id);
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({ where: { code: orderCode } });
    if (!order) {
      console.error("payment_intent.succeeded webhook references unknown order code", orderCode);
      return NextResponse.json({ received: true });
    }

    await prisma.order.update({
      where: { code: orderCode },
      data: { paid: true, wirePaymentIntentId: event.data.object.id },
    });
  }

  // Always 2xx for events we recognize but don't act on (e.g. payment_intent.payment_failed) —
  // returning an error would make Wire keep retrying delivery indefinitely.
  return NextResponse.json({ received: true });
}
