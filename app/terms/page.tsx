import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">Terms of service</h1>
      <p className="mt-1 text-sm text-ink-500">Last updated: September 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-ink-600">
        <p><strong className="text-ink-900">1. Orders & payment.</strong> Orders are confirmed once payment is received (or on scheduling for pay-on-delivery Lagos orders). Prices are in Nigerian Naira (₦) and include VAT where applicable.</p>
        <p><strong className="text-ink-900">2. Delivery.</strong> Estimated delivery times are stated at checkout. Zeon Apparel Ltd is not liable for delays caused by logistics partners, but we will always keep you updated and make things right.</p>
        <p><strong className="text-ink-900">3. Exchanges & returns.</strong> Unworn items with tags may be exchanged within 14 days. Personalised/embroidered items are final sale unless faulty. See our Shipping & Returns page for details.</p>
        <p><strong className="text-ink-900">4. Wholesale.</strong> Wholesale quotes are valid for 14 days. Bulk orders require 50% deposit (or full prepayment for first-time buyers); 30-day terms are available to accredited facilities on qualifying orders.</p>
        <p><strong className="text-ink-900">5. Product care.</strong> Follow the care instructions provided. Damage from improper care, bleaching or non-standard washing is not covered under warranty.</p>
        <p><strong className="text-ink-900">6. Contact.</strong> Questions about these terms? Email hello@zeonapparelltd.com or call +234 801 234 5678.</p>
      </div>
    </div>
  );
}
