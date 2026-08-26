import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/** Throws if the current request is not an authenticated, allow-listed admin. Call at the top of every admin server action. */
export async function requireAdmin(): Promise<{ email: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED: Admin эрх шаардлагатай.");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null;
  if (!isAdminEmail(email)) {
    throw new Error("UNAUTHORIZED: Admin эрх шаардлагатай.");
  }

  return { email: email! };
}
