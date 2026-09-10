import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="font-display text-3xl font-black tracking-tight text-navy-900">
        Terms of service
      </h1>
      <p className="mt-1 text-sm text-mist-500">Last updated: September 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-mist-500">
        <p><strong className="text-navy-900">1. Made-to-order.</strong> Every ZEON piece is sewn after you order — nothing ships off a shelf. Production timelines shown in your tracker are estimates; if a stage slips we update your ETA visibly and keep you posted.</p>
        <p><strong className="text-navy-900">2. Team orders & payment.</strong> Quotes are in Naira and valid for 14 days. Orders of 15+ sets require a 30% deposit to start production; dispatch is gated on the balance being cleared. Prices include VAT where applicable.</p>
        <p><strong className="text-navy-900">3. Mockup approval.</strong> No production starts without your approved embroidery mockup. Approving a mockup confirms placement, spelling rules and logo proof — re-cuts after approval due to approved-spec errors are chargeable.</p>
        <p><strong className="text-navy-900">4. Individual orders.</strong> Paid in full at checkout. Your Size Profile is stored so reorders skip measurement — keep it updated if your size changes.</p>
        <p><strong className="text-navy-900">5. Exchanges.</strong> Unworn items may be exchanged for size within 14 days of delivery. Faulty or incorrect items are remade free, delivery both ways on us.</p>
        <p><strong className="text-navy-900">6. Discovery & ZEON Points.</strong> Discovery answers help us design future collections and may be quoted anonymously. ZEON Points have no cash value and expire 12 months after issue.</p>
        <p><strong className="text-navy-900">7. Contact.</strong> Questions? WhatsApp +234 801 234 5678 or email hello@zeonapparels.com.</p>
      </div>
    </div>
  );
}
