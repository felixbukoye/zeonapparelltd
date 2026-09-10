import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQs" };

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "Getting started",
    items: [
      ["Team order or individual order — which is for me?", "Outfitting colleagues? Create a coordinator account, build a collection and share one invite link — that's a Team order. Just want sets for yourself? Pick a style from the catalogue and build your own order — no account needed."],
      ["I'm a wearer with an invite link. Do I need an account?", "No — that's the point. Open your link, tell us about you, pick your size, preview your embroidery, confirm. About 3 minutes. You'll track everything with your phone number."],
      ["How do I track my order?", "Open the Track page with your order code plus your checkout email (individual) or intake phone number (team). You'll see all 8 production stages live — no login required."],
    ],
  },
  {
    title: "Sizing & fit",
    items: [
      ["How does the Fit Assistant work?", "Two paths: pick a preset size (XS–6XL) with our “Not sure? Help me choose” helper, or enter manual measurements one at a time with how-to diagrams. Either way you choose Fitted (our signature) or Relaxed — and we save it as your reusable Size Profile."],
      ["What if my size doesn't fit?", "Exchanges are free — tell us within 14 days of delivery and we'll recut your size. If an embroidered item arrives faulty, we remake it free, delivery both ways on us."],
      ["Do you stock tall or plus sizes?", "Preset goes to 6XL, and manual measurements mean any body gets a custom cut. Wholesale length adjustments are free on team orders."],
    ],
  },
  {
    title: "Money — quotes, deposits, balance",
    items: [
      ["How does team pricing work?", "1–4 sets pay full price, 5–14 sets get 10% off, and 15+ sets get 15% off with a 30% deposit to start. Your Naira quote lands within 24 hours with a full breakdown — never one opaque total."],
      ["When do I pay the balance?", "Anytime before dispatch — your sets won't ship until it's cleared, and we'll remind you well before packaging finishes."],
      ["How do individual orders pay?", "In full at checkout — card, bank transfer or pay on delivery. Payment confirmed means your sets enter the workroom queue immediately."],
    ],
  },
  {
    title: "Production & delivery",
    items: [
      ["How long does production take?", "About 3 weeks from mockup approval, tracked live across 8 stages: Order Confirmed → Material Sourced → Cutting → Sewing & Assembly → Customization → Quality Check → Packaging → Dispatched. If a stage slips, your ETA visibly updates."],
      ["Who delivers, and how much?", "GIG Logistics, in per-wearer labeled packages. Lagos ₦2,500 · South-West ₦4,000 · Nationwide ₦5,500 — free on orders over ₦200,000."],
      ["What is digitization?", "Converting your logo into embroidery-stitch data — it takes 2–3 days. Your proof is clearly marked “Pending digitization” until it's final, and nothing sews without your mockup approval."],
    ],
  },
  {
    title: "Discovery & ZEON Points",
    items: [
      ["What is Discovery?", "A relaxed conversation — with an ambassador, by chat, or a 3-minute version after you order — about your workwear life. Every question is skippable, voice notes welcome. Your answers shape what we sew next."],
      ["What are ZEON Points?", "Our thank-you currency. Completing Discovery earns 100 points, redeemable against future orders and community perks."],
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
        Good questions
      </p>
      <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">
        Frequently asked questions
      </h1>
      <p className="mt-2 text-sm text-mist-500">
        Can&apos;t find your answer? Tap the WhatsApp button on any screen — a
        human replies in minutes.
      </p>

      {GROUPS.map((g) => (
        <section key={g.title} className="mt-9">
          <h2 className="font-display text-lg font-black text-navy-900">{g.title}</h2>
          <div className="mt-3.5 space-y-2.5">
            {g.items.map(([q, a]) => (
              <details
                key={q}
                className="group rounded-2xl border border-line bg-white p-5 transition open:border-primary-200 open:shadow-md"
              >
                <summary className="cursor-pointer list-none text-[15px] font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {q}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-lg font-black text-primary-700 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-mist-500">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
