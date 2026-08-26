import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default function AdminUnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fff7fa] px-4 py-16">
      <div className="card max-w-md p-8 text-center">
        <p className="serif text-3xl">Танд admin эрх байхгүй</p>
        <p className="mt-3 text-sm text-zinc-500">
          Энэ Google акаунт admin панелд хандах зөвшөөрөлгүй байна. Буруу акаунтаар нэвтэрсэн бол гараад зөв акаунтаараа
          дахин нэвтэрнэ үү.
        </p>
        <div className="mt-7 flex flex-col gap-2">
          <SignOutButton redirectUrl="/admin/login">
            <button className="btn btn-dark w-full">Гарах</button>
          </SignOutButton>
          <Link href="/" className="text-center text-sm text-zinc-500 hover:text-zinc-900">
            Дэлгүүр рүү буцах
          </Link>
        </div>
      </div>
    </main>
  );
}
