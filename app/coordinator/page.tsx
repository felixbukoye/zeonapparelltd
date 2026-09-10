"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Collection, RosterEntry, TeamOrder } from "@/lib/types";
import { TEAM_STATUS } from "@/lib/order-status";
import { formatDate, formatNaira, isExpiringSoon } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import {
  AlertIcon,
  ArrowRightIcon,
  BoxIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  PlusIcon,
  QrIcon,
  UsersIcon,
} from "@/components/icons";
import {
  Avatar,
  ButtonLink,
  Card,
  CardHeader,
  CardLink,
  Delta,
  EmptyState,
  FilterButton,
  Legend,
  LineChart,
  ProgressBar,
  StatusBadge,
  useDaypart,
} from "@/components/ui";

type OrderFilter = "all" | "collecting" | "production" | "attention";

const DAY = 86_400_000;

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/* Deterministic decorative QR-style pattern seeded from the invite token. */
function QrPattern({ seed }: { seed: string }) {
  const N = 15;
  let h = 7;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h / 4294967296;
  };
  const cells: boolean[] = [];
  for (let i = 0; i < N * N; i++) cells.push(rand() > 0.52);
  const inFinder = (r: number, c: number) =>
    (r < 5 && c < 5) || (r < 5 && c >= N - 5) || (r >= N - 5 && c < 5);
  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="h-24 w-24" aria-hidden>
      <rect width={N} height={N} rx={1.5} fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / N);
        const c = i % N;
        if (!on || inFinder(r, c)) return null;
        return (
          <rect key={i} x={c + 0.12} y={r + 0.12} width={0.76} height={0.76} rx={0.2} fill="#0B1B3F" />
        );
      })}
      {[
        [0, 0],
        [0, N - 5],
        [N - 5, 0],
      ].map(([r, c]) => (
        <g key={`${r}-${c}`}>
          <rect x={c} y={r} width={5} height={5} rx={1} fill="#0B1B3F" />
          <rect x={c + 1} y={r + 1} width={3} height={3} rx={0.6} fill="#fff" />
          <rect x={c + 1.8} y={r + 1.8} width={1.4} height={1.4} rx={0.3} fill="#3B6EF6" />
        </g>
      ))}
    </svg>
  );
}

