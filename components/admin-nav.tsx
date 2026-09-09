"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  Package,
  LayoutGrid,
  Home,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";

const sections = [
  {
    title: "ҮНДСЭН",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Захиалга", icon: ShoppingBag },
      { href: "/admin/products", label: "Бараа", icon: Package },
    ],
  },
  {
    title: "КОНТЕНТ",
    items: [
      { href: "/admin/categories", label: "Ангилал", icon: LayoutGrid },
      { href: "/admin/homepage", label: "Нүүр хуудас", icon: Home },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    title: "БУСАД",
    items: [{ href: "/admin/settings", label: "Тохиргоо", icon: Settings }],
  },
];

const allLinks = sections.flatMap((s) => s.items);

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop/tablet: the usual horizontal pill bar */}
      <div className="mb-8 hidden items-center gap-3 rounded-2xl border border-[#eadde3] bg-white p-3 md:flex md:flex-wrap">
        {allLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              pathname === l.href ? "bg-[#2b2027] text-white" : "hover:bg-[#f9edf2]"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <SignOutButton redirectUrl="/admin/login">
          <button className="ml-auto rounded-full bg-[#2b2027] px-4 py-2 text-sm font-semibold text-white">Гарах</button>
        </SignOutButton>
      </div>

      {/* Mobile: hamburger button that opens a grouped, icon-list drawer */}
      <div className="mb-6 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#eadde3] bg-white px-4 py-2.5 text-sm font-semibold"
        >
          <Menu size={18} /> Цэс
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[82vw] max-w-80 flex-col overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="serif text-2xl">Админ цэс</p>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-[#f9edf2]">
                <X size={20} />
              </button>
            </div>

            {sections.map((s) => (
              <div key={s.title} className="mb-5">
                <p className="mb-2 text-xs font-bold tracking-wider text-zinc-400">{s.title}</p>
                <div className="space-y-1">
                  {s.items.map((l) => {
                    const Icon = l.icon;
                    const active = pathname === l.href;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                          active ? "bg-[#f9edf2] text-[#2b2027]" : "text-[#2b2027] hover:bg-[#f9edf2]"
                        }`}
                      >
                        <Icon size={19} className="text-zinc-400" />
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <SignOutButton redirectUrl="/admin/login">
              <button className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-[#2b2027] px-4 py-2.5 text-sm font-semibold text-white">
                <LogOut size={16} /> Гарах
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </>
  );
}
