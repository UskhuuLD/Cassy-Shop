import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default function AdminNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-[#eadde3] bg-white p-3">
      <Link className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#f9edf2]" href="/admin">
        Dashboard
      </Link>
      <Link className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#f9edf2]" href="/admin/orders">
        Захиалга
      </Link>
      <Link className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#f9edf2]" href="/admin/products">
        Бараа
      </Link>
      <Link className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#f9edf2]" href="/admin/categories">
        Ангилал
      </Link>
      <Link className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#f9edf2]" href="/admin/homepage">
        Нүүр хуудас
      </Link>
      <Link className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#f9edf2]" href="/admin/settings">
        Тохиргоо
      </Link>
      <SignOutButton redirectUrl="/admin/login">
        <button className="ml-auto rounded-full bg-[#2b2027] px-4 py-2 text-sm font-semibold text-white">Гарах</button>
      </SignOutButton>
    </div>
  );
}
