"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { consumePasswordResetToken } from "@/lib/password-reset";
import { createCustomerSession } from "@/lib/customer-auth";

export async function resetPasswordAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");

  if (!token) {
    return { error: "Линк буруу байна. /forgot-password хуудаснаас дахин хүсэлт илгээнэ үү." };
  }
  if (password.length < 6) {
    return { error: "Нууц үг дор хаяж 6 тэмдэгт байх ёстой." };
  }

  const userId = await consumePasswordResetToken(token);
  if (!userId) {
    return { error: "Линкийн хугацаа дууссан эсвэл өмнө нь ашиглагдсан байна. Дахин хүсэлт илгээнэ үү." };
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });

  await createCustomerSession(userId);
  redirect("/account/orders");
}
