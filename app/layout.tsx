import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/components/cart-context";
import { WishlistProvider } from "@/components/wishlist-context";
import { CategoryProvider } from "@/components/category-context";
import SiteShell from "@/components/site-shell";
import { getCategories } from "@/lib/categories";
import { getCustomerSession } from "@/lib/customer-auth";
import { getShopInfo } from "@/lib/shop-settings";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Cassy Online Shop",
  description: "Girls outfit online shop",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  const customerSession = await getCustomerSession();
  const [customer, shopInfo] = await Promise.all([
    customerSession
      ? prisma.user.findUnique({ where: { id: customerSession.userId }, select: { name: true } })
      : Promise.resolve(null),
    getShopInfo(),
  ]);

  return (
    <ClerkProvider>
      <html lang="mn">
        <body>
          <CategoryProvider categories={categories}>
            <CartProvider>
              <WishlistProvider>
                <SiteShell customer={customer} shopInfo={shopInfo}>
                  {children}
                </SiteShell>
              </WishlistProvider>
            </CartProvider>
          </CategoryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
