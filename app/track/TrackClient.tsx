"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { IndividualOrder, TeamOrder } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";
import ProductionTracker from "@/components/ProductionTracker";
import { Button, ButtonLink, Field, InlineBanner, StatusBadge, inputCls } from "@/components/ui";
import { BoxIcon, CheckIcon, TruckIcon } from "@/components/icons";

export default function TrackClient({
  initialCode = "",
  initialKey = "",
}: {
  initialCode?: string;
  initialKey?: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [key, setKey] = useState(initialKey);
  const [result, setResult] = useState<
    | { kind: "individual"; order: IndividualOrder }
    | { kind: "team"; order: TeamOrder; mine: boolean }
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(c: string, k: string) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `/api/track?code=${encodeURIComponent(c.trim())}&key=${encodeURIComponent(k.trim())}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode && initialKey) lookup(initialCode, initialKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTeam = result?.kind === "team";
  const order = result?.order;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <BoxIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-navy-900">
          Where are my scrubs?
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-mist-500">
          Enter your order code — plus your checkout email (individual orders)
          or intake phone number (team orders). No account needed.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code, key);
        }}
        className="mx-auto mt-6 grid max-w-xl gap-2.5 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Order code (ZND/ZNT-…)"
          aria-label="Order code"
          className={inputCls}
        />
        <input
          required
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Email or phone number"
          aria-label="Email or phone number"
          className={inputCls}
        />
        <Button type="submit" disabled={loading} className="min-h-[52px]">
          {loading ? "…" : "Track"}
        </Button>
      </form>

      {error && (
        <InlineBanner tone="error" className="mx-auto mt-4 max-w-xl font-semibold">
          {error}{" "}
          <a
            href="https://wa.me/2348012345678?text=Hello%20ZEON!%20I%20can't%20find%20my%20order%20🙏"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Ask us on WhatsApp
          </a>
        </InlineBanner>
      )}

      {result && order && (
        <div className="animate-fade-up mt-6 space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-bold text-navy-900">{order.code}</p>
                <p className="mt-0.5 text-xs text-mist-500">
                  {isTeam
                    ? `${(order as TeamOrder).orgName} · Team order`
                    : `${(order as IndividualOrder).styleName} · ${(order as IndividualOrder).sets} set(s)`}{" "}
                  · ordered {formatDate(order.createdAt)}
                </p>
              </div>
              <StatusBadge
                tone={
                  order.status === "delivered"
                    ? "success"
                    : order.status === "dispatched"
                      ? "info"
                      : "navy"
                }
                icon={
                  order.status === "delivered" ? (
                    <CheckIcon className="h-3.5 w-3.5" />
                  ) : order.status === "dispatched" ? (
                    <TruckIcon className="h-3.5 w-3.5" />
                  ) : undefined
                }
                label={
                  order.status === "delivered"
                    ? "Delivered 🎉"
                    : order.status === "dispatched"
                      ? "Your scrubs are on the way 🚚"
                      : order.status === "in-production" || order.status === "confirmed"
                        ? "Your scrubs are being made ✂️"
                        : order.status.replace(/-/g, " ")
                }
              />
            </div>

            <div className="mt-5">
              <ProductionTracker
                production={order.production}
                variant="simple"
              />
            </div>

            {order.trackingCode && (
              <p className="mt-3 rounded-xl bg-paper px-4 py-3 text-sm">
                <strong>GIG Logistics tracking:</strong>{" "}
                <span className="font-mono font-bold text-primary-700">
                  {order.trackingCode}
                </span>
              </p>
            )}
          </div>

          {!isTeam && (
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                <Image
                  src={(order as IndividualOrder).image}
                  alt={(order as IndividualOrder).styleName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold text-navy-900">
                  {(order as IndividualOrder).styleName} × {(order as IndividualOrder).sets}
                </p>
                <p className="text-mist-500">
                  {(order as IndividualOrder).colour} ·{" "}
                  {(order as IndividualOrder).sizeMode === "preset"
                    ? `Size ${(order as IndividualOrder).size}`
                    : "Custom measurements"}{" "}
                  · {(order as IndividualOrder).fit}
                </p>
                <p className="mt-1 font-black text-navy-900">
                  {formatNaira((order as IndividualOrder).total)}
                </p>
              </div>
            </div>
          )}

          {isTeam && (
            <div className="rounded-2xl border border-line bg-white p-5 text-sm">
              <p className="font-bold text-navy-900">
                {(order as TeamOrder).roster.filter((r) => r.submitted).length} of{" "}
                {(order as TeamOrder).headcount} measurements in
              </p>
              <p className="mt-1 text-mist-500">
                Product IDs issued: {(order as TeamOrder).productIds.length} ·{" "}
                Delivering to {(order as TeamOrder).orgName}
              </p>
            </div>
          )}

          {order.status === "delivered" && (
            <div className="rounded-2xl bg-navy-900 p-5 text-center sm:p-6">
              <p className="font-display text-lg font-black text-white">
                Delivered! How&apos;s the fit? 🤍
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm text-white/65">
                Tell us in 60 seconds — then join a Discovery chat and earn 100
                ZEON Points.
              </p>
              <div className="mt-4 flex flex-col justify-center gap-2.5 sm:flex-row">
                <ButtonLink
                  href={`/feedback/${encodeURIComponent(order.code)}`}
                  variant="gold"
                >
                  Leave feedback
                </ButtonLink>
                <ButtonLink
                  href={`/discovery?mode=embedded&order=${encodeURIComponent(order.code)}`}
                  variant="secondary"
                  className="!border-white/20 !bg-transparent !text-white hover:!bg-white/10"
                >
                  Join Discovery (+100 pts)
                </ButtonLink>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-mist-400">
            Something doesn&apos;t look right?{" "}
            <Link href="/about" className="underline">Talk to us</Link> — a human
            replies in minutes.
          </p>
        </div>
      )}
    </div>
  );
}
