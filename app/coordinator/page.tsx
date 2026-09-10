"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Collection, TeamOrder } from "@/lib/types";
import { TEAM_STATUS } from "@/lib/order-status";
import { formatDate, formatNaira, isExpiringSoon } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import InviteCard from "@/components/InviteCard";
import { AlertIcon, ArrowRightIcon, BoxIcon, ClockIcon, PlusIcon, UsersIcon } from "@/components/icons";
import { ButtonLink, EmptyState, StatusBadge } from "@/components/ui";

export default function CoordinatorHome() {
  const { user } = useApp();
  const [orders, setOrders] = useState<TeamOrder[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/team-orders", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/collections", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([o, c]) => {
        setOrders(o.orders ?? []);
        setCollections(c.collections ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const resumeOrder = orders.find((o) =>
    ["draft", "quote", "awaiting-deposit"].includes(o.status)
  );
  const collecting = orders.filter((o) => o.status === "awaiting-submissions");
  const alerts: { tone: "warning" | "info"; text: string; href: string }[] = [];
  for (const o of orders) {
    const missing = o.headcount - o.roster.filter((r) => r.submitted).length;
    if (o.status === "awaiting-submissions" && missing > 0) {
      alerts.push({
        tone: "warning",
        text: `You're missing ${missing} response${missing === 1 ? "" : "s"} on ${o.code} — production planning needs everyone in.`,
        href: `/coordinator/orders/${o.id}?tab=roster`,
      });
    }
    if (
      ["awaiting-submissions", "awaiting-approval"].includes(o.status) &&
      isExpiringSoon(o.inviteExpiry)
    ) {
      alerts.push({
        tone: "info",
        text: `Invite link for ${o.code} expires soon — share a reminder with your team.`,
        href: `/coordinator/orders/${o.id}?tab=roster`,
      });
    }
    if (o.status === "awaiting-deposit") {
      alerts.push({
        tone: "warning",
        text: `${o.code}: ${formatNaira(o.quote.depositDue)} deposit due to unlock production.`,
        href: `/coordinator/orders/${o.id}?tab=payments`,
      });
    }
    if (o.status === "awaiting-balance") {
      alerts.push({
        tone: "warning",
        text: `${o.code}: balance of ${formatNaira(o.quote.balance)} due before dispatch.`,
        href: `/coordinator/orders/${o.id}?tab=payments`,
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-28 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-black tracking-tight text-navy-900">
        Good to see you{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-1 text-sm text-mist-500">
        {user?.orgName || "Your organisation"} · Here&apos;s where your uniforms stand.
      </p>

      {/* Resume setup */}
      {resumeOrder ? (
        <Link
          href={`/coordinator/orders/${resumeOrder.id}`}
          className="group mt-5 flex items-center justify-between gap-4 rounded-2xl bg-navy-900 p-5 sm:p-6"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-400">
              Pick up where you left off
            </p>
            <p className="mt-1 font-display text-lg font-black text-white">
              {resumeOrder.code} · {TEAM_STATUS[resumeOrder.status].label}
            </p>
            <p className="mt-0.5 text-sm text-white/60">
              {resumeOrder.headcount} wearers · {resumeOrder.orgName}
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950 transition group-hover:bg-gold-400">
            <ArrowRightIcon className="h-5 w-5" />
          </span>
        </Link>
      ) : (
        orders.length === 0 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
            <div className="p-5 sm:p-6">
              <p className="font-display text-lg font-black text-navy-900">
                Let&apos;s outfit {user?.orgName || "your team"} 🎉
              </p>
              <p className="mt-1 max-w-lg text-sm text-mist-500">
                Three steps: build a collection, create an order, share one
                invite link. Most coordinators finish setup in under 15 minutes.
              </p>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <ButtonLink href="/coordinator/collections/new">
                  <PlusIcon className="h-4 w-4" /> Build my first collection
                </ButtonLink>
                <ButtonLink href="/coordinator/orders/new" variant="secondary">
                  Or start an order directly
                </ButtonLink>
              </div>
            </div>
          </div>
        )
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mt-5 space-y-2.5">
          {alerts.slice(0, 4).map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                a.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300"
                  : "border-primary-100 bg-primary-50 text-navy-900 hover:border-primary-200"
              }`}
            >
              {a.tone === "warning" ? (
                <AlertIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              ) : (
                <ClockIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              )}
              {a.text} →
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {(
          [
            ["/coordinator/collections/new", "New collection", PlusIcon],
            ["/coordinator/orders/new", "New order", BoxIcon],
            ["/catalogue", "Browse styles", ArrowRightIcon],
            ["/discovery", "Discovery", UsersIcon],
          ] as [string, string, typeof BoxIcon][]
        ).map(([href, label, Icon]) => (
          <Link
            key={href + label}
            href={href}
            className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-white text-sm font-bold text-navy-900 transition hover:border-primary-300 hover:shadow-md"
          >
            <Icon className="h-5 w-5 text-primary-600" />
            {label}
          </Link>
        ))}
      </div>

      {/* Live collecting trackers */}
      {collecting.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-base font-black text-navy-900">
            Live — sizes rolling in
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {collecting.slice(0, 4).map((o) => (
              <div key={o.id}>
                <InviteCard
                  token={o.inviteToken}
                  submitted={o.roster.filter((r) => r.submitted).length}
                  headcount={o.headcount}
                  expiry={o.inviteExpiry}
                  orgName={o.orgName}
                />
                <Link
                  href={`/coordinator/orders/${o.id}?tab=roster`}
                  className="mt-1.5 inline-block px-1 text-[13px] font-bold text-primary-700 hover:underline"
                >
                  {o.code} → Open roster
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-black text-navy-900">Recent orders</h2>
          <Link href="/coordinator/orders" className="text-sm font-bold text-primary-700 hover:underline">
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="Once you build an order from a collection, it'll show up here with live tracking."
            action={
              <ButtonLink href="/coordinator/orders/new" variant="secondary">
                Create an order
              </ButtonLink>
            }
          />
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/coordinator/orders/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3.5"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-navy-900">{o.code}</p>
                    <p className="text-xs text-mist-500">
                      {o.headcount} wearers · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-black">{formatNaira(o.quote.total)}</span>
                    <StatusBadge
                      tone={TEAM_STATUS[o.status].tone}
                      label={TEAM_STATUS[o.status].label}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {collections.length > 0 && (
        <div className="mt-4 rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-black text-navy-900">
              Your collections ({collections.length})
            </h2>
            <Link href="/coordinator/collections" className="text-sm font-bold text-primary-700 hover:underline">
              Manage →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {collections.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/coordinator/collections/${c.id}`}
                className="rounded-xl bg-paper px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-line"
              >
                {c.name}
                <span className="ml-2 text-xs font-semibold text-mist-500">
                  {c.status === "for-production" ? "✓ For Production" : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
