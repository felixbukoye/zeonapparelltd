import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">
        Shipping &amp; returns
      </h1>

      <section className="mt-8 rounded-3xl border border-ink-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-black text-ink-900">Delivery zones &amp; fees</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-widest text-ink-500">
                <th className="py-3 pr-4">Zone</th>
                <th className="py-3 pr-4">Fee</th>
                <th className="py-3">Estimated time</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Lagos State", "₦2,500", "1–2 business days"],
                ["South-West (Ogun, Oyo, Osun, Ondo, Ekiti)", "₦4,000", "2–3 business days"],
                ["Nationwide (all other states + FCT)", "₦5,500", "3–5 business days"],
              ].map((r) => (
                <tr key={r[0]} className="border-b border-ink-50 last:border-0">
                  <td className="py-3 pr-4 font-semibold">{r[0]}</td>
                  <td className="py-3 pr-4">{r[1]}</td>
                  <td className="py-3">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm font-semibold text-brand-900">
          FREE nationwide delivery on all orders over ₦200,000 — no code needed.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-ink-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-black text-ink-900">Exchanges &amp; returns</h2>
        <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-ink-600">
          <li><strong>14-day free size exchanges</strong> on all unworn items with tags attached.</li>
          <li>To start an exchange, <Link href="/contact" className="font-bold text-brand-700">contact us</Link> with your order code — we&apos;ll arrange pickup and send your new size.</li>
          <li>Faulty or incorrect items are replaced free of charge, including delivery both ways.</li>
          <li>Embroidered and personalised items can only be exchanged if faulty, so please double-check spelling in your order notes.</li>
          <li>Refunds (where applicable) are processed to your original payment method within 5 business days of receiving the return.</li>
        </ul>
      </section>
    </div>
  );
}
