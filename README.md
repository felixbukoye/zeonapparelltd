# ZEON Healthcare Apparels — Web App v1.0 (MVP)

Made-to-order healthcare workwear for Nigerian HCPs. Two portals, one design
system — built from the **ZEON UI/UX Design Specification v1.0**.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
JSON file store via API routes (swap for Postgres in production).

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

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

Create a coordinator account at `/coordinator/setup`, or sign in with the
seeded demo coordinator:

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
lib/                       # types, JSON db, pricing tiers, sizing data,
                           # sessions, autosave, order status
data/                      # products.json (seeded catalogue)
public/images/             # style photography + banners
```

## Production notes

- Replace `lib/db.ts` with a real database (serverless filesystems are
  read-only); set `ZEON_SESSION_SECRET`.
- Integrate Paystack/Flutterwave for live payments; add Resend/SMTP for
  transactional email; upload logos to object storage (S3/R2).
- Open spec questions (§12) stubbed with sensible defaults: full payment
  under 15 sets, no per-wearer split-pay yet, single size chart, 100-point
  Discovery reward.
