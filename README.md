# Cassy Shop

Mongolian-language girls' fashion e-commerce site. Next.js 15 + TypeScript + Tailwind,
backed by PostgreSQL via Prisma. Admin Product Management is fully connected to the
storefront — everything an admin adds, edits, disables, or deletes shows up live for
customers, because both sides read from the same database.

## First-time setup

```bash
npm install

# 1. Point DATABASE_URL at a real Postgres instance.
#    Easiest free option: https://neon.tech (or Supabase, or Vercel Postgres).
cp .env.example .env
# edit .env and fill in DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET

# 2. Create the tables from prisma/schema.prisma
npx prisma generate
npx prisma db push

# 3. Seed starter categories + products
npm run db:seed

# 4. Run it
npm run dev
```

Then visit `/admin/login` and sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set
in `.env`. Add, edit, or disable a product there and refresh `/products` — the change
is live immediately, no redeploy or restart needed.

## What's database-backed vs. what's local-only

**Real database (Prisma/Postgres), shared between admin and customers:**
Products, Categories, product images, Orders/OrderItems, stock levels.

**Still browser-local (by design, not part of the requested catalog scope):**
The shopping cart and wishlist are stored in the visitor's own browser (`localStorage`)
— this is standard for a guest-checkout flow and doesn't need a database, since it's
each visitor's own temporary session. The `Cart`/`Wishlist` Prisma models exist in the
schema, ready for when you add real customer accounts. Checkout, however, always
**re-validates price and stock against the database** at the moment of purchase, so a
stale price or an out-of-stock item in someone's browser cart can never actually be
ordered.

The `/admin/settings` shop-info page (phone, address, etc.) is a small local demo panel
and doesn't affect product data — edit `lib/shop-info.ts` directly for real changes.

## Image uploads

Product images upload through the admin form. Without Cloudinary configured, images
are stored as data URLs directly (fine for local testing, **not** recommended for
production — large payloads, no CDN). To enable real hosted uploads, create a free
account at [cloudinary.com](https://cloudinary.com) and fill in `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in your environment variables.

## Admin security

`/admin/*` routes are protected by `middleware.ts`, which verifies a signed session
cookie on every request server-side — not just by hiding the link. All product/category/
order mutations also re-check the session inside the server action itself
(`requireAdmin()` in `lib/admin-auth.ts`), so the write APIs can't be called directly
by a signed-out visitor even if they guessed the action.

## Deploying (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. In Project Settings → Environment Variables, add everything from `.env.example`
   (a hosted `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and
   optionally the `CLOUDINARY_*` keys).
4. Deploy. Vercel runs `prisma generate` automatically as part of `npm run build`.
5. Run `npx prisma db push` once (from your own machine, pointed at the same
   `DATABASE_URL`) to create the tables, then `npm run db:seed` to add starter products.

## Useful commands

```bash
npm run db:studio   # visual database browser
npm run db:push     # sync schema.prisma changes to the database
npm run db:seed     # re-run the seed script
```
# Cassy-Shop
