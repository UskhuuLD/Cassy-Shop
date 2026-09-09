import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Захиалга" },
  { href: "/admin/products", label: "Бараа" },
  { href: "/admin/categories", label: "Ангилал" },
  { href: "/admin/homepage", label: "Нүүр хуудас" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/settings", label: "Тохиргоо" },
];

export default function AdminNav() {
  return (
    <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-[#eadde3] bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      {/* `sm:contents` makes this wrapper disappear at sm+, so the links become
          direct flex children (wrapping naturally like before); below sm it's
          a tidy 2-column grid instead of an uneven flex-wrap. */}
      <div className="grid grid-cols-2 gap-2 sm:contents">
        {links.map((l) => (
          <Link
            key={l.href}
            className="rounded-full px-4 py-2 text-center text-sm font-semibold hover:bg-[#f9edf2]"
            href={l.href}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <SignOutButton redirectUrl="/admin/login">
        <button className="w-full rounded-full bg-[#2b2027] px-4 py-2 text-sm font-semibold text-white sm:ml-auto sm:w-auto">
          Гарах
        </button>
      </SignOutButton>
    </div>
  );
}
