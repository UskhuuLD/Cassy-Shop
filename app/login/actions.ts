"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, clearCustomerSession } from "@/lib/customer-auth";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email болон нууц үгээ оруулна уу." };
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
