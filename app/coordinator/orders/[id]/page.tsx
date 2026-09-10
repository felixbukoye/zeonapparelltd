"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Collection, TeamOrder } from "@/lib/types";
import { TEAM_STATUS } from "@/lib/order-status";
import { formatDateTime, formatNaira, isExpired } from "@/lib/format";
import { APPROVED_COLOUR_LIBRARY, SIZE_CHART } from "@/lib/sizing";
import { useApp } from "@/context/AppContext";
import InviteCard from "@/components/InviteCard";
import LogoDropzone, { type LogoFile } from "@/components/LogoDropzone";
import PlacementPicker from "@/components/PlacementPicker";
import ProductionTracker from "@/components/ProductionTracker";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  WhatsAppIcon,
} from "@/components/icons";
import {
  Button,
  Field,
  InlineBanner,
  Modal,
  StatusBadge,
  WhatsAppButton,
  inputCls,
} from "@/components/ui";

const TABS = ["roster", "embroidery", "payments", "tracker", "checkout"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  roster: "Roster",
  embroidery: "Embroidery",
  payments: "Payments",
  tracker: "Tracker",
  checkout: "Checkout",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { notify } = useApp();
  const [order, setOrder] = useState<TeamOrder | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "roster"
  );
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/team-orders/${id}`, { cache: "no-store" });
    if (!res.ok) {
      setMissing(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrder(data.order);
    const col = await fetch(`/api/collections/${data.order.collectionId}`).then((r) =>
      r.ok ? r.json() : null
    );
    if (col) setCollection(col.collection);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Live roster refresh while collecting (near-real-time counter)
  useEffect(() => {
    if (order?.status !== "awaiting-submissions") return;
    const t = window.setInterval(() => {
      fetch(`/api/team-orders/${id}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setOrder(d.order));
    }, 8000);
    return () => window.clearInterval(t);
  }, [order?.status, id]);

  async function act(action: string, body: Record<string, unknown> = {}) {
    setActing(true);
    setError("");
    try {
      const res = await fetch(`/api/team-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setOrder(data.order);
      return data.order as TeamOrder;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      notify({ tone: "error", title: "Couldn't do that", body: msg });
      return null;
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (missing || !order) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <p className="font-display text-lg font-black text-navy-900">Order not found</p>
        <Link href="/coordinator/orders" className="mt-2 inline-block text-sm font-bold text-primary-700 underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const submitted = order.roster.filter((r) => r.submitted).length;
  const missingCount = Math.max(0, order.headcount - submitted);

  return (
    <div>
      <Link href="/coordinator/orders" className="text-[13px] font-bold text-mist-500 hover:text-navy-900">
        ← All orders
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-navy-900 sm:font-display sm:text-2xl sm:font-black">
            {order.code}
          </h1>
          <p className="mt-1 text-sm text-mist-500">
            {order.orgName} · {order.type === "team" ? "Team order" : "Self order"} ·{" "}
            {order.headcount} wearers · {collection?.name ?? ""}
          </p>
        </div>
        <StatusBadge tone={TEAM_STATUS[order.status].tone} label={TEAM_STATUS[order.status].label} />
      </div>

      {missingCount > 0 &&
        ["awaiting-submissions", "awaiting-approval"].includes(order.status) && (
          <InlineBanner tone="warning" className="mt-4 font-semibold">
            {missingCount} wearer{missingCount === 1 ? " hasn't" : "s haven't"}{" "}
            submitted — production planning needs everyone in.{" "}
            <button onClick={() => setTab("roster")} className="underline">
              Nudge them →
            </button>
          </InlineBanner>
        )}

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setError("");
            }}
            className={`min-h-[48px] whitespace-nowrap px-4 text-sm font-bold transition ${
              tab === t
                ? "border-b-2 border-primary-600 text-primary-700"
                : "text-mist-500 hover:text-navy-900"
            }`}
          >
            {TAB_LABELS[t]}
            {t === "roster" && (
              <span className="ml-1.5 rounded-full bg-paper px-2 py-0.5 text-[11px] text-mist-500">
                {submitted}/{order.headcount}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <InlineBanner tone="error" className="mt-4 font-semibold">{error}</InlineBanner>
      )}

      <div className="mt-5">
        {tab === "roster" && (
          <RosterTab order={order} submitted={submitted} missingCount={missingCount} acting={acting} act={act} reload={load} />
        )}
        {tab === "embroidery" && (
          <EmbroideryTab order={order} collection={collection} acting={acting} act={act} />
        )}
        {tab === "payments" && (
          <PaymentsTab order={order} acting={acting} act={act} />
        )}
        {tab === "tracker" && (
          <TrackerTab order={order} acting={acting} act={act} />
        )}
        {tab === "checkout" && <CheckoutTab order={order} goTab={setTab} />}
      </div>
    </div>
  );
}

/* ---------------------------------- roster --------------------------------- */

function RosterTab({
  order,
  submitted,
  missingCount,
  acting,
  act,
  reload,
}: {
  order: TeamOrder;
  submitted: number;
  missingCount: number;
  acting: boolean;
  act: (a: string, b?: Record<string, unknown>) => Promise<TeamOrder | null>;
  reload: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "submitted" | "pending">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [manual, setManual] = useState({ name: "", department: "", phone: "", size: "M", fit: "fitted" });
  const [nudged, setNudged] = useState(false);
  const { notify } = useApp();

  const rows = order.roster.filter((r) => {
    if (filter === "submitted") return r.submitted;
    if (filter === "pending") return !r.submitted;
    return true;
  });

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/intake/${order.inviteToken}`
      : `/intake/${order.inviteToken}`;

  function nudge() {
    const text = `Hello team! 👋 A quick reminder to submit your measurements for our ${order.orgName} ZEON uniforms — it takes 3 minutes, no account needed:\n${inviteLink}\n\nThank you! 🤍`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setNudged(true);
    notify({ tone: "success", title: "Reminder ready to send", body: "Forward it to your team group on WhatsApp." });
    window.setTimeout(() => setNudged(false), 3000);
  }

  async function addManual() {
    if (!manual.name.trim()) {
      notify({ tone: "error", title: "Add a name first" });
      return;
    }
    const res = await act("add-roster", { entries: [manual] });
    if (res) {
      setManual({ name: "", department: "", phone: "", size: "M", fit: "fitted" });
      setShowAdd(false);
      notify({ tone: "success", title: `${manual.name.split(" ")[0]} added to the roster` });
    }
  }

  return (
    <div className="space-y-4">
      {order.type === "team" && (
        <InviteCard
          token={order.inviteToken}
          submitted={submitted}
          headcount={order.headcount}
          expiry={order.inviteExpiry}
          orgName={order.orgName}
        />
      )}

      {isExpired(order.inviteExpiry) && order.type === "team" && missingCount > 0 && (
        <InlineBanner tone="error" className="flex flex-wrap items-center justify-between gap-2 font-semibold">
          <span>This invite link has expired — wearers can&apos;t submit until you refresh it.</span>
          <Button
            onClick={() => act("refresh-invite")}
            disabled={acting}
            className="min-h-[44px] px-4 py-2 text-[13px]"
          >
            Refresh link (14 days)
          </Button>
        </InlineBanner>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex gap-1.5">
          {(["all", "submitted", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`min-h-[40px] rounded-full px-4 text-[13px] font-bold capitalize transition ${
                filter === f ? "bg-navy-900 text-white" : "bg-paper text-mist-500 hover:text-navy-900"
              }`}
            >
              {f === "all" ? `All (${order.roster.length})` : f === "submitted" ? `Submitted (${submitted})` : `Pending (${missingCount})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowAdd((v) => !v)}
            className="min-h-[44px] px-4 py-2 text-[13px]"
          >
            <PlusIcon className="h-4 w-4" /> Add manually
          </Button>
          {order.type === "team" && missingCount > 0 && (
            <button
              onClick={nudge}
              className={`flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold text-white transition ${
                nudged ? "bg-success" : "bg-whatsapp hover:brightness-95"
              }`}
            >
              {nudged ? (
                <><CheckIcon className="h-4 w-4" /> Sent!</>
              ) : (
                <><WhatsAppIcon className="h-4 w-4" /> Nudge non-submitters</>
              )}
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="animate-fade-up grid gap-2.5 rounded-2xl border border-primary-200 bg-primary-50/50 p-4 sm:grid-cols-[1fr_1fr_1fr_110px_120px_auto]">
          <input
            value={manual.name}
            onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
            placeholder="Full name *"
            aria-label="Wearer's name"
            className="min-h-[48px] rounded-xl border border-line bg-white px-3.5 outline-none focus:border-primary-600"
          />
          <input
            value={manual.department}
            onChange={(e) => setManual((m) => ({ ...m, department: e.target.value }))}
            placeholder="Department"
            aria-label="Department"
            className="min-h-[48px] rounded-xl border border-line bg-white px-3.5 outline-none focus:border-primary-600"
          />
          <input
            value={manual.phone}
            onChange={(e) => setManual((m) => ({ ...m, phone: e.target.value }))}
            placeholder="Phone (for tracking)"
            aria-label="Phone number for order tracking"
            inputMode="tel"
            className="min-h-[48px] rounded-xl border border-line bg-white px-3.5 outline-none focus:border-primary-600"
          />
          <select
            value={manual.size}
            onChange={(e) => setManual((m) => ({ ...m, size: e.target.value }))}
            aria-label="Size"
            className="min-h-[48px] rounded-xl border border-line bg-white px-3.5 outline-none focus:border-primary-600"
          >
            {SIZE_CHART.map((r) => (
              <option key={r.size}>{r.size}</option>
            ))}
          </select>
          <select
            value={manual.fit}
            onChange={(e) => setManual((m) => ({ ...m, fit: e.target.value }))}
            aria-label="Fit"
            className="min-h-[48px] rounded-xl border border-line bg-white px-3.5 outline-none focus:border-primary-600"
          >
            <option value="fitted">Fitted</option>
            <option value="relaxed">Relaxed</option>
          </select>
          <Button onClick={addManual} disabled={acting} className="min-h-[48px] px-5">
            Add
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.14em] text-mist-400">
              <th className="px-4 py-3">Wearer</th>
              <th className="px-4 py-3">Size / Fit</th>
              <th className="px-4 py-3">Embroidery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-mist-500">
                  {filter === "all"
                    ? "Nobody here yet — share your invite link or add wearers manually."
                    : `Nobody ${filter} right now.`}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-paper last:border-0">
                <td className="px-4 py-3">
                  <p className="font-bold text-navy-900">{r.name}</p>
                  <p className="text-xs text-mist-500">
                    {[r.department, r.careerStage, r.phone].filter(Boolean).join(" · ") || "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-navy-800">
                  {r.sizeMode === "manual"
                    ? "Custom ✓"
                    : r.size
                      ? `${r.size} · ${r.fit ?? "fitted"}`
                      : "—"}
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-mist-500">
                  {r.embroideryText || "—"}
                </td>
                <td className="px-4 py-3">
                  {r.submitted ? (
                    <StatusBadge tone="success" icon={<CheckIcon className="h-3.5 w-3.5" />} label={r.source === "manual" ? "Manual ✓" : "Submitted ✓"} />
                  ) : (
                    <StatusBadge tone="neutral" label="Pending" />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => act("remove-roster", { entryId: r.id })}
                    aria-label={`Remove ${r.name}`}
                    className="rounded-lg p-2.5 text-mist-400 hover:bg-red-50 hover:text-error"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-mist-400">
        Roster refreshes automatically as wearers submit — no need to reload.{" "}
        <button onClick={reload} className="font-bold underline">Refresh now</button>
      </p>
    </div>
  );
}

/* -------------------------------- embroidery -------------------------------- */

function EmbroideryTab({
  order,
  collection,
  acting,
  act,
}: {
  order: TeamOrder;
  collection: Collection | null;
  acting: boolean;
  act: (a: string, b?: Record<string, unknown>) => Promise<TeamOrder | null>;
}) {
  const [placement, setPlacement] = useState(order.embroidery.placement);
  const [font, setFont] = useState<"block" | "script">(order.embroidery.font);
  const [thread, setThread] = useState<"white" | "black">(order.embroidery.thread);
  const [logo, setLogo] = useState<LogoFile | null>(
    order.embroidery.logoName ? { name: order.embroidery.logoName } : null
  );
  const [confirmApprove, setConfirmApprove] = useState(false);
  const { notify } = useApp();

  const locked = !["draft", "quote", "awaiting-deposit", "awaiting-submissions", "awaiting-approval"].includes(order.status);

  async function saveEmbroidery() {
    const res = await act("save-embroidery", {
      embroidery: { placement, font, thread, logoName: logo?.name },
    });
    if (res) notify({ tone: "success", title: "Embroidery spec saved" });
  }

  async function approve() {
    const res = await act("approve-mockup");
    if (res) {
      setConfirmApprove(false);
      notify({ tone: "success", title: "Mockup approved — production starts! ✂️" });
    }
  }

  const sample = order.roster.find((r) => r.submitted);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="font-display text-base font-black text-navy-900">
            Placement &amp; style
          </h3>
          <div className="mt-3">
            <PlacementPicker value={placement} onChange={setPlacement} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Font">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-line p-1">
                {(["block", "script"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFont(f)}
                    className={`min-h-[44px] rounded-lg text-sm font-bold capitalize ${font === f ? "bg-white shadow-sm" : "text-mist-500"} ${f === "script" ? "italic" : ""}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Thread">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-line p-1">
                {(["white", "black"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThread(t)}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg text-sm font-bold capitalize ${thread === t ? "bg-white shadow-sm" : "text-mist-500"}`}
                  >
                    <span className={`h-4 w-4 rounded-full border ${t === "white" ? "border-mist-300 bg-white" : "bg-navy-900"}`} />
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-display text-base font-black text-navy-900">Logo</h3>
            <p className="mt-1 text-xs text-mist-500">
              Rules: {(collection?.embroideryRules ?? []).map((r) => r.mode).filter((v, i, a) => a.indexOf(v) === i).join(", ") || "Logo & Text"}.
              Names auto-pull from the roster — never retyped.
            </p>
            <div className="mt-3">
              <LogoDropzone value={logo} onChange={setLogo} digitization={order.embroidery.digitization} />
            </div>
            {order.embroidery.digitization === "pending" && (
              <Button
                variant="secondary"
                onClick={() => act("mark-digitized")}
                disabled={acting}
                className="mt-3 min-h-[44px] px-4 text-[13px]"
              >
                Mark digitization complete (demo)
              </Button>
            )}
          </div>

          <div className="rounded-2xl bg-navy-900 p-5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
              Mockup preview · {placement.replace("-", " ")}
            </p>
            {logo && (
              <p className="mt-2 inline-block rounded-lg bg-white/10 px-3 py-1.5 font-mono text-xs text-white/80">
                🖼️ {logo.name}
              </p>
            )}
            <p className={`mt-2 text-xl font-bold ${thread === "white" ? "text-white" : "text-gold-300"} ${font === "script" ? "italic" : "tracking-wide"}`}>
              {sample ? sample.name : "Dr. Sample Name"}
            </p>
            <p className={`text-sm ${thread === "white" ? "text-white/70" : "text-gold-300/70"}`}>
              {sample?.department || "Department"}
            </p>
            <div className="mt-3">
              {order.embroidery.mockupApproved ? (
                <StatusBadge tone="success" icon={<CheckIcon className="h-3.5 w-3.5" />} label="Mockup approved" />
              ) : (
                <StatusBadge tone="warning" icon={<ClockIcon className="h-3.5 w-3.5" />} label="Awaiting your approval" />
              )}
            </div>
          </div>
        </div>
      </div>

      <InlineBanner tone="info">
        <strong>No production starts without an approved mockup.</strong>{" "}
        Approval unlocks once every wearer has submitted
        {order.embroidery.logoName ? " and your logo is digitized" : ""}.
      </InlineBanner>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button variant="secondary" onClick={saveEmbroidery} disabled={acting || locked} fullWidth>
          Save embroidery spec
        </Button>
        <Button onClick={() => setConfirmApprove(true)} disabled={acting || locked || order.embroidery.mockupApproved} fullWidth>
          {order.embroidery.mockupApproved ? "✓ Mockup approved" : "Approve final mockup"}
        </Button>
      </div>

      {confirmApprove && (
        <Modal
          title="Approve this mockup?"
          body="This locks embroidery for all wearers and starts production. Double-check placement, spelling rules and your logo proof."
          confirmLabel={acting ? "Approving…" : "Yes, start production"}
          onConfirm={approve}
          onCancel={() => setConfirmApprove(false)}
        />
      )}
    </div>
  );
}

/* --------------------------------- payments -------------------------------- */

function PaymentsTab({
  order,
  acting,
  act,
}: {
  order: TeamOrder;
  acting: boolean;
  act: (a: string, b?: Record<string, unknown>) => Promise<TeamOrder | null>;
}) {
  const [confirmPay, setConfirmPay] = useState<"deposit" | "balance" | null>(null);
  const q = order.quote;

  async function pay(which: "deposit" | "balance") {
    const res = await act(which === "deposit" ? "pay-deposit" : "pay-balance");
    if (res) setConfirmPay(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h3 className="font-display text-base font-black text-navy-900">Quote</h3>
        {q.status === "pending" ? (
          <div className="mt-3">
            <p className="text-sm text-mist-500">
              Estimated {formatNaira(q.perSet)} per set × {q.sets} sets. Issue
              your formal Naira quote — valid with tiered team pricing applied.
            </p>
            <Button onClick={() => act("issue-quote")} disabled={acting} className="mt-3">
              {acting ? "Issuing…" : "Issue my quote"}
            </Button>
          </div>
        ) : (
          <>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist-500">Collection average</dt>
                <dd className="font-bold">{formatNaira(q.perSet)} / set</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-500">Sets ({q.sets} wearers)</dt>
                <dd className="font-bold">{formatNaira(q.subtotal)}</dd>
              </div>
              {q.discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Team discount</dt>
                  <dd className="font-bold">−{formatNaira(q.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 text-base">
                <dt className="font-black">Total</dt>
                <dd className="font-black text-primary-700">{formatNaira(q.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist-500">
                  {q.balance > 0 ? "Deposit due now (30%)" : "Due now (pay in full)"}
                </dt>
                <dd className="font-bold">{formatNaira(q.depositDue)}</dd>
              </div>
              {q.balance > 0 && (
                <div className="flex justify-between">
                  <dt className="text-mist-500">Balance (before dispatch)</dt>
                  <dd className="font-bold">{formatNaira(q.balance)}</dd>
                </div>
              )}
            </dl>
            {q.status === "ready" && (
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <Button onClick={() => act("accept-quote")} disabled={acting}>
                  Accept quote
                </Button>
                <WhatsAppButton
                  message={`Hello ZEON! I'd like to discuss quote for ${order.code} (${formatNaira(q.total)}) before confirming 🙏`}
                  label="Talk to Sales first"
                  variant="secondary"
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-black text-navy-900">Deposit</h3>
            {order.depositPaid ? (
              <StatusBadge tone="success" icon={<CheckIcon className="h-3.5 w-3.5" />} label="Paid" />
            ) : (
              <StatusBadge tone="warning" icon={<AlertIcon className="h-3.5 w-3.5" />} label="Unpaid" />
            )}
          </div>
          <p className="mt-2 font-display text-2xl font-black">{formatNaira(q.depositDue)}</p>
          <p className="mt-1 text-xs text-mist-500">
            {order.depositPaid
              ? `Paid ${order.depositAt ? formatDateTime(order.depositAt) : ""} — production unlocked, Product IDs issued.`
              : "Paying the deposit confirms your order and issues Product IDs."}
          </p>
          {!order.depositPaid && q.status === "accepted" && (
            <Button onClick={() => setConfirmPay("deposit")} disabled={acting} fullWidth className="mt-3">
              Pay deposit (demo)
            </Button>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-black text-navy-900">Balance</h3>
            {order.balancePaid || q.balance === 0 ? (
              <StatusBadge tone="success" icon={<CheckIcon className="h-3.5 w-3.5" />} label={q.balance === 0 ? "No balance" : "Paid"} />
            ) : (
              <StatusBadge tone="neutral" icon={<ClockIcon className="h-3.5 w-3.5" />} label="Due before dispatch" />
            )}
          </div>
          <p className="mt-2 font-display text-2xl font-black">{formatNaira(q.balance)}</p>
          <p className="mt-1 text-xs text-mist-500">
            {order.balancePaid
              ? `Paid ${order.balanceAt ? formatDateTime(order.balanceAt) : ""}.`
              : "Dispatch is gated on this — your sets won't ship until it's cleared."}
          </p>
          {q.balance > 0 && !order.balancePaid && order.depositPaid && (
            <Button onClick={() => setConfirmPay("balance")} disabled={acting} fullWidth className="mt-3">
              Pay balance (demo)
            </Button>
          )}
        </div>
      </div>

      {order.productIds.length > 0 && (
        <p className="rounded-2xl bg-paper px-4 py-3 text-[13px] text-mist-500">
          <strong className="text-navy-900">{order.productIds.length} Product IDs issued</strong>{" "}
          — e.g. <span className="font-mono">{order.productIds[0]}</span>. Wearers
          track with these + their phone numbers.
        </p>
      )}

      {confirmPay && (
        <Modal
          title={confirmPay === "deposit" ? `Pay ${formatNaira(q.depositDue)} deposit?` : `Pay ${formatNaira(q.balance)} balance?`}
          body={
            confirmPay === "deposit"
              ? "Demo payment — no real charge. This confirms your order and unlocks the invite flow + Product IDs."
              : "Demo payment — no real charge. This unlocks dispatch once packaging is done."
          }
          confirmLabel={acting ? "Paying…" : "Yes, pay now"}
          onConfirm={() => pay(confirmPay)}
          onCancel={() => setConfirmPay(null)}
        />
      )}
    </div>
  );
}

/* --------------------------------- tracker --------------------------------- */

function TrackerTab({
  order,
  acting,
  act,
}: {
  order: TeamOrder;
  acting: boolean;
  act: (a: string, b?: Record<string, unknown>) => Promise<TeamOrder | null>;
}) {
  const { notify } = useApp();
  const atPackaging = order.production.stage === 6;
  const balanceBlocking = atPackaging && order.quote.balance > 0 && !order.balancePaid;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h3 className="font-display text-base font-black text-navy-900">
          Production tracker
        </h3>
        <p className="mt-1 text-xs text-mist-500">
          Same 8 stages your wearers see — tap any stage for its timestamp.
        </p>
        <div className="mt-4">
          <ProductionTracker production={order.production} variant="full" />
        </div>
        {order.trackingCode && (
          <p className="mt-3 rounded-xl bg-paper px-4 py-3 text-sm">
            <strong>GIG Logistics tracking:</strong>{" "}
            <span className="font-mono font-bold text-primary-700">{order.trackingCode}</span>
          </p>
        )}
      </div>

      {["in-production", "awaiting-balance"].includes(order.status) && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="font-display text-base font-black text-navy-900">
            Move production along <span className="text-xs font-semibold text-mist-400">(demo controls)</span>
          </h3>
          {balanceBlocking && (
            <InlineBanner tone="warning" className="mt-3 font-semibold">
              Balance of {formatNaira(order.quote.balance)} must be paid before
              we can dispatch —{" "}
              <button
                onClick={() => act("pay-balance")}
                className="underline"
                disabled={acting}
              >
                pay it now
              </button>
              .
            </InlineBanner>
          )}
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <Button
              onClick={async () => {
                const res = await act("advance-stage");
                if (res)
                  notify({
                    tone: "success",
                    title: res.status === "dispatched" ? "Dispatched! 🚚" : "Stage advanced ✓",
                  });
              }}
              disabled={acting}
            >
              {atPackaging ? "Dispatch order 🚚" : "Advance to next stage →"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => act("advance-stage", { slipWeeks: 1 })}
              disabled={acting}
            >
              Advance with 1-week slip (demo)
            </Button>
          </div>
        </div>
      )}

      {order.status === "dispatched" && (
        <Button onClick={() => act("mark-delivered")} disabled={acting} fullWidth>
          Mark as delivered
        </Button>
      )}
      {order.status === "delivered" && (
        <Button onClick={() => act("complete")} disabled={acting} fullWidth>
          Close out this order ✓
        </Button>
      )}
    </div>
  );
}

/* --------------------------------- checkout -------------------------------- */

function CheckoutTab({ order, goTab }: { order: TeamOrder; goTab: (t: Tab) => void }) {
  const steps: { label: string; done: boolean; tab: Tab }[] = [
    { label: "Quote accepted", done: order.quote.status === "accepted", tab: "payments" },
    { label: `Deposit paid (${formatNaira(order.quote.depositDue)})`, done: order.depositPaid, tab: "payments" },
    {
      label: `All ${order.headcount} wearers submitted`,
      done: order.roster.filter((r) => r.submitted).length >= order.headcount,
      tab: "roster",
    },
    { label: "Mockup approved", done: order.embroidery.mockupApproved, tab: "embroidery" },
    {
      label: order.quote.balance > 0 ? `Balance paid (${formatNaira(order.quote.balance)})` : "No balance due",
      done: order.balancePaid || order.quote.balance === 0,
      tab: "payments",
    },
    {
      label: "Dispatched",
      done: ["dispatched", "delivered", "complete"].includes(order.status),
      tab: "tracker",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h3 className="font-display text-base font-black text-navy-900">
          Your road to dispatch
        </h3>
        <ol className="mt-4 space-y-2.5">
          {steps.map((s) => (
            <li key={s.label}>
              <button
                onClick={() => goTab(s.tab)}
                className="flex w-full items-center gap-3 rounded-xl bg-paper px-4 py-3 text-left transition hover:bg-line"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    s.done ? "bg-success text-white" : "bg-white text-mist-400 ring-1 ring-line"
                  }`}
                >
                  {s.done && <CheckIcon className="h-4 w-4" />}
                </span>
                <span className={`text-sm font-bold ${s.done ? "text-navy-900" : "text-mist-500"}`}>
                  {s.label}
                </span>
                {!s.done && <span className="ml-auto text-xs font-bold text-primary-700">Do this →</span>}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <WhatsAppButton
        message={`Hello ZEON! I need help with team order ${order.code} 🙏`}
        label="Stuck? Talk to Sales"
      />
    </div>
  );
}
