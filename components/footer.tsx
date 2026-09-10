"use client";
import Link from "next/link";
import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { useCategories } from "./category-context";
import type { ShopInfo } from "@/lib/shop-settings";

export default function Footer({ shopInfo }: { shopInfo: ShopInfo }) {
  const categories = useCategories();

  return (
    <footer className="mt-24 border-t border-[#eadde3] bg-[#2b2027] text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="serif text-3xl">Cassy shop</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
            Girls outfit • soft aesthetic • өдөр тутмын эмэгтэйлэг сонголт.
          </p>
          <div className="mt-5 flex gap-3">
            <a className="social" href={`https://instagram.com/${shopInfo.instagram}`}>
              <Instagram size={18} />
            </a>
            <a className="social" href={`https://facebook.com/${shopInfo.facebook}`}>
              <Facebook size={18} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="footer-title">Дэлгүүр</h3>
          <div className="footer-links">
            <Link href="/products">Шинэ бараа</Link>
            {categories.slice(0, 3).map((c) => (
              <Link key={c.id} href={`/products?category=${c.slug}`}>
                {c.name}
              </Link>
            ))}
            <Link href="/products?sale=1">Хямдрал</Link>
          </div>
        </div>
        <div>
          <h3 className="footer-title">Үйлчилгээ</h3>
          <div className="footer-links">
            <Link href="/cart">Сагс</Link>
            <Link href="/checkout">Захиалга өгөх</Link>
            <Link href="/faq">Түгээмэл асуулт (FAQ)</Link>
            <Link href="/login">Нэвтрэх</Link>
          </div>
        </div>
        <div>
          <h3 className="footer-title">Холбоо барих</h3>
          <p className="footer-contact">
            <MapPin size={17} />
            <span>{shopInfo.address}</span>
          </p>
          <p className="footer-contact">
            <Phone size={17} />
            <span>
              {shopInfo.phone} • {shopInfo.delivery}
            </span>
          </p>
          <p className="mt-3 text-sm text-white/65">
            Instagram: @{shopInfo.instagram}
            <br />
            {shopInfo.hours}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-12">
          <h3 className="footer-title">Байршил</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-[1fr_1.5fr]">
            <div className="text-sm text-white/70">
              <p className="flex items-start gap-2">
                <MapPin size={17} className="mt-0.5 flex-none" />
                <span>{shopInfo.address}</span>
              </p>
              <a
                href="https://www.google.com/maps/place/Cassy+shop/@47.9114226,106.9423495,17.57z/data=!4m6!3m5!1s0x5d969300554c3c77:0x5a2861a180f0f239!8m2!3d47.9109542!4d106.9440635!16s%2Fg%2F11njc7y_wh"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full border border-white/25 px-4 py-2 text-xs font-bold hover:bg-white/10"
              >
                Google Map дээр харах →
              </a>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <iframe
                src="https://maps.google.com/maps?q=47.9109542,106.9440635&z=16&hl=mn&output=embed"
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cassy shop байршил"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-white/10 py-5 text-center text-xs text-white/50 md:flex-row md:justify-between">
        <span>© 2026 Cassy Online Shop. All rights reserved.</span>
      </div>
    </footer>
  );
}
