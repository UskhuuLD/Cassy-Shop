"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, clearCustomerSession } from "@/lib/customer-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email болон нууц үгээ оруулна уу." };
  }

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`login:${ip}:${email}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
  if (!allowed) {
    return { error: "Хэт олон удаа буруу оролдлоо. 15 минутын дараа дахин оролдоно уу." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return { error: "Email эсвэл нууц үг буруу байна." };
  }

  await createCustomerSession(user.id);
  redirect("/account/orders");
}

export async function logoutAction() {
  await clearCustomerSession();
  redirect("/login");
}
