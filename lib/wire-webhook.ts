import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const TOLERANCE_SECONDS = 300;

/**
 * Verifies a `WirePayment-Signature: t=<unix>,v1=<hex>` header per Wire's docs:
 * expected = HMAC_SHA256(secret, `${t}.${rawBody}`), reject if `now - t >= 300`.
 * Must be called with the raw, unparsed request body (signature is computed
 * over the exact bytes Wire sent, not a re-serialized JSON.parse of it).
 */
export function verifyWireSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k, v];
    })
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const timestamp = Number(t);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) >= TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}
