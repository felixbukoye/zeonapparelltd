"use client";

import { useState } from "react";
import Image from "next/image";
import type { Order } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import OrderTimeline, { statusColor } from "@/components/OrderTimeline";
import { BoxIcon } from "@/components/icons";

export default function TrackPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function track(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(code.trim())}?email=${encodeURIComponent(email.trim())}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found.");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <BoxIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900">
          Track your order
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Enter your order code and the email used at checkout.
        </p>
      </div>

      <form
        onSubmit={track}
        className="mx-auto mt-6 grid max-w-xl gap-3 rounded-3xl border border-ink-100 bg-white p-5 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Order code (e.g. ZN-2026-…)"
          className="rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-ink-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "…" : "Track"}
        </button>
      </form>
      {error && (
        <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {order && (
        <div className="animate-fade-up mt-6 space-y-6">
          <div className="rounded-3xl border border-ink-100 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-bold text-ink-900">{order.code}</p>
                <p className="text-xs text-ink-500">
                  {order.items.reduce((s, i) => s + i.qty, 0)} item(s) · {formatNaira(order.total)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="mt-5">
              <OrderTimeline order={order} />
            </div>
          </div>
          <div className="rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="font-black text-ink-900">Items</h2>
            <ul className="mt-3 space-y-3">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">
                      {item.name} × {item.qty}
                    </span>
                    <span className="block text-xs text-ink-500">
                      {item.color} · Size {item.size}
                    </span>
                  </span>
                  <span className="text-sm font-bold">{formatNaira(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
