import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Барааны нэр дор хаяж 2 тэмдэгт байх ёстой."),
  description: z.string().trim().default(""),
  price: z.coerce.number().int().positive("Үнэ 0-с их байх ёстой."),
  salePrice: z.coerce.number().int().positive().optional().nullable(),
  categoryId: z.string().min(1, "Ангилал сонгоно уу."),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string(), color: z.string().default("") })).default([]),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        color: z.string().default(""),
        stock: z.coerce.number().int().min(0, "Нөөц 0-с бага байж болохгүй."),
      })
    )
    .min(1, "Дор хаяж нэг хэмжээ/өнгийн нөөц оруулна уу."),
  isActive: z.coerce.boolean().default(true),
  isNew: z.coerce.boolean().default(false),
  isBestSeller: z.coerce.boolean().default(false),
  isComingSoon: z.coerce.boolean().default(false),
  comingSoonDays: z.coerce.number().int().min(1).max(365).optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Ангиллын нэр дор хаяж 2 тэмдэгт байх ёстой."),
});

export const faqSchema = z.object({
  question: z.string().trim().min(2, "Асуулт дор хаяж 2 тэмдэгт байх ёстой."),
  answer: z.string().trim().min(2, "Хариулт дор хаяж 2 тэмдэгт байх ёстой."),
});
