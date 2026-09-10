import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <h1 className="font-display text-3xl font-black tracking-tight text-navy-900">
        Privacy policy
      </h1>
      <p className="mt-1 text-sm text-mist-500">Last updated: September 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-mist-500">
        <p><strong className="text-navy-900">What we collect.</strong> Coordinators: name, contact, organisation and order data; account passwords are stored as salted hashes. Wearers: intake details, measurements and Size Profiles, tied to your phone number or email so reorders skip re-measuring. Discovery answers are stored against your session.</p>
        <p><strong className="text-navy-900">How we use it.</strong> To cut your size, stitch your embroidery, deliver your package and improve our craft. Discovery stories may be quoted anonymously in design research — never with your name without asking.</p>
        <p><strong className="text-navy-900">Who sees it.</strong> Your coordinator sees your intake submission for their order. Otherwise only ZEON staff and the delivery partners fulfilling your order. Payment details go to our payment providers — never our servers. We never sell personal data.</p>
        <p><strong className="text-navy-900">NDPR & your rights.</strong> We process data in line with the Nigeria Data Protection Regulation. You may request a copy, correction or deletion of your data anytime via hello@zeonapparels.com — including your Size Profile and Discovery answers.</p>
        <p><strong className="text-navy-900">On your device.</strong> Form drafts autosave to your own device storage (so a dropped connection never loses your work) and are cleared when you submit. We use one secure cookie to keep coordinators signed in — no advertising trackers.</p>
      </div>
    </div>
  );
}
