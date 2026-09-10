import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Size Guide" };

const TOPS = [
  ["XS", "80–84", "62–66", "86–90"],
  ["S", "86–90", "68–72", "92–96"],
  ["M", "92–97", "74–79", "98–103"],
  ["L", "99–104", "81–86", "105–110"],
  ["XL", "106–112", "88–94", "112–118"],
  ["2XL", "114–121", "96–103", "120–127"],
];

const COATS = [
  ["S", "86–92", "Regular 38\" / Long 40\""],
  ["M", "94–100", "Regular 38\" / Long 40\""],
  ["L", "102–108", "Regular 39\" / Long 41\""],
  ["XL", "110–116", "Regular 39\" / Long 41\""],
  ["2XL", "118–124", "Regular 40\" / Long 42\""],
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">Size guide</h1>
      <p className="mt-1 text-sm text-ink-500">
        Zeon workwear is cut for Nigerian bodies and runs true to size. Measure
        over light clothing — between sizes? Size up for a relaxed clinical fit.
      </p>

      <section className="mt-8 rounded-3xl border border-ink-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-black text-ink-900">
          Scrub tops, sets, jackets &amp; tunics (cm)
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-widest text-ink-500">
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-4">Chest</th>
                <th className="py-3 pr-4">Waist</th>
                <th className="py-3">Hips</th>
              </tr>
            </thead>
            <tbody>
              {TOPS.map((r) => (
                <tr key={r[0]} className="border-b border-ink-50 last:border-0">
                  <td className="py-3 pr-4 font-black text-brand-700">{r[0]}</td>
                  <td className="py-3 pr-4">{r[1]}</td>
                  <td className="py-3 pr-4">{r[2]}</td>
                  <td className="py-3">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-ink-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-black text-ink-900">Lab coats (chest in cm)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-widest text-ink-500">
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-4">Chest</th>
                <th className="py-3">Length options</th>
              </tr>
            </thead>
            <tbody>
              {COATS.map((r) => (
                <tr key={r[0]} className="border-b border-ink-50 last:border-0">
                  <td className="py-3 pr-4 font-black text-brand-700">{r[0]}</td>
                  <td className="py-3 pr-4">{r[1]}</td>
                  <td className="py-3">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-brand-950 p-6 text-white sm:p-8">
          <h2 className="font-black">How to measure</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-100">
            <li><strong className="text-white">Chest:</strong> around the fullest part, tape level across your back.</li>
            <li><strong className="text-white">Waist:</strong> around your natural waistline, one finger of ease.</li>
            <li><strong className="text-white">Hips:</strong> around the fullest part of your hips.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-8">
          <h2 className="font-black text-ink-900">Still unsure?</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            Message us on WhatsApp with your measurements and we&apos;ll
            recommend your perfect size — plus, exchanges are free within 14
            days.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/contact"
              className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Ask us
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-bold text-ink-800 hover:border-ink-400"
            >
              Shop now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
