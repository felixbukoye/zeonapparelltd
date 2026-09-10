"use client";

import { useState } from "react";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send message.");
      setStatus("done");
      setMessage(data.message);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not send message.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">Contact us</h1>
      <p className="mt-1 text-sm text-ink-500">
        Questions about sizing, orders or wholesale? We reply within one business day.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <PinIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-bold text-ink-900">Visit our store</h2>
            <p className="mt-1 text-sm text-ink-500">
              14 Ogudu Road, Ikeja,
              <br />
              Lagos, Nigeria
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Mon – Sat: 8:00am – 6:00pm
              <br />
              Sundays: closed
            </p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <PhoneIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-bold text-ink-900">Call or WhatsApp</h2>
            <p className="mt-1 text-sm font-bold text-ink-900">+234 801 234 5678</p>
            <p className="text-sm text-ink-500">Wholesale line: +234 809 876 5432</p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <MailIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-bold text-ink-900">Email</h2>
            <p className="mt-1 text-sm text-ink-500">hello@zeonapparelltd.com</p>
            <p className="text-sm text-ink-500">wholesale@zeonapparelltd.com</p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="h-fit rounded-3xl border border-ink-100 bg-white p-6 sm:p-8"
        >
          <h2 className="text-xl font-black text-ink-900">Send us a message</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink-700">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink-700">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputCls}
                placeholder="0801…"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink-700">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-ink-700">Message *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className={inputCls}
                placeholder="How can we help?"
              />
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
            className="mt-4 w-full rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
