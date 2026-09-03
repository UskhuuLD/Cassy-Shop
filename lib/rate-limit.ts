import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/** Best-effort caller IP from Vercel's forwarded header. Falls back to a
 * constant bucket if unavailable (e.g. local dev without a proxy) rather
 * than throwing — rate limiting degrades gracefully instead of blocking
 * the feature entirely. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Sliding-window check: has `key` seen `max` or more attempts in the last
 * `windowMs`? Always records this attempt regardless of outcome, so repeated
 * calls keep consuming the window (can't be "refreshed" by checking without
 * recording). Call this BEFORE doing the actual work (password check, email
 * send, etc.) so a blocked caller never reaches it.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const count = await prisma.rateLimitAttempt.count({ where: { key, createdAt: { gte: windowStart } } });
  await prisma.rateLimitAttempt.create({ data: { key } });

  if (count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}