export default function CoordinatorHome() {
  const { user } = useApp();
  const daypart = useDaypart();
  const [orders, setOrders] = useState<TeamOrder[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [copied, setCopied] = useState(false);

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

  const stats = useMemo(() => {
    const now = startOfDay(new Date()).getTime();
    const weekAgo = now - 7 * DAY;
    const twoWeeksAgo = now - 14 * DAY;
    const active = orders.filter((o) => !["delivered", "complete"].includes(o.status));
    const wearers = orders.reduce((a, o) => a + o.headcount, 0);
    const submitted = orders.reduce(
      (a, o) => a + o.roster.filter((r) => r.submitted).length,
      0
    );
    const value = orders.reduce((a, o) => a + (o.quote?.total ?? 0), 0);
    const newThisWeek = orders.filter((o) => new Date(o.createdAt).getTime() >= weekAgo).length;
    const newPrevWeek = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= twoWeeksAgo && t < weekAgo;
    }).length;
    const submittedThisWeek = orders.reduce(
      (a, o) =>
        a +
        o.roster.filter(
          (r) => r.submitted && r.submittedAt && new Date(r.submittedAt).getTime() >= weekAgo
        ).length,
      0
    );
    return {
      active: active.length,
      activeDelta: newThisWeek - newPrevWeek,
      pct: wearers ? Math.round((submitted / wearers) * 100) : 0,
      submitted,
      wearers,
      submittedThisWeek,
      value,
      valueDelta: newThisWeek > 0 ? Math.round((newThisWeek / Math.max(1, orders.length)) * 100) : 0,
    };
  }, [orders]);

  const weekSeries = useMemo(() => {
    const labels: string[] = [];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const today = startOfDay(new Date());
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY);
      labels.push(d.toLocaleDateString("en", { weekday: "short" }));
    }
    for (const o of orders) {
      for (const r of o.roster) {
        if (!r.submitted || !r.submittedAt) continue;
        const t = startOfDay(new Date(r.submittedAt)).getTime();
        const idx = 6 - Math.round((today.getTime() - t) / DAY);
        if (idx >= 0 && idx < 7) counts[idx]++;
      }
    }
    const avg = counts.reduce((a, b) => a + b, 0) / 7;
    return { labels, counts, avgLine: counts.map(() => Math.round(avg * 10) / 10) };
  }, [orders]);

  const latestResponses: { order: TeamOrder; entry: RosterEntry }[] = useMemo(() => {
    const all: { order: TeamOrder; entry: RosterEntry }[] = [];
    for (const o of orders)
      for (const r of o.roster)
        if (r.submitted) all.push({ order: o, entry: r });
    all.sort(
      (a, b) =>
        new Date(b.entry.submittedAt ?? 0).getTime() -
        new Date(a.entry.submittedAt ?? 0).getTime()
    );
    return all.slice(0, 5);
  }, [orders]);

  const resumeOrder = orders.find((o) =>
    ["draft", "quote", "awaiting-deposit"].includes(o.status)
  );
  const collecting = orders.filter((o) => o.status === "awaiting-submissions");
  const inviteOrder = collecting[0] ?? orders.find((o) => o.inviteToken);

  const alerts: { tone: "warning" | "info"; text: string; href: string }[] = [];
  for (const o of orders) {
    const missing = o.headcount - o.roster.filter((r) => r.submitted).length;
    if (o.status === "awaiting-submissions" && missing > 0) {
      alerts.push({
        tone: "warning",
        text: `Missing ${missing} response${missing === 1 ? "" : "s"} on ${o.code}`,
        href: `/coordinator/orders/${o.id}?tab=roster`,
      });
    }
    if (
      ["awaiting-submissions", "awaiting-approval"].includes(o.status) &&
      isExpiringSoon(o.inviteExpiry)
    ) {
      alerts.push({
        tone: "info",
        text: `Invite link for ${o.code} expires soon`,
        href: `/coordinator/orders/${o.id}?tab=roster`,
      });
    }
    if (o.status === "awaiting-deposit") {
      alerts.push({
        tone: "warning",
        text: `${o.code}: ${formatNaira(o.quote.depositDue)} deposit due`,
        href: `/coordinator/orders/${o.id}?tab=payments`,
      });
    }
    if (o.status === "awaiting-balance") {
      alerts.push({
        tone: "warning",
        text: `${o.code}: balance ${formatNaira(o.quote.balance)} due`,
        href: `/coordinator/orders/${o.id}?tab=payments`,
      });
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "collecting")
      return ["awaiting-submissions", "awaiting-approval"].includes(o.status);
    if (filter === "production")
      return ["in-production", "dispatched"].includes(o.status);
    return ["awaiting-deposit", "awaiting-balance", "draft", "quote"].includes(o.status);
  });

  async function copyInvite(token: string) {
    const link = `${window.location.origin}/intake/${token}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-9 w-1/3 !rounded-full" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 !rounded-card" />
          ))}
        </div>
        <div className="skeleton h-64 !rounded-card" />
      </div>
    );
  }

  const firstName = user?.name ? `, ${user.name.split(" ")[0]}` : "";
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      {/* Greeting + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-navy-900 sm:text-[28px]">
            {daypart}{firstName}!
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-mist-500">
            <CalendarIcon className="h-4 w-4 text-mist-400" />
            {todayLabel} · {user?.orgName || "Your organisation"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <ButtonLink href="/coordinator/orders/new" variant="secondary">
            <UsersIcon className="h-4 w-4" /> Support
          </ButtonLink>
          <ButtonLink href="/coordinator/orders/new">
            <PlusIcon className="h-4 w-4" /> Check now
          </ButtonLink>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterButton
          icon={<BoxIcon className="h-4 w-4 text-mist-400" />}
          label="All orders"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          icon={<UsersIcon className="h-4 w-4 text-mist-400" />}
          label="Collecting sizes"
          active={filter === "collecting"}
          onClick={() => setFilter("collecting")}
        />
        <FilterButton
          icon={<ClockIcon className="h-4 w-4 text-mist-400" />}
          label="In production"
          active={filter === "production"}
          onClick={() => setFilter("production")}
        />
        <FilterButton
          icon={<AlertIcon className="h-4 w-4 text-mist-400" />}
          label="Needs attention"
          active={filter === "attention"}
          onClick={() => setFilter("attention")}
        />
      </div>

      {/* Stat band */}
      <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <Card>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-mist-500">Active orders</p>
            <Delta value={stats.activeDelta} />
          </div>
          <p className="tnum mt-2 text-[28px] font-bold leading-none tracking-tight text-navy-900 sm:text-[32px]">
            {stats.active}
          </p>
          <p className="mt-1.5 text-[11px] text-mist-400">vs last week</p>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-mist-500">Measurements in</p>
            <Delta value={stats.submittedThisWeek} suffix="" />
          </div>
          <p className="tnum mt-2 text-[28px] font-bold leading-none tracking-tight text-navy-900 sm:text-[32px]">
            {stats.pct}%
          </p>
          <p className="mt-1.5 text-[11px] text-mist-400">
            {stats.submitted} of {stats.wearers} wearers · +{stats.submittedThisWeek} this week
          </p>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-mist-500">Wearers</p>
            <StatusBadge tone="info" label={`${collecting.length} collecting`} />
          </div>
          <p className="tnum mt-2 text-[28px] font-bold leading-none tracking-tight text-navy-900 sm:text-[32px]">
            {stats.wearers}
          </p>
          <p className="mt-1.5 text-[11px] text-mist-400">across all orders</p>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-mist-500">Order value</p>
            <Delta value={stats.valueDelta} suffix="%" />
          </div>
          <p className="tnum mt-2 text-[24px] font-bold leading-none tracking-tight text-navy-900 sm:text-[28px]">
            {formatNaira(stats.value)}
          </p>
          <p className="mt-1.5 text-[11px] text-mist-400">lifetime with ZEON</p>
        </Card>
      </div>

      {/* Spotlight: resume setup (the ONE navy card) */}
      {resumeOrder ? (
        <Link
          href={`/coordinator/orders/${resumeOrder.id}`}
          className="spotlight group mt-5 flex items-center justify-between gap-4 p-5 sm:p-6"
        >
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">
              Pick up where you left off
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-white">
              {resumeOrder.code} · {TEAM_STATUS[resumeOrder.status].label}
            </p>
            <p className="mt-0.5 text-[13px] text-white/65">
              {resumeOrder.headcount} wearers · {resumeOrder.orgName}
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-navy-950 transition group-hover:bg-primary-100">
            <ArrowRightIcon className="h-5 w-5" />
          </span>
        </Link>
      ) : (
        orders.length === 0 && (
          <div className="spotlight mt-5 p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">
              Today&apos;s info
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
              Let&apos;s outfit {user?.orgName || "your team"} 🎉
            </p>
            <p className="mt-1 max-w-lg text-sm text-white/70">
              Three steps: build a collection, create an order, share one
              invite link. Most coordinators finish setup in under 15 minutes.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink href="/coordinator/collections/new" variant="secondary" className="!border-transparent">
                <PlusIcon className="h-4 w-4" /> Build my first collection
              </ButtonLink>
              <ButtonLink
                href="/coordinator/orders/new"
                variant="secondary"
                className="!border-white/25 !bg-transparent !text-white hover:!bg-white/10"
              >
                Or start an order directly
              </ButtonLink>
            </div>
          </div>
        )
      )}

      {/* Chart + order health */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Measurements rolling in"
            sub="Daily submissions · last 7 days"
            action={<CardLink href="/coordinator/orders">Report</CardLink>}
            onMenu={() => setFilter("collecting")}
            menuLabel="Show collecting orders"
          />
          <div className="mt-2 flex justify-end">
            <Legend
              items={[
                { color: "#3B6EF6", label: "Submitted" },
                { color: "#8A93A6", label: "Daily average" },
              ]}
            />
          </div>
          <div className="mt-2">
            {stats.submitted === 0 ? (
              <div className="rounded-2xl bg-paper px-6 py-10 text-center">
                <p className="text-sm font-bold text-navy-900">
                  No responses yet — this chart comes alive soon
                </p>
                <p className="mx-auto mt-1 max-w-sm text-[13px] text-mist-500">
                  Share your invite link and watch each wearer&apos;s
                  measurements land here in real time.
                </p>
              </div>
            ) : (
              <LineChart
                series={weekSeries.counts}
                secondSeries={weekSeries.avgLine}
                labels={weekSeries.labels}
                focusIndex={6}
                focusLabel={`Today · ${weekSeries.counts[6]} submitted`}
              />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Order health"
            sub="Collection progress"
            action={<CardLink href="/coordinator/orders">See details</CardLink>}
          />
          <div className="mt-4 space-y-4">
            {collecting.length === 0 && (
              <p className="rounded-2xl bg-paper px-4 py-5 text-center text-[13px] text-mist-500">
                Nothing collecting right now. New orders will track here.
              </p>
            )}
            {collecting.slice(0, 3).map((o) => {
              const done = o.roster.filter((r) => r.submitted).length;
              const pct = o.headcount ? Math.round((done / o.headcount) * 100) : 0;
              return (
                <div key={o.id}>
                  <ProgressBar
                    value={pct}
                    label={`${o.code} · ${done}/${o.headcount}`}
                    hint={o.inviteExpiry ? `Ends ${formatDate(o.inviteExpiry)}` : undefined}
                  />
                </div>
              );
            })}
            {latestResponses.length > 0 && (
              <div className="border-t border-line pt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-mist-400">
                  Latest responses
                </p>
                <ul className="-mx-2">
                  {latestResponses.slice(0, 3).map(({ order, entry }) => (
                    <li key={entry.id}>
                      <Link
                        href={`/coordinator/orders/${order.id}?tab=roster`}
                        className="flex min-h-[52px] items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-paper"
                      >
                        <Avatar name={entry.name || "Wearer"} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-bold text-navy-900">
                            {entry.name || "Unnamed wearer"}
                          </span>
                          <span className="block truncate text-[11px] text-mist-400">
                            {order.code}
                            {entry.department ? ` · ${entry.department}` : ""}
                          </span>
                        </span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent orders + passport/alerts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              filter === "all"
                ? "Recent orders"
                : filter === "collecting"
                  ? "Collecting sizes"
                  : filter === "production"
                    ? "In production"
                    : "Needs attention"
            }
            sub={`${filteredOrders.length} order${filteredOrders.length === 1 ? "" : "s"}`}
            action={<CardLink href="/coordinator/orders">View all →</CardLink>}
          />
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="Nothing here"
              body={
                orders.length === 0
                  ? "Once you build an order from a collection, it'll show up here with live tracking."
                  : "No orders match this filter right now."
              }
              action={
                <ButtonLink href="/coordinator/orders/new" variant="secondary">
                  Create an order
                </ButtonLink>
              }
            />
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {filteredOrders.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/coordinator/orders/${o.id}`}
                    className="flex min-h-[56px] flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar name={o.orgName || o.code} size="sm" />
                      <span className="min-w-0">
                        <span className="tnum block truncate text-sm font-bold text-navy-900">
                          {o.code}
                        </span>
                        <span className="block truncate text-[11px] text-mist-400">
                          {o.headcount} wearers · {formatDate(o.createdAt)}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2.5">
                      <span className="tnum text-sm font-bold text-navy-900">
                        {formatNaira(o.quote.total)}
                      </span>
                      <StatusBadge
                        tone={TEAM_STATUS[o.status].tone}
                        label={TEAM_STATUS[o.status].label}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          {/* Invite passport — the QR pattern card */}
          {inviteOrder && (
            <Card>
              <CardHeader
                title="Team invite"
                sub={`${inviteOrder.code} · one link for everyone`}
              />
              <div className="mt-3 flex items-center gap-4">
                <span className="rounded-2xl border border-line p-2">
                  <QrPattern seed={inviteOrder.inviteToken} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="tnum text-[22px] font-bold leading-none text-navy-900">
                    {inviteOrder.roster.filter((r) => r.submitted).length}
                    <span className="text-sm font-semibold text-mist-400">
                      /{inviteOrder.headcount}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-mist-400">responses in</p>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      isExpiringSoon(inviteOrder.inviteExpiry)
                        ? "bg-amber-50 text-amber-800"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <ClockIcon className="h-3 w-3" />
                    {isExpiringSoon(inviteOrder.inviteExpiry)
                      ? "Expiring soon"
                      : `Ends ${formatDate(inviteOrder.inviteExpiry)}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => copyInvite(inviteOrder.inviteToken)}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary-50 px-4 text-sm font-bold text-primary-700 transition hover:bg-primary-100"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4" /> Link copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4" /> Copy invite link
                  </>
                )}
              </button>
              <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-mist-400">
                <QrIcon className="h-3.5 w-3.5" /> Flash the code at briefing — no app needed
              </p>
            </Card>
          )}

          {/* Alerts */}
          <Card>
            <CardHeader
              title="Needs your eye"
              sub={`${alerts.length} open item${alerts.length === 1 ? "" : "s"}`}
            />
            {alerts.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-paper px-4 py-5 text-center text-[13px] text-mist-500">
                All calm. Nothing needs you right now. 🤍
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {alerts.slice(0, 4).map((a, i) => (
                  <li key={i}>
                    <Link
                      href={a.href}
                      className={`flex min-h-[52px] items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-[13px] font-semibold transition ${
                        a.tone === "warning"
                          ? "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300"
                          : "border-primary-100 bg-primary-50 text-navy-900 hover:border-primary-200"
                      }`}
                    >
                      {a.tone === "warning" ? (
                        <AlertIcon className="h-4.5 w-4.5 shrink-0" />
                      ) : (
                        <ClockIcon className="h-4.5 w-4.5 shrink-0" />
                      )}
                      <span className="flex-1">{a.text}</span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Quick actions + collections */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Quick actions" sub="Jump back in" />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
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
                className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-paper text-[13px] font-bold text-navy-900 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <Icon className="h-5 w-5 text-primary-600" />
                {label}
              </Link>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title={`Your collections (${collections.length})`}
            sub="Reusable uniform sets"
            action={<CardLink href="/coordinator/collections">Manage →</CardLink>}
          />
          {collections.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-paper px-4 py-5 text-center text-[13px] text-mist-500">
              No collections yet — bundle approved styles &amp; colours once,
              then reorder in one tap.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {collections.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/coordinator/collections/${c.id}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-bold text-navy-900 transition hover:bg-primary-50 hover:text-primary-700"
                >
                  {c.name}
                  <span className="text-[11px] font-semibold text-mist-400">
                    {c.status === "for-production" ? "✓ For Production" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
