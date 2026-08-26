import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "cassy_customer_session";
const ALG = "HS256";

function getSecretKey() {
  const secret = process.env.CUSTOMER_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "CUSTOMER_SESSION_SECRET is missing or too short. Set a long random value in your environment variables."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createCustomerSession(userId: string) {
  const token = await new SignJWT({ userId, role: "CUSTOMER" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCustomerSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "CUSTOMER" || typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

/** Throws if the current request has no logged-in customer. Call at the top of account-only server actions/pages. */
export async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Нэвтэрсэн байх шаардлагатай.");
  }
  return session;
}

export { COOKIE_NAME as CUSTOMER_COOKIE_NAME };
