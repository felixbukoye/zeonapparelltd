"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";
import { statusColor } from "@/components/OrderTimeline";

interface Stats {
  revenue: number;
  orderCount: number;
  productCount: number;
  lowStock: number;
  newEnquiries: number;
  pendingReviews: number;
  byStatus: Record<string, number>;
  recentOrders: Order[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <p className="text-sm text-ink-500">Loading dashboard…</p>;
  }

  const cards = [
    ["Revenue", formatNaira(stats.revenue), "/admin/orders"],
    ["Orders", String(stats.orderCount), "/admin/orders"],
    ["Products", String(stats.productCount), "/admin/products"],
    ["Low stock (≤20)", String(stats.lowStock), "/admin/products"],
    ["New enquiries", String(stats.newEnquiries), "/admin/enquiries"],
    ["Reviews to moderate", String(stats.pendingReviews), "/admin/reviews"],
  ] as const;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(([label, value, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-brand-300 hover:shadow-md"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400">
              {label}
            </p>
            <p className="mt-1 text-xl font-black text-ink-900 sm:text-2xl">{value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-ink-900">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-bold text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No orders yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {stats.recentOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-mono text-sm font-bold text-ink-900">{o.code}</p>
                  <p className="text-xs text-ink-500">
                    {o.name} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black">{formatNaira(o.total)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
