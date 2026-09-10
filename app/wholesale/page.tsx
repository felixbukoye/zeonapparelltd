"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckIcon } from "@/components/icons";

const TIERS = [
  {
    qty: "10 – 49",
    discount: "10% off",
    perks: ["Free name embroidery", "Mixed sizes & colours", "Dedicated support line"],
  },
  {
    qty: "50 – 199",
    discount: "15% off",
    perks: ["Everything in Tier 1", "Free hospital logo embroidery", "Free size sampling kit", "Priority production"],
    highlight: true,
  },
  {
    qty: "200+",
    discount: "Up to 25% off",
    perks: ["Everything in Tier 2", "Custom colours & styles", "30-day payment terms", "Account manager"],
  },
];

const STEPS = [
  ["Send an enquiry", "Tell us what you need — quantities, colours, embroidery."],
  ["Get samples & quote", "Free size samples and a formal quote within 48 hours."],
  ["Approve & produce", "Approve the proof; we produce in 2–4 weeks."],
  ["Delivered & supported", "Nationwide delivery plus free size exchanges."],
];

export default function WholesalePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organisation: "",
    quantity: "50 – 199 pieces",
    products: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send enquiry.");
      setStatus("done");
      setMessage(data.message);
      setForm({ name: "", email: "", phone: "", organisation: "", quantity: "50 – 199 pieces", products: "", message: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not send enquiry.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <Image
            src="/images/wholesale.jpg"
            alt="Bulk medical uniforms"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 to-ink-950" />
          <div className="bg-clinical-grid absolute inset-0" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
            Zeon for institutions
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            Uniform your whole facility — and save up to 25%
          </h1>
          <p className="mt-4 max-w-2xl text-ink-100">
            Hospitals, clinics, laboratories, pharmacies and schools trust Zeon
            for bulk scrubs, lab coats and theatre wear with free embroidery and
            consistent sizing.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#quote"
              className="rounded-full bg-brand-500 px-7 py-3.5 text-sm font-bold text-white hover:bg-brand-400"
            >
              Request a quote
            </a>
            <a
              href="tel:+2348012345678"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10"
            >
              Call wholesale: +234 801 234 5678
            </a>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
            Simple, transparent bulk pricing
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-500">
            Discounts apply automatically to your quote. Mix products, sizes and
            colours freely within one order.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.qty}
              className={`rounded-3xl border-2 p-7 ${
                t.highlight
                  ? "border-brand-600 bg-brand-50/60 shadow-xl shadow-brand-900/10"
                  : "border-ink-100 bg-white"
              }`}
            >
              {t.highlight && (
                <p className="mb-3 w-fit rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                  Most popular
                </p>
              )}
              <p className="text-sm font-bold uppercase tracking-widest text-ink-500">
                {t.qty} pieces
              </p>
              <p className="mt-1 text-3xl font-black text-ink-900">{t.discount}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-50/70 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <div key={title} className="rounded-2xl border border-ink-100 bg-white p-6">
                <p className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-black text-white">
                  {i + 1}
                </p>
                <h3 className="mt-4 font-bold text-ink-900">{title}</h3>
                <p className="mt-1 text-sm text-ink-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote form */}
      <section id="quote" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
              Request your wholesale quote
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-500">
              Fill in the form and our wholesale team will respond within one
              business day with pricing, free samples and a production timeline.
              Prefer email? Write to{" "}
              <a href="mailto:wholesale@zeonapparelltd.com" className="font-bold text-brand-700">
                wholesale@zeonapparelltd.com
              </a>
            </p>
            <div className="mt-8 space-y-4 text-sm">
              {[
                ["120+ facilities served", "From single clinics to 800-bed teaching hospitals."],
                ["Consistent sizing", "Every batch cut to the same spec — reorder with confidence."],
                ["Embroidery in-house", "Names, roles and logos stitched in our Lagos workroom."],
              ].map(([t, d]) => (
                <div key={t} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="font-bold text-ink-900">{t}</p>
                    <p className="text-ink-500">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="h-fit rounded-3xl border border-ink-100 bg-white p-6 shadow-xl shadow-ink-900/5 sm:p-8"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-700">Your name *</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Full name" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-700">Phone *</label>
                <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="0801…" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-ink-700">Work email *</label>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="you@hospital.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-ink-700">Organisation</label>
                <input value={form.organisation} onChange={(e) => set("organisation", e.target.value)} className={inputCls} placeholder="Hospital / clinic name" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-700">Est. quantity</label>
                <select value={form.quantity} onChange={(e) => set("quantity", e.target.value)} className={inputCls}>
                  <option>10 – 49 pieces</option>
                  <option>50 – 199 pieces</option>
                  <option>200 – 499 pieces</option>
                  <option>500+ pieces</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-700">Products needed</label>
                <input value={form.products} onChange={(e) => set("products", e.target.value)} className={inputCls} placeholder="e.g. Scrub sets, lab coats" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-ink-700">Requirements *</label>
                <textarea required rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} className={inputCls} placeholder="Colours, sizes breakdown, embroidery, timeline…" />
              </div>
            </div>
            {message && (
              <p className={`mt-3 rounded-xl px-4 py-3 text-[13px] font-semibold ${status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-4 w-full rounded-full bg-brand-600 py-3.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Request quote"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
