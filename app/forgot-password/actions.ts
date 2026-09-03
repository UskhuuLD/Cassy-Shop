"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const GENERIC_MESSAGE = "Хэрэв энэ имэйл бүртгэлтэй бол сэргээх линк илгээгдлээ. Имэйлээ шалгана уу.";
const FORGOT_MAX_ATTEMPTS = 3;
const FORGOT_WINDOW_MS = 60 * 60 * 1000;

export async function forgotPasswordAction(_prevState: { message?: string; error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    return { error: "Имэйлээ оруулна уу." };
  }

  // IP-only bucket (not email) — a wrong guess here can't be used to check
  // which emails are registered, since the rate-limit response is identical
  // no matter which email was tried.
  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`forgot:${ip}`, FORGOT_MAX_ATTEMPTS, FORGOT_WINDOW_MS);
  if (!allowed) {
    return { error: "Хэт олон удаа хүсэлт илгээлээ. Дараа дахин оролдоно уу." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.password) {
    try {
      const token = await createPasswordResetToken(user.id);
      const h = await headers();
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const resetUrl = `${protocol}://${h.get("host")}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  }

  // Always the same response, whether or not the email exists — otherwise this
  // endpoint could be used to check which emails are registered.
  return { message: GENERIC_MESSAGE };
}
