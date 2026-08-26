import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/slugify";

const prisma = new PrismaClient();

const categoryNames = ["Tops", "Bottoms", "Skirts", "Dresses", "Sets", "Bags"];

const items: [string, string, number, string][] = [
  ["White Ribbon Fit Top", "Tops", 69000, "NEW"],
  ["Ivory Button Slim Top", "Tops", 72000, "TRENDING"],
  ["Pink Stripe Shirt", "Tops", 79000, "NEW"],
  ["Charcoal Wide Pants", "Bottoms", 99000, "BESTSELLER"],
  ["Navy Stripe Mini Skirt", "Skirts", 79000, ""],
  ["Black Check Mini Skirt", "Skirts", 85000, "TRENDING"],
  ["Grey Check Ruched Top", "Tops", 74000, "NEW"],
  ["Blue Peter Pan Blouse", "Tops", 79000, ""],
  ["Polka Dot Two-piece Set", "Sets", 129000, "NEW"],
  ["Blue Stripe Off-shoulder Top", "Tops", 72000, ""],
  ["Black Buckle Shoulder Bag", "Bags", 99000, "BESTSELLER"],
  ["Blue Kitty Tote Bag", "Bags", 59000, ""],
  ["Navy Polka Dot Dress", "Dresses", 119000, "NEW"],
  ["Pink Star Tee", "Tops", 59000, ""],
  ["Deer Print Loose Top", "Tops", 79000, ""],
  ["Check Collar Mini Set", "Sets", 139000, "TRENDING"],
  ["Ivory Ribbon Blouse", "Tops", 79000, "NEW"],
  ["Navy Peplum Blouse", "Tops", 89000, ""],
  ["Red Check Tie Shirt", "Tops", 85000, "NEW"],
  ["Grey Belt Mini Skirt", "Skirts", 89000, "BESTSELLER"],
];

async function main() {
  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), order: i },
    });
    categoryMap.set(name, category.id);
  }

  console.log("Seeding products...");
  for (let i = 0; i < items.length; i++) {
    const [name, categoryName, price, badge] = items[i];
    const onSale = i % 5 === 2;
    const salePrice = onSale ? Math.round((price * 0.82) / 1000) * 1000 : null;
    const slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name,
        slug,
        description:
          "Cassy Online Shop-ийн сонгосон aesthetic загвар. Үнэ, размер болон үлдэгдлийг admin хэсгээс шинэчилж болно.",
        price,
        salePrice,
        categoryId: categoryMap.get(categoryName)!,
        stock: 6 + (i % 9),
        sizes: categoryName === "Bags" ? ["ONE SIZE"] : ["S", "M", "L"],
        colors: ["Pink", "Ivory", "Black"],
        isNew: badge === "NEW",
        isBestSeller: badge === "BESTSELLER",
        images: { create: [{ url: `/products/product-${i + 1}.jpg`, position: 0 }] },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
