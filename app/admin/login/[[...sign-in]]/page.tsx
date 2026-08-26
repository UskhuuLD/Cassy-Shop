import { SignIn } from "@clerk/nextjs";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fff7fa] px-4 py-16">
      <div className="text-center">
        <p className="serif text-3xl">Cassy Admin</p>
        <p className="mt-2 mb-7 text-sm text-zinc-500">Зөвхөн дэлгүүрийн админ Google-ээр нэвтэрнэ.</p>
        <SignIn fallbackRedirectUrl="/admin" signUpUrl="/admin/login" />
      </div>
    </main>
  );
}
