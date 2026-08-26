"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/customer-auth";

export async function registerAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email болон нууц үгээ оруулна уу." };
  }
  if (password.length < 6) {
    return { error: "Нууц үг дор хаяж 6 тэмдэгт байх ёстой." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Энэ email хаягаар бүртгэл өмнө нь үүссэн байна." };
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name: name || null, password: hash, role: "CUSTOMER" },
  });

  await createCustomerSession(user.id);
  redirect("/account/orders");
}
