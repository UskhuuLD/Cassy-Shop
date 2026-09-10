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
  metadataBase: new URL("https://www.cassyshop.com"),
  title: "Cassy Online Shop",
  description: "Girls outfit online shop",
  openGraph: {
    title: "Cassy Online Shop",
    description: "Girls outfit online shop",
    url: "https://www.cassyshop.com",
    siteName: "Cassy Online Shop",
    type: "website",
    images: [{ url: "/og-logo.png", width: 1206, height: 632, alt: "Cassy shop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cassy Online Shop",
    description: "Girls outfit online shop",
    images: ["/og-logo.png"],
  },
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
