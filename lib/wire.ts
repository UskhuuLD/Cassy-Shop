import "server-only";

const BASE_URL = "https://api.wire.mn";

// VERIFIED 2026-08-27: despite the docs calling `amount` "Minor units (MNT ₮)",
// Wire's own hosted checkout page displays `amount: 12345` as literally
// "12,345₮" — confirmed by creating a real PaymentIntent + checkout session
// (never paid) and reading the rendered page. So for MNT, "minor unit" means
// whole ₮, not 1/100₮ as Stripe-style APIs usually mean. Do not reintroduce a
// ×100 conversion here.
export function mntToMinorUnits(amountMnt: number): number {
  return Math.round(amountMnt);
}

type WireError = {
  error: { type: string; code?: string; message: string; request_id?: string };
};

async function wireFetch<T>(path: string, options: { method: string; body?: object; idempotencyKey?: string }): Promise<T> {
  const apiKey = process.env.WIRE_API_KEY;
  if (!apiKey) {
    throw new Error("WIRE_API_KEY is missing. Set it in your environment variables.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) {
    const err = json as WireError;
    throw new Error(`Wire API error (${res.status}): ${err.error?.message || "unknown error"}`);
  }
  return json as T;
}

export type WirePaymentIntent = {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: "new" | "requires_payment_method" | "requires_action" | "requires_capture" | "processing" | "succeeded" | "canceled";
  client_secret: string;
  livemode: boolean;
  metadata: Record<string, string>;
};

export async function createPaymentIntent(params: {
  amountMnt: number;
  description: string;
  orderCode: string;
}): Promise<WirePaymentIntent> {
  return wireFetch<WirePaymentIntent>("/v1/payment_intents", {
    method: "POST",
    idempotencyKey: `pi-${params.orderCode}`,
    body: {
      amount: mntToMinorUnits(params.amountMnt),
      currency: "MNT",
      description: params.description,
      metadata: { order_code: params.orderCode },
    },
  });
}

export type WireCheckoutSession = {
  id: string;
  object: "checkout.session";
  url: string;
  payment_intent: string;
};

export async function createCheckoutSession(params: {
  paymentIntentId: string;
  successUrl: string;
  cancelUrl: string;
  orderCode: string;
}): Promise<WireCheckoutSession> {
  return wireFetch<WireCheckoutSession>("/v1/checkout/sessions", {
    method: "POST",
    idempotencyKey: `sess-${params.orderCode}`,
    body: {
      payment_intent: params.paymentIntentId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    },
  });
}
