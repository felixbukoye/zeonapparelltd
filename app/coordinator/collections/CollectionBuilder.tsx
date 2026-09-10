"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Collection, EmbroideryRule, Product } from "@/lib/types";
import { APPROVED_COLOUR_LIBRARY } from "@/lib/sizing";
import { useApp } from "@/context/AppContext";
import SwatchPicker from "@/components/SwatchPicker";
import { Button, Field, InlineBanner, Modal } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

const GENDERS = ["Women", "Men", "Unisex"];
const CATEGORIES = [
  "Scrub Tops",
  "Trousers",
  "Scrub Sets",
  "Tunics",
  "Jackets",
  "Lab Coats",
  "Headwear",
  "Footwear",
  "Accessories",
];
const RULE_MODES: { id: EmbroideryRule["mode"]; label: string }[] = [
  { id: "logo-text", label: "Logo & Text" },
  { id: "logo", label: "Logo only" },
  { id: "text", label: "Text only" },
  { id: "none", label: "No embroidery" },
];

export default function CollectionBuilder({
  existing,
}: {
  existing?: Collection | null;
}) {
  const router = useRouter();
  const { notify } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState(existing?.name ?? "");
  const [mode, setMode] = useState<"full" | "custom">(existing?.mode ?? "custom");
  const [genders, setGenders] = useState<string[]>(existing?.genders ?? [...GENDERS]);
  const [categories, setCategories] = useState<string[]>(existing?.categories ?? ["Scrub Sets"]);
  const [styles, setStyles] = useState<{ productId: string; colours: string[] }[]>(
    existing?.styles ?? []
  );
  const [library, setLibrary] = useState<string[]>(
    existing?.approvedColours ?? [...APPROVED_COLOUR_LIBRARY]
  );
  const [rules, setRules] = useState<EmbroideryRule[]>(existing?.embroideryRules ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmProduction, setConfirmProduction] = useState(false);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []));
  }, []);

  const visibleStyles = useMemo(
    () =>
      mode === "full"
        ? products
        : products.filter((p) => categories.includes(p.category)),
    [products, categories, mode]
  );

  function toggleList(list: string[], v: string): string[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  function toggleStyle(productId: string) {
    setStyles((prev) =>
      prev.some((s) => s.productId === productId)
        ? prev.filter((s) => s.productId !== productId)
        : [...prev, { productId, colours: [] as string[] }]
    );
  }

  function setStyleColours(productId: string, colours: string[]) {
    setStyles((prev) =>
      prev.map((s) => (s.productId === productId ? { ...s, colours } : s))
    );
  }

  function ruleFor(cat: string): EmbroideryRule["mode"] {
    return rules.find((r) => r.category === cat)?.mode ?? "logo-text";
  }

  function setRule(cat: string, ruleMode: EmbroideryRule["mode"]) {
    setRules((prev) => {
      const rest = prev.filter((r) => r.category !== cat);
      return [...rest, { category: cat, mode: ruleMode }];
    });
  }

  async function save(forProduction: boolean) {
    if (!name.trim()) {
      setError("Give your collection a name first.");
      return;
    }
    if (mode === "custom" && styles.length === 0) {
      setError("Pick at least one style — or switch to the full catalogue.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name,
        mode,
        genders,
        categories: mode === "full" ? [...CATEGORIES] : categories,
        styles:
          mode === "full"
            ? products.map((p) => ({ productId: p.id, colours: p.colors }))
            : styles.map((s) => ({
                ...s,
                colours: s.colours.length
                  ? s.colours
                  : (products.find((p) => p.id === s.productId)?.colors ?? []),
              })),
        approvedColours: library,
        embroideryRules:
          mode === "full"
            ? CATEGORIES.map((c) => ({ category: c, mode: ruleFor(c) }))
            : categories.map((c) => ({ category: c, mode: ruleFor(c) })),
        ...(forProduction ? { status: "for-production", note: "Marked as For Production" } : {}),
      };
      const res = await fetch(
        existing ? `/api/collections/${existing.id}` : "/api/collections",
        {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      notify({
        tone: "success",
        title: forProduction ? "Locked for production ✓" : "Collection saved",
        body: forProduction
          ? "Version-stamped. Build a team order from it whenever you're ready."
          : "Your draft is safe — come back anytime.",
      });
      router.push(`/coordinator/collections/${data.collection.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
      setConfirmProduction(false);
    }
  }

  const locked = existing?.status === "for-production";

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Left rail */}
      <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-line bg-white p-5">
          <Field label="Collection name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eko 2026 Nurses"
              className="w-full rounded-xl border border-line px-4 py-3 outline-none placeholder:text-mist-400 focus:border-primary-600"
            />
          </Field>
          <div className="mt-4">
            <p className="mb-1.5 text-sm font-bold text-navy-900">Scope</p>
            <div className="grid gap-1 rounded-xl bg-line p-1">
              {(
                [
                  ["custom", "Create my catalogue"],
                  ["full", "Use full catalogue"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`min-h-[44px] rounded-lg text-[13px] font-bold transition ${
                    mode === id ? "bg-white shadow-sm" : "text-mist-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode === "custom" && (
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-sm font-bold text-navy-900">Categories</p>
            <div className="mt-2.5 space-y-1">
              {CATEGORIES.map((c) => (
                <label
                  key={c}
                  className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl px-2.5 hover:bg-paper"
                >
                  <input
                    type="checkbox"
                    checked={categories.includes(c)}
                    onChange={() => setCategories((prev) => toggleList(prev, c))}
                    className="h-5 w-5 accent-blue-700"
                  />
                  <span className="text-sm font-semibold text-navy-900">{c}</span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-sm font-bold text-navy-900">Cuts</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenders((prev) => toggleList(prev, g))}
                  aria-pressed={genders.includes(g)}
                  className={`min-h-[40px] rounded-full px-3.5 text-xs font-bold transition ${
                    genders.includes(g) ? "bg-navy-900 text-white" : "bg-paper text-mist-500"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="min-w-0 space-y-5">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-base font-black text-navy-900">
            {mode === "full" ? "Full catalogue — everything included" : "Pick your styles"}
          </h2>
          <p className="mt-1 text-[13px] text-mist-500">
            {visibleStyles.length} style(s)
            {mode === "custom" ? " in your selected categories" : ""}. Tap a
            style to include it, then choose its colours.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {visibleStyles.map((p) => {
              const sel = styles.find((s) => s.productId === p.id);
              const on = mode === "full" || !!sel;
              return (
                <div
                  key={p.id}
                  className={`overflow-hidden rounded-2xl border-2 transition ${
                    on ? "border-primary-600" : "border-line"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => mode === "custom" && toggleStyle(p.id)}
                    className="flex w-full items-center gap-3 p-3 text-left"
                    disabled={mode === "full"}
                  >
                    <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-paper">
                      <Image src={p.images[0]} alt={p.name} fill sizes="56px" className="object-cover" loading="lazy" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-navy-900">{p.name}</span>
                      <span className="block text-xs text-mist-500">{p.category}</span>
                    </span>
                    {mode === "custom" && (
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          sel ? "bg-primary-600 text-white" : "bg-line text-mist-400"
                        }`}
                      >
                        {sel && <CheckIcon className="h-4 w-4" />}
                      </span>
                    )}
                  </button>
                  {on && mode === "custom" && sel && (
                    <div className="border-t border-line p-3">
                      <SwatchPicker
                        colours={p.colors}
                        value={sel.colours}
                        multi
                        approvedLibrary={library}
                        orgName="your facility"
                        onChange={(v) => setStyleColours(p.id, v as string[])}
                      />
                      <p className="mt-1.5 text-[11px] text-mist-400">
                        No colours picked = all available colours allowed.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-base font-black text-navy-900">
            Approved colour library
          </h2>
          <p className="mt-1 text-[13px] text-mist-500">
            Your facility&apos;s official colours. Out-of-library picks get
            flagged — never blocked.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {APPROVED_COLOUR_LIBRARY.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setLibrary((prev) => toggleList(prev, c))}
                aria-pressed={library.includes(c)}
                className={`min-h-[44px] rounded-full px-4 text-[13px] font-bold transition ${
                  library.includes(c)
                    ? "bg-primary-600 text-white"
                    : "bg-paper text-mist-500 line-through decoration-mist-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-base font-black text-navy-900">
            Embroidery rules per category
          </h2>
          <div className="mt-3 space-y-2.5">
            {(mode === "full" ? CATEGORIES : categories).map((c) => (
              <div key={c} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-4 py-3">
                <span className="text-sm font-bold text-navy-900">{c}</span>
                <div className="flex flex-wrap gap-1.5">
                  {RULE_MODES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRule(c, r.id)}
                      aria-pressed={ruleFor(c) === r.id}
                      className={`min-h-[40px] rounded-lg px-3 text-xs font-bold transition ${
                        ruleFor(c) === r.id
                          ? "bg-navy-900 text-white"
                          : "bg-white text-mist-500 hover:text-navy-900"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {existing && existing.history.length > 0 && (
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-black text-navy-900">Version history</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-mist-500">
              {[...existing.history].reverse().map((h) => (
                <li key={h.version}>
                  <strong className="text-navy-900">v{h.version}</strong> — {h.note} ·{" "}
                  {new Date(h.at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <InlineBanner tone="error" className="font-semibold">{error}</InlineBanner>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button variant="secondary" onClick={() => save(false)} disabled={saving} fullWidth>
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button onClick={() => setConfirmProduction(true)} disabled={saving || locked} fullWidth>
            {locked ? "✓ Already For Production" : "Mark as For Production"}
          </Button>
        </div>
        {locked && (
          <p className="text-center text-xs text-mist-400">
            This version is locked for production — edits will save as a new draft version.
          </p>
        )}
      </div>

      {confirmProduction && (
        <Modal
          title="Lock this collection for production?"
          body="We'll version-stamp it and you can build team orders from it. You can still create new draft versions afterwards."
          confirmLabel={saving ? "Locking…" : "Yes, lock it"}
          onConfirm={() => save(true)}
          onCancel={() => setConfirmProduction(false)}
        />
      )}
    </div>
  );
}
