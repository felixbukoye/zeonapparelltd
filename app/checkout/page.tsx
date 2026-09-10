"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  DELIVERY_ZONES,
  FREE_DELIVERY_THRESHOLD,
  PAYMENT_METHODS,
  formatNaira,
} from "@/lib/format";
import { CheckIcon, ShieldIcon } from "@/components/icons";

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart, user } = useStore();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Lagos",
    zone: "lagos",
    paymentMethod: "bank-transfer",
    notes: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        email: f.email || user.email,
        phone: f.phone || user.phone || "",
        address: f.address || user.address || "",
        city: f.city || user.city || "Lagos",
      }));
    }
  }, [user]);

  const zoneInfo = useMemo(
    () => DELIVERY_ZONES.find((z) => z.id === form.zone) ?? DELIVERY_ZONES[0],
    [form.zone]
  );
  const deliveryFee =
    cartSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : zoneInfo.fee;
  const total = cartSubtotal + deliveryFee;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (form.paymentMethod === "pay-on-delivery" && form.zone !== "lagos") {
      setError("Pay on delivery is available for Lagos orders only.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.map((l) => ({
            productId: l.productId,
            size: l.size,
            color: l.color,
            qty: l.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place order.");
      clearCart();
      router.push(
        `/order/${encodeURIComponent(data.order.code)}?email=${encodeURIComponent(data.order.email)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order.");
      setPlacing(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  if (cart.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-ink-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink-500">
          Add some products before heading to checkout.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-brand-600 px-7 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">Checkout</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
        <ShieldIcon className="h-4 w-4 text-emerald-600" />
        Secure checkout — your details are protected.
      </p>

      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-black text-ink-900">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-xs text-white">1</span>
              Contact &amp; delivery details
            </h2>
            {!user && (
              <p className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-[13px] text-brand-900">
                Checking out as a guest.{" "}
                <Link href="/login?next=/checkout" className="font-bold underline">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link href="/register?next=/checkout" className="font-bold underline">
                  create an account
                </Link>{" "}
                to track orders faster.
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-bold text-ink-700">Full name *</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Adaeze Okafor" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-700">Phone *</label>
                <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 0801 234 5678" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-ink-700">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-ink-700">Delivery address *</label>
                <input required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, area" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-700">City *</label>
                <input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Lagos" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-ink-700">Delivery zone *</label>
                <select value={form.zone} onChange={(e) => set("zone", e.target.value)} className={inputCls}>
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label} — {formatNaira(z.fee)} ({z.eta})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-ink-700">
                  Order notes <span className="font-normal text-ink-400">(optional — embroidery names, delivery instructions)</span>
                </label>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="e.g. Embroider 'Dr. Adaeze — LUTH' on the lab coat" className={inputCls} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-black text-ink-900">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-xs text-white">2</span>
              Payment method
            </h2>
            <div className="mt-4 space-y-2.5">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                    form.paymentMethod === m.id
                      ? "border-brand-600 bg-brand-50/50"
                      : "border-ink-100 hover:border-ink-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={form.paymentMethod === m.id}
                    onChange={(e) => set("paymentMethod", e.target.value)}
                    className="mt-1 h-4 w-4 accent-teal-700"
                  />
                  <span>
                    <span className="block text-sm font-bold text-ink-900">{m.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-6 lg:sticky lg:top-32">
          <h2 className="font-black text-ink-900">Order summary</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto nice-scroll">
            {cart.map((l) => (
              <li key={l.key} className="flex items-center gap-3">
                <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                  <Image src={l.image} alt={l.name} fill sizes="48px" className="object-cover" />
                  <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-white">
                    {l.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink-900">{l.name}</span>
                  <span className="block text-xs text-ink-500">{l.color} · {l.size}</span>
                </span>
                <span className="text-[13px] font-bold text-ink-900">{formatNaira(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-bold text-ink-900">{formatNaira(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Delivery ({zoneInfo.eta})</dt>
              <dd className="font-bold text-ink-900">
                {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : formatNaira(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-3 text-base">
              <dt className="font-black text-ink-900">Total</dt>
              <dd className="font-black text-brand-700">{formatNaira(total)}</dd>
            </div>
          </dl>
          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={placing}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-60"
          >
            {placing ? (
              "Placing your order…"
            ) : (
              <>
                <CheckIcon className="h-4.5 w-4.5" /> Place order · {formatNaira(total)}
              </>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-ink-400">
            By placing this order you agree to our{" "}
            <Link href="/terms" className="underline">terms</Link>.
          </p>
        </aside>
      </form>
    </div>
  );
}
