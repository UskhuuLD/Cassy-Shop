import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminPublicRoute = createRouteMatcher(["/admin/login(.*)", "/admin/unauthorized"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isAdminRoute(req) || isAdminPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

  if (!isAdminEmail(email)) {
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
