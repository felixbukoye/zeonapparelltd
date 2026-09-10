# ZEON Healthcare Apparels — Web App v1.0 (MVP)

Made-to-order healthcare workwear for Nigerian HCPs. Two portals, one design
system — built from the **ZEON UI/UX Design Specification v1.0**.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Supabase (Postgres) via API routes + server components.

## The two portals

**Coordinator Portal** (`/coordinator`, account required) — institutional buyers
- Home: resume-setup card, quick actions, live order alerts
- Collections: builder (full catalogue vs. custom, style grid, colour library
  with compliance flags, per-category embroidery rules, For-Production locking
  + version history)
- Orders: Active / Awaiting / Complete tabs; detail with Roster ·
  Embroidery · Payments · Tracker · Checkout tabs
- Team orders (invite-link wearer intake) + Self orders (manual roster entry)
- Naira quotes, 30% deposit on 15+ sets, mockup approval gate, 8-stage
  production tracker, balance-before-dispatch, GIG tracking codes

**Wearer Experience** (no account required)
- Catalogue: dark-premium Pinterest-style board → style detail → order
- Kamscomfort individual builder (`/order/individual`): style → colour →
  career stage → Fit Assistant → embroidery → review & pay
- Fit Assistant (`/fit-assistant`): preset XS–6XL + helper, manual
  measurements, fitted/relaxed choice, reusable Size Profiles (AR-ready seed)
- Invite-link intake (`/intake/[token]`): details → sizing → embroidery
  preview → confirm, with autosave + soft duplicate handling
- Link-based tracker (`/track`), post-delivery feedback, Discovery
  conversations (assisted / guided / embedded) with voice notes + ZEON Points

**Global:** persistent WhatsApp “Talk to Sales” CTA, offline-tolerant
autosaving forms, skeleton loading states, dignity-forward copy, full analytics
event hooks (`order_confirmed`, `quote_viewed`, `deposit_paid`,
`intake_flow_*`, `discovery_session_*`, `feedback_form_submitted`).

## Getting started

**1. Database (Supabase).** Create a project at
[https://supabase.com](https://supabase.com) (free tier is fine to start),
open **SQL Editor → New query**, paste the whole `supabase/schema.sql` and
run it. That creates every table and seeds the product catalogue.

**2. Environment variables.** Copy `.env.local.example` to `.env.local` and
fill in the values from your Supabase project **Settings → API**:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role (secret) — **server-only, never make it `NEXT_PUBLIC_`** |
| `ZEON_SESSION_SECRET` | any long random string, e.g. `openssl rand -base64 32` |

**3. Run it.**

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

> `npm run build` queries Supabase to prerender the landing page, so the
> env vars must be present at build time too (Vercel injects them
> automatically).

Create a coordinator account at `/coordinator/setup`, or sign in with the
seeded demo coordinator (created automatically on first use):

| Email | Password |
|---|---|
| admin@zeonapparel.com | ZeonAdmin123! |

## Project structure

```
app/
  page.tsx                 # dark-premium landing (two paths + WhatsApp)
  catalogue/               # style board + style detail
  order/individual/        # Kamscomfort builder
  fit-assistant/           # standalone Size Profile studio
  intake/[token]/          # wearer invite flow (no login)
  track/                   # link-based production tracker
  feedback/[code]/         # post-delivery fit check
  discovery/               # 3-mode conversation + points
  coordinator/             # portal: home, collections, orders, account
  api/                     # collections, team-orders, intake, individual-
                           # orders, track, size-profiles, discovery,
                           # feedback, events, auth, products
components/                # design-system kit (ui.tsx), tracker, swatches,
                           # placement picker, dropzone, invite card, recorder
lib/                       # types, Supabase db, pricing tiers, sizing data,
                           # sessions, autosave, order status
supabase/                  # schema.sql — tables + catalogue seed
public/images/             # style photography + banners
```

## Production notes

- Persistence is Supabase Postgres — deploy just needs the three environment
  variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `ZEON_SESSION_SECRET`) set in Vercel. Run `supabase/schema.sql` in the
  Supabase SQL Editor before the first deploy. The service-role key is only
  ever used server-side (guarded by `server-only` in `lib/supabase.ts`).
- The landing page is prerendered at build time, so after editing catalogue
  data in Supabase, trigger a re-deploy (or a `git commit` on Vercel) to pick
  up the changes on the home page; all other pages read live from the DB.
- Integrate Paystack/Flutterwave for live payments; add Resend/SMTP for
  transactional email; upload logos to object storage (S3/R2).
- Open spec questions (§12) stubbed with sensible defaults: full payment
  under 15 sets, no per-wearer split-pay yet, single size chart, 100-point
  Discovery reward.
