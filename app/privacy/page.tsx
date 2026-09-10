import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">Privacy policy</h1>
      <p className="mt-1 text-sm text-ink-500">Last updated: September 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-ink-600">
        <p><strong className="text-ink-900">What we collect.</strong> When you shop with us we collect your name, contact details, delivery address and order history so we can fulfil your orders. Account passwords are stored as salted hashes — we never see them.</p>
        <p><strong className="text-ink-900">How we use it.</strong> Your details are used to process orders, arrange delivery, provide support and (with your consent) send offers. We never sell your personal data.</p>
        <p><strong className="text-ink-900">Who sees it.</strong> Only Zeon staff and the delivery partners needed to fulfil your order. Payment details are processed by our payment providers and never stored on our servers.</p>
        <p><strong className="text-ink-900">Your rights.</strong> You may request a copy, correction or deletion of your data at any time by emailing hello@zeonapparelltd.com.</p>
        <p><strong className="text-ink-900">Cookies.</strong> We use a single secure cookie to keep you signed in, plus local storage for your cart and wishlist. No advertising trackers.</p>
      </div>
    </div>
  );
}
