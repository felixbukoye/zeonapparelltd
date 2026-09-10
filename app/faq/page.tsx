import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQs" };

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "Orders & delivery",
    items: [
      ["How long does delivery take?", "Lagos orders arrive in 1–2 business days, South-West in 2–3 days, and nationwide in 3–5 days. You'll receive tracking updates by email and SMS."],
      ["How much is delivery?", "₦2,500 within Lagos, ₦4,000 for South-West states, and ₦5,500 nationwide. Delivery is FREE on all orders over ₦200,000."],
      ["Do you offer pay on delivery?", "Yes — pay on delivery (cash or transfer) is available for Lagos orders. Orders outside Lagos are prepaid via bank transfer or card."],
      ["How do I track my order?", "Use the Track Order page with your order code and email, or sign in to view live status in your account."],
    ],
  },
  {
    title: "Sizing & fit",
    items: [
      ["How do Zeon sizes run?", "Our scrubs and coats are cut for Nigerian bodies and run true to size. Check the Size Guide and measure your chest and waist — when between sizes, we recommend sizing up for a relaxed clinical fit."],
      ["Do you stock tall or plus sizes?", "Yes. Tops and trousers go up to 2XL, and we offer free length adjustments on wholesale orders. Need something special? Contact us — our workroom handles custom sizing."],
      ["What if my size doesn't fit?", "Exchanges are free within 14 days for unworn items with tags. Start an exchange by contacting us with your order code."],
    ],
  },
  {
    title: "Products & care",
    items: [
      ["Are your scrubs autoclavable?", "Yes — our scrub fabrics and theatre caps are tested for repeated autoclave cycles up to 134°C without colour loss."],
      ["How do I wash embroidered items?", "Machine wash cold, inside-out, with like colours. Tumble dry low and avoid bleach. Embroidery is guaranteed for the life of the garment under normal care."],
      ["Do you embroider names and logos?", "Yes! Orders of 10+ pieces include free name and role embroidery. Hospital logos are free on orders of 50+. Add your embroidery text in the order notes at checkout."],
    ],
  },
  {
    title: "Wholesale",
    items: [
      ["What is the minimum wholesale order?", "Just 10 pieces to unlock 10% off and free name embroidery. See the Wholesale page for full tiers up to 25% off."],
      ["Do you offer payment terms?", "Accredited hospitals and institutions ordering 200+ pieces qualify for 30-day payment terms after a first prepaid order."],
      ["Can we get samples first?", "Absolutely — a free size sampling kit is included with every wholesale quote for orders of 50+."],
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">
        Frequently asked questions
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Can&apos;t find your answer?{" "}
        <Link href="/contact" className="font-bold text-brand-700 hover:underline">
          Contact us
        </Link>
      </p>

      {GROUPS.map((g) => (
        <section key={g.title} className="mt-10">
          <h2 className="text-lg font-black text-ink-900">{g.title}</h2>
          <div className="mt-4 space-y-3">
            {g.items.map(([q, a]) => (
              <details
                key={q}
                className="group rounded-2xl border border-ink-100 bg-white p-5 transition open:border-brand-200 open:shadow-md"
              >
                <summary className="cursor-pointer list-none text-[15px] font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 text-lg font-black text-brand-700 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
