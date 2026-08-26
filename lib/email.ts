import "server-only";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing. Set it in your environment variables.");
  }
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "Cassy Shop <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to,
    subject: "Нууц үг сэргээх хүсэлт — Cassy Shop",
    html: `
      <p>Сайн байна уу,</p>
      <p>Таны Cassy Shop акаунтын нууц үг сэргээх хүсэлт ирлээ. Доорх линк дээр дарж шинэ нууц үг тохируулна уу (1 цагийн дотор хүчинтэй):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлож болно.</p>
    `,
  });
}
