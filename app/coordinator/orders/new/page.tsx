"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Collection } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/sizing";
import { useApp } from "@/context/AppContext";
import { Button, ButtonLink, Field, InlineBanner, inputCls } from "@/components/ui";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState(searchParams.get("collection") ?? "");
  const [orgName, setOrgName] = useState(user?.orgName ?? "");
  const [headcount, setHeadcount] = useState("25");
  const [departments, setDepartments] = useState<string[]>([]);
  const [type, setType] = useState<"team" | "self">("team");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/collections", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const list = (d.collections ?? []) as Collection[];
        setCollections(list);
        if (!collectionId) {
          const prod = list.find((c) => c.status === "for-production");
          if (prod) setCollectionId(prod.id);
        }
      });
    if (user?.orgName) setOrgName(user.orgName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.orgName]);

  async function create() {
    if (!collectionId) {
      setError("Choose a collection — or build one first.");
      return;
    }
    const hc = Number(headcount);
    if (!hc || hc < 1) {
      setError("Tell us how many wearers this order covers.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/team-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId, orgName, headcount: hc, departments, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order.");
      router.push(`/coordinator/orders/${data.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create order.");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-black tracking-tight text-navy-900">
        New team order
      </h1>
      <p className="mt-1 text-sm text-mist-500">
        We&apos;ll quote you in Naira within 24 hours — usually much faster.
      </p>

      <div className="mt-5 space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <Field label="Collection">
          {collections.length === 0 ? (
            <p className="rounded-xl bg-paper p-4 text-sm text-mist-500">
              No collections yet.{" "}
              <Link href="/coordinator/collections/new" className="font-bold text-primary-700 underline">
                Build one first →
              </Link>
            </p>
          ) : (
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className={inputCls}
            >
              <option value="">Select a collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.status === "for-production" ? "✓" : "(draft)"}
                </option>
              ))}
            </select>
          )}
        </Field>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Organisation">
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Headcount" hint="How many wearers?">
            <input
              type="number"
              min={1}
              max={2000}
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="How should we collect sizes?" hint="Team = wearers submit via invite link. Self = you enter everyone yourself.">
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["team", "Team order", "Share one link — wearers submit their own details & measurements."],
                ["self", "Self order", "You already know everyone's sizes — enter the roster directly."],
              ] as const
            ).map(([id, title, desc]) => (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                aria-pressed={type === id}
                className={`min-h-[64px] rounded-xl border-2 p-4 text-left transition ${
                  type === id ? "border-primary-600 bg-primary-50" : "border-line hover:border-mist-300"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-navy-900">
                  {type === id && <CheckIcon className="h-4 w-4 text-primary-600" />}
                  {title}
                </span>
                <span className="mt-0.5 block text-xs text-mist-500">{desc}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Departments covered" optional>
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() =>
                  setDepartments((prev) =>
                    prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                  )
                }
                aria-pressed={departments.includes(d)}
                className={`min-h-[40px] rounded-full px-3.5 text-xs font-bold transition ${
                  departments.includes(d) ? "bg-navy-900 text-white" : "bg-paper text-mist-500"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>

        {error && (
          <InlineBanner tone="error" className="font-semibold">{error}</InlineBanner>
        )}

        <Button onClick={create} disabled={creating} fullWidth className="min-h-[52px]">
          {creating ? "Creating…" : "Create order & get quote"} <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense>
      <NewOrderForm />
    </Suspense>
  );
}
