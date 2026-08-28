import Link from "next/link";
import ProductCard from "@/components/product-card";
import { getNewArrivals } from "@/lib/products";
import { getSiteContent } from "@/lib/site-content";
import { getShopInfo } from "@/lib/shop-settings";
import { Instagram, MapPin, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, content, shopInfo] = await Promise.all([getNewArrivals(8), getSiteContent(), getShopInfo()]);

  return (
    <main>
      <section className="container-page py-6">
        <div className="relative overflow-hidden rounded-[36px] bg-[#efd5df]">
          <img
            src={content.heroImage}
            className="h-[620px] w-full object-cover object-top opacity-85"
            alt="Cassy collection"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2b2027]/70 via-[#2b2027]/20 to-transparent" />
          <div className="absolute left-8 top-1/2 max-w-xl -translate-y-1/2 text-white md:left-16">
            <p className="mb-4 text-sm font-bold tracking-[.25em]">CASSY NEW COLLECTION</p>
            <h1 className="serif text-5xl leading-none md:text-7xl">
              Soft looks,
              <br />
              your mood.
            </h1>
            <p className="mt-6 max-w-md text-base text-white/90">
              Өдөр бүрийн outfit-аа илүү эмэгтэйлэг, clean, aesthetic болго.
            </p>
            <Link href="/products" className="btn mt-7 bg-white text-[#2b2027]">
              SHOP NOW
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-5 py-8 md:grid-cols-3 md:gap-4 md:py-6">
        <div className="info-strip">
          <Truck />
          <div>
            <b>Хүргэлт</b>
            <p>{shopInfo.delivery}</p>
          </div>
        </div>
        <div className="info-strip">
          <MapPin />
          <div>
            <b>Манай хаяг</b>
            <p>Sunday Plaza 1, 710 тоот</p>
          </div>
        </div>
        <div className="info-strip">
          <Instagram />
          <div>
            <b>Instagram</b>
            <p>@{shopInfo.instagram}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="eyebrow">CASSY PICKS</p>
            <h2 className="serif mt-2 text-4xl">New arrivals</h2>
          </div>
          <Link href="/products" className="text-sm font-bold underline">
            Бүгдийг харах
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="card p-12 text-center text-zinc-500">
            Одоогоор бараа алга. Admin хэсгээс эхний бараагаа нэмнэ үү.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#f9edf2] py-16">
        <div className="container-page grid items-center gap-10 md:grid-cols-2">
          <div className="grid grid-cols-2 gap-3">
            <img src={content.styleEditImage1} className="h-[430px] w-full rounded-[28px] object-cover" />
            <img src={content.styleEditImage2} className="mt-12 h-[430px] w-full rounded-[28px] object-cover" />
          </div>
          <div>
            <p className="eyebrow">CASSY STYLE EDIT</p>
            <h2 className="serif mt-3 text-5xl">
              Cute, clean
              <br />
              and confident.
            </h2>
            <Link href="/products" className="btn btn-dark mt-7">
              COLLECTION ҮЗЭХ
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-[36px] border border-[#eadde3] bg-white p-8 text-center md:p-14">
          <Instagram className="mx-auto" />
          <p className="eyebrow mt-4">FOLLOW OUR DAILY DROPS</p>
          <h2 className="serif mt-3 break-words text-2xl sm:text-3xl md:text-4xl">@{shopInfo.instagram}</h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Шинэ бараа, үнэ болон бодит бичлэгүүдийг Instagram-аас хамгийн түрүүнд хараарай.
          </p>
          <a href={`https://instagram.com/${shopInfo.instagram}`} className="btn btn-soft mt-6">
            INSTAGRAM РУУ ОРОХ
          </a>
        </div>
      </section>
    </main>
  );
}
