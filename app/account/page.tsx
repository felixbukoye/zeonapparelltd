"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { formatDate, formatNaira } from "@/lib/format";
import { statusColor } from "@/components/OrderTimeline";
import { LogoutIcon } from "@/components/icons";

export default function AccountPage() {
  const { user, authLoading, refreshUser, logout } = useStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profile, setProfile] = useState({ name: "", phone: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?next=/account");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        city: user.city ?? "",
      });
      fetch("/api/orders", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Could not save.");
      await refreshUser();
      setSavedMsg("Profile updated.");
    } catch {
      setSavedMsg("Could not save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-ink-500">
        Loading your account…
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink-900">
            Hi, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-500">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Admin dashboard
            </Link>
          )}
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-bold text-ink-700 hover:border-red-300 hover:text-red-600"
          >
            <LogoutIcon className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="font-black text-ink-900">Order history</h2>
          {ordersLoading ? (
            <p className="mt-4 text-sm text-ink-500">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-ink-50 p-6 text-center">
              <p className="text-sm font-semibold text-ink-700">No orders yet</p>
              <p className="mt-1 text-xs text-ink-500">
                Your orders will appear here once you shop.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/order/${encodeURIComponent(o.code)}?email=${encodeURIComponent(o.email)}`}
                    className="flex items-center justify-between gap-3 py-4 transition hover:bg-ink-50/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-bold text-ink-900">
                        {o.code}
                      </p>
                      <p className="text-xs text-ink-500">
                        {formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} item(s)
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-black text-ink-900">
                        {formatNaira(o.total)}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="h-fit rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="font-black text-ink-900">Profile &amp; address</h2>
          <form onSubmit={saveProfile} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink-700">Full name</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink-700">Phone</label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink-700">Address</label>
              <input
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                placeholder="Street, area"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-ink-700">City</label>
              <input
                value={profile.city}
                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-ink-900 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {savedMsg && (
              <p className="text-center text-xs font-semibold text-emerald-600">{savedMsg}</p>
            )}
          </form>
          <Link
            href="/wishlist"
            className="mt-4 block rounded-2xl bg-brand-50 p-4 text-sm font-bold text-brand-800 hover:bg-brand-100"
          >
            View my wishlist →
          </Link>
        </section>
      </div>
    </div>
  );
}
