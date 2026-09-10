"use client";

import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS, formatDateTime, formatNaira } from "@/lib/format";
import { statusColor } from "@/components/OrderTimeline";

const FILTERS = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const NEXT_STATUS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function load(status = filter) {
    setLoading(true);
    const res = await fetch(`/api/admin/orders?status=${status}`, { cache: "no-store" });
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeFilter(s: string) {
    setFilter(s);
    load(s);
  }

  async function updateStatus(order: Order, status: OrderStatus) {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: note.trim() || undefined }),
    });
    if (res.ok) {
      setNote("");
      await load();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-bold capitalize transition ${
              filter === f ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink-500">
          No orders found.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-ink-900">{o.code}</p>
                  <p className="text-xs text-ink-500">
                    {o.name} · {o.email} · {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black">{formatNaira(o.total)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${statusColor(o.status)}`}>
                    {o.status}
                  </span>
                </div>
              </button>

              {expanded === o.id && (
                <div className="mt-4 grid gap-4 border-t border-ink-100 pt-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Items</p>
                    <ul className="mt-2 space-y-1.5">
                      {o.items.map((it, i) => (
                        <li key={i} className="text-ink-700">
                          {it.name} × {it.qty} — {it.color}, size {it.size} ·{" "}
                          <strong>{formatNaira(it.price * it.qty)}</strong>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-ink-600">
                      Subtotal {formatNaira(o.subtotal)} + delivery {formatNaira(o.delivery)} ={" "}
                      <strong className="text-ink-900">{formatNaira(o.total)}</strong>
                    </p>
                    <p className="mt-1 text-ink-600">
                      Payment: <strong>{o.paymentMethod}</strong> ({o.paymentStatus})
                    </p>
                    {o.notes && (
                      <p className="mt-2 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">
                        <strong>Notes:</strong> {o.notes}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink-400">
                      Deliver to
                    </p>
                    <p className="mt-2 text-ink-700">
                      {o.address}, {o.city} ({o.zone})
                      <br />
                      {o.phone}
                    </p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-ink-400">
                      Update status
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o, e.target.value as OrderStatus)}
                        className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500"
                      >
                        {NEXT_STATUS.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Status note (optional)"
                        className="min-w-0 flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                      />
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-ink-400">
                      Timeline
                    </p>
                    <ul className="mt-1.5 space-y-1 text-xs text-ink-500">
                      {o.timeline.map((t, i) => (
                        <li key={i}>
                          {t.status} — {formatDateTime(t.at)}
                          {t.note ? ` (${t.note})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
