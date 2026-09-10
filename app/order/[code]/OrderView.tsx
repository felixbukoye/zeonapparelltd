"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Order } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import OrderTimeline, { statusColor } from "@/components/OrderTimeline";
import { CheckIcon } from "@/components/icons";

export default function OrderView({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [needEmail, setNeedEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(emailValue: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(code)}?email=${encodeURIComponent(emailValue)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) {
        if (data.gated) setNeedEmail(true);
        throw new Error(data.error || "Order not found.");
      }
      setOrder(data.order);
      setNeedEmail(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(searchParams.get("email") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-ink-500">
        Loading your order…
      </div>
    );
  }

  if (needEmail && !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-black text-ink-900">Verify it&apos;s you</h1>
        <p className="mt-2 text-sm text-ink-500">
          Enter the email address used for order <strong>{decodeURIComponent(code)}</strong>.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(email);
          }}
          className="mt-5 space-y-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-ink-900 py-3 text-sm font-bold text-white hover:bg-brand-700"
          >
            View order
          </button>
        </form>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-ink-900">Order not found</h1>
        <p className="mt-2 text-sm text-ink-500">{error || "Please check your order code."}</p>
        <Link
          href="/track"
          className="mt-6 inline-block rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white"
        >
          Track another order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="rounded-3xl border border-ink-100 bg-white p-6 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-black text-ink-900 sm:text-3xl">
          Thank you, {order.name.split(" ")[0]}! Order received.
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          A confirmation has been sent to <strong>{order.email}</strong>. Your
          order code is:
        </p>
        <p className="mx-auto mt-3 w-fit rounded-2xl bg-ink-900 px-6 py-3 font-mono text-lg font-bold tracking-wide text-white">
          {order.code}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
          <span className={`rounded-full px-3 py-1.5 uppercase tracking-wide ${statusColor(order.status)}`}>
            {order.status}
          </span>
          <span className="rounded-full bg-ink-100 px-3 py-1.5 text-ink-700">
            {order.paymentMethod === "pay-on-delivery"
              ? "Pay on delivery"
              : order.paymentMethod === "card"
                ? "Card (demo)"
                : "Bank transfer"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="font-black text-ink-900">Delivery progress</h2>
          <div className="mt-4">
            <OrderTimeline order={order} />
          </div>
        </div>
        <div className="rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="font-black text-ink-900">Order details</h2>
          <ul className="mt-4 space-y-3">
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
          <dl className="mt-4 space-y-1.5 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-bold">{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Delivery ({order.zone})</dt>
              <dd className="font-bold">
                {order.delivery === 0 ? "FREE" : formatNaira(order.delivery)}
              </dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-black">Total</dt>
              <dd className="font-black text-brand-700">{formatNaira(order.total)}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl bg-ink-50 p-4 text-[13px] leading-relaxed text-ink-600">
            <p className="font-bold text-ink-900">Delivering to</p>
            <p>
              {order.address}, {order.city}
            </p>
            <p>{order.phone}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Continue shopping
        </Link>
        <Link
          href="/track"
          className="rounded-full border border-ink-200 px-6 py-3 text-sm font-bold text-ink-800 hover:border-ink-400"
        >
          Track this order later
        </Link>
      </div>
    </div>
  );
}
