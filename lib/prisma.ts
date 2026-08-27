import { Prisma, PrismaClient } from "@prisma/client";

const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1200;

function isRetryable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) return RETRYABLE_CODES.has(error.code);
  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Neon's free tier suspends its compute after a period of inactivity; the
  // first query after that "cold start" can fail before the database finishes
  // waking back up. Retry transient connection errors instead of surfacing
  // them to users.
  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            if (attempt >= MAX_RETRIES || !isRetryable(error)) throw error;
            await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
          }
        }
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
