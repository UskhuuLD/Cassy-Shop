"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { ShopInfo } from "@/lib/shop-settings";

export default function SiteShell({
  children,
  customer,
  shopInfo,
}: {
  children: React.ReactNode;
  customer: { name: string | null } | null;
  shopInfo: ShopInfo;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header customer={customer} shopInfo={shopInfo} />
      {children}
      <Footer shopInfo={shopInfo} />
    </>
  );
}
