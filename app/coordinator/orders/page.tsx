"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Collection, TeamOrder } from "@/lib/types";
import { TEAM_STATUS } from "@/lib/order-status";
import { formatDate, formatNaira, isExpired, timeLeft } from "@/lib/format";
import { ButtonLink, EmptyState, StatusBadge } from "@/components/ui";
import { CheckIcon, ClockIcon, PlusIcon } from "@/components/icons";

const TABS = [
  ["all", "All"],
  ["active", "Active"],
  ["awaiting", "Awaiting Approval"],
  ["complete", "Complete"],
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<TeamOrder[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collections", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCollections(d.collections ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/team-orders?status=${tab}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, [tab]);

  const colName = (id: string) =>
    collections.find((c) => c.id === id)?.name ?? "Collection";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-navy-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-mist-500">
            Team and self orders — from quote to dispatch.
          </p>
        </div>
        <ButtonLink href="/coordinator/orders/new">
          <PlusIcon className="h-4 w-4" /> New order
        </ButtonLink>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto border-b border-line">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`min-h-[48px] whitespace-nowrap px-4 text-sm font-bold transition ${
              tab === id
                ? "border-b-2 border-primary-600 text-primary-700"
                : "text-mist-500 hover:text-navy-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No orders here"
            body={
              tab === "all"
                ? "Once you build an order from a collection, it'll show up here."
                : `Nothing ${tab === "complete" ? "completed" : tab === "active" ? "active" : "waiting"} right now.`
            }
            action={
              <ButtonLink href="/coordinator/orders/new" variant="secondary">
                Create an order
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((o) => {
            const submitted = o.roster.filter((r) => r.submitted).length;
            const expired = isExpired(o.inviteExpiry);
            return (
              <Link
                key={o.id}
                href={`/coordinator/orders/${o.id}`}
                className="block rounded-2xl border border-line bg-white p-5 transition hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-navy-900">
                      {o.code}
                      <span className="ml-2 rounded-full bg-paper px-2 py-0.5 font-sans text-[11px] font-bold text-mist-500">
                        {o.type === "team" ? "Team" : "Self"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[13px] text-mist-500">
                      {colName(o.collectionId)} · {o.headcount} wearers ·{" "}
                      {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-black">{formatNaira(o.quote.total)}</span>
                    <StatusBadge
                      tone={TEAM_STATUS[o.status].tone}
                      label={TEAM_STATUS[o.status].label}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line pt-3 text-[13px]">
                  <span className="font-semibold text-navy-900">
                    Responses{" "}
                    <strong className="text-primary-700">
                      {submitted} of {o.headcount}
                    </strong>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold ${
                      expired ? "text-error" : "text-mist-500"
                    }`}
                  >
                    <ClockIcon className="h-4 w-4" />
                    Invite: {expired ? "expired" : timeLeft(o.inviteExpiry)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-mist-500">
                    {o.embroidery.mockupApproved ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-success" /> Mockup approved
                      </>
                    ) : o.embroidery.digitization === "pending" ? (
                      <>🧵 Digitizing logo…</>
                    ) : o.embroidery.logoName ? (
                      <>🧵 Logo uploaded</>
                    ) : (
                      <>🧵 Text embroidery</>
                    )}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
