# Zeon Apparel Ltd — Healthcare Apparel for Healthcare Professionals

Full-featured e-commerce store + wholesale portal for **Zeon Apparel Ltd**, a
healthcare apparel brand tailored in Lagos, Nigeria.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4**.
No external database required — data persists to JSON files in `data/` via
internal API routes (swap for Postgres/Supabase in production).

## Features

**Storefront**
- Home, shop (search, category/size filters, sorting), product pages with
  gallery, reviews and related products
- Cart (drawer + page), wishlist, guest or account checkout
- Lagos/South-West/nationwide delivery zones, free delivery over ₦200,000
- Pay on delivery, bank transfer or card (demo) — server-side repricing
- Order confirmation + email-gated order tracking and timeline

**Accounts**
- Register / sign in (salted-hash passwords, signed cookie sessions)
- Account dashboard: order history, profile & address management

**Wholesale portal**
- Tiered bulk pricing (10% / 15% / up to 25%), quote request form, B2B FAQs

**Content pages**
- About, contact, FAQs, size guide, shipping & returns, terms, privacy

**Admin (`/admin`)**
- Dashboard (revenue, orders, low stock, enquiries, moderation queue)
- Product manager (create / edit / delete, stock, featured)
- Order management with status workflow + customer timeline
- Wholesale & contact enquiry inbox, review moderation

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

### Demo accounts

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Admin    | admin@zeonapparel.com  | ZeonAdmin123!  |
| Customer | register a new account | —              |

The admin user is seeded automatically on first run (see `lib/db.ts`).

## Project structure

```
app/            # routes: shop, product, cart, checkout, order, account,
                # wholesale, admin, content pages + api/ routes
components/     # Header, Footer, CartDrawer, ProductCard, OrderTimeline…
context/        # cart / wishlist / auth store (React context + localStorage)
lib/            # JSON database, auth sessions, formatting, constants
data/           # products.json, reviews.json (seeded catalogue content)
public/images/  # product photography + banners
```

## Notes for production

- Replace the JSON file store (`lib/db.ts`) with a real database — serverless
  hosts have read-only filesystems.
- Set `ZEON_SESSION_SECRET` env var to a long random string.
- Integrate Paystack/Flutterwave in `app/checkout` for live card payments.
- Add an email provider (Resend/SMTP) for order confirmations.
