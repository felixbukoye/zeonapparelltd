"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { IndividualOrder, Product } from "@/lib/types";
import { CAREER_STAGES } from "@/lib/sizing";
import { quoteForSets } from "@/lib/pricing";
import {
  DELIVERY_ZONES,
  FREE_DELIVERY_THRESHOLD,
  formatNaira,
} from "@/lib/format";
import { loadSaved, SavedIndicator, useAutosave } from "@/lib/autosave";
import FitAssistant, {
  EMPTY_FIT,
  fitComplete,
  fitSummary,
  type FitValue,
} from "@/components/FitAssistant";
import SwatchPicker from "@/components/SwatchPicker";
import PlacementPicker from "@/components/PlacementPicker";
import {
  Button,
  ButtonLink,
  Field,
  InlineBanner,
  Stepper,
  inputCls,
  inputErrorCls,
} from "@/components/ui";
import { ArrowRightIcon, CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";

const STEPS = ["Style", "Colour & details", "Size", "Embroidery", "Review & pay"];
const DRAFT_KEY = "zeon-individual-draft";
const MAX_SETS = 4;

interface Draft {
  styleId: string;
  sets: number;
  colour: string;
  gender: string;
  careerStage: string;
  name: string;
  email: string;
  phone: string;
  fit: FitValue;
  embroideryText: string;
  embroideryPlacement: string;
  embroideryFont: string;
  embroideryThread: string;
  address: string;
  city: string;
  zone: string;
  paymentMethod: string;
}

const DEFAULTS: Draft = {
  styleId: "",
  sets: 1,
  colour: "",
  gender: "Unisex",
  careerStage: "",
  name: "",
  email: "",
  phone: "",
  fit: EMPTY_FIT,
  embroideryText: "",
  embroideryPlacement: "left-chest",
  embroideryFont: "block",
  embroideryThread: "white",
  address: "",
  city: "",
  zone: DELIVERY_ZONES[0]?.id ?? "lagos",
  paymentMethod: "card",
};

const PAY_METHODS = [
  ["card", "Card", "Pay now with Paystack — instant confirmation."],
  ["transfer", "Bank transfer", "We'll show account details after you order."],
  ["pod", "Pay on delivery", "Pay cash or transfer when GIG arrives."],
] as const;

export default function BuilderClient({
  products,
  initialStyleId,
}: {
  products: Product[];
  initialStyleId?: string;
}) {
  const [draft, setDraft] = useState<Draft>(() => {
    const saved = loadSaved<Draft>(DRAFT_KEY);
    const base = { ...DEFAULTS, ...saved, fit: saved?.fit ?? EMPTY_FIT };
    if (initialStyleId && products.some((p) => p.id === initialStyleId)) {
      base.styleId = initialStyleId;
      const p = products.find((x) => x.id === initialStyleId)!;
      if (!base.colour || !p.colors.includes(base.colour)) base.colour = "";
    }
    return base;
  });
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<IndividualOrder | null>(null);
  const { saved, clear } = useAutosave(DRAFT_KEY, done ? null : draft);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const product = products.find((p) => p.id === draft.styleId);
  const quote = useMemo(
    () => quoteForSets(draft.sets, product?.price ?? 0),
    [draft.sets, product?.price]
  );
  const zone = DELIVERY_ZONES.find((z) => z.id === draft.zone) ?? DELIVERY_ZONES[0];
  const delivery = quote.total >= FREE_DELIVERY_THRESHOLD ? 0 : (zone?.fee ?? 0);

  function stepError(): string {
    if (step === 0 && !product) return "Pick a style to continue.";
    if (step === 1) {
      if (!draft.colour) return "Choose a colour for your set.";
      if (!draft.careerStage) return "Select your career stage.";
      if (!draft.name.trim() || !draft.email.trim() || !draft.phone.trim())
        return "Add your name, email and phone so we can reach you.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email)) return "That email doesn't look right.";
    }
    if (step === 2 && !fitComplete(draft.fit))
      return "Finish sizing — pick a preset size or complete your measurements.";
    if (step === 4) {
      if (!draft.address.trim() || !draft.city.trim())
        return "Add your delivery address and city.";
    }
    return "";
  }

  function next() {
    const err = stepError();
    setTried(true);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setTried(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function place() {
    const err = stepError();
    if (err) {
      setError(err);
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const res = await fetch("/api/individual-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleId: draft.styleId,
          colour: draft.colour,
          gender: draft.gender,
          careerStage: draft.careerStage,
          sizeMode: draft.fit.sizeMode,
          size: draft.fit.size,
          fit: draft.fit.fit,
          measurements: draft.fit.measurements,
          helper: draft.fit.helper,
          sets: draft.sets,
          embroideryText: draft.embroideryText,
          embroideryPlacement: draft.embroideryPlacement,
          embroideryFont: draft.embroideryFont,
          embroideryThread: draft.embroideryThread,
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          address: draft.address,
          city: draft.city,
          zone: draft.zone,
          paymentMethod: draft.paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place your order.");
      clear();
      setDone(data.order);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
    } finally {
      setPlacing(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center sm:py-14">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-white">
          <CheckIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">
          Order confirmed 🎉
        </h1>
        <p className="mt-2 text-sm text-mist-500">
          {done.name.split(" ")[0]}, your {done.sets} set{done.sets === 1 ? "" : "s"} of{" "}
          {done.styleName} {done.sets === 1 ? "is" : "are"} entering the workroom
          queue. We&apos;ll email your receipt to {done.email}.
        </p>
        <div className="mt-5 rounded-2xl border border-line bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist-400">
            Your order code
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-primary-700">{done.code}</p>
          <p className="mt-1 text-xs text-mist-500">
            Paid {formatNaira(done.total)} · track anytime with this code + your email
          </p>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <ButtonLink href={`/track/${done.code}?key=${encodeURIComponent(done.email)}`}>
            Track my order <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/catalogue" variant="secondary">
            Keep browsing
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-mist-400">
          Your size is saved — next order skips measuring.{" "}
          <Link href="/discovery" className="font-bold text-primary-600 underline">
            Tell us about your workwear life (+100 PTS) →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
            Kamscomfort · made for one
          </p>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">
            Build your order
          </h1>
        </div>
        <SavedIndicator show={saved} />
      </div>

      <Stepper steps={STEPS} current={step} className="mt-5" />

      {error && tried && (
        <InlineBanner tone="error" className="mt-4 font-semibold">{error}</InlineBanner>
      )}

      <div className="mt-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
        {step === 0 && (
          <div>
            <Field label="Choose your style">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setDraft((d) => ({
                        ...d,
                        styleId: p.id,
                        colour: p.colors.includes(d.colour) ? d.colour : "",
                      }));
                      setError("");
                    }}
                    aria-pressed={draft.styleId === p.id}
                    className={`overflow-hidden rounded-xl border-2 text-left transition ${
                      draft.styleId === p.id
                        ? "border-primary-600 shadow-md"
                        : "border-line hover:border-mist-300"
                    }`}
                  >
                    <span className="relative block aspect-square bg-paper">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </span>
                    <span className="block p-2.5">
                      <span className="block truncate text-[13px] font-bold text-navy-900">
                        {p.name}
                      </span>
                      <span className="text-[13px] font-black text-primary-700">
                        {formatNaira(p.price)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`How many sets? (max ${MAX_SETS} — more than that? Start a team order)`} className="mt-4">
              <span className="inline-flex items-center gap-3 rounded-xl bg-paper px-3 py-2">
                <button
                  type="button"
                  aria-label="Fewer sets"
                  onClick={() => set("sets", Math.max(1, draft.sets - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-navy-900 shadow-sm"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-display text-lg font-black">{draft.sets}</span>
                <button
                  type="button"
                  aria-label="More sets"
                  onClick={() => set("sets", Math.min(MAX_SETS, draft.sets + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-navy-900 shadow-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </span>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Colour" error={tried && !draft.colour ? "Pick a colour." : undefined}>
              {product ? (
                <SwatchPicker
                  colours={product.colors}
                  value={draft.colour}
                  onChange={(v) => set("colour", v as string)}
                />
              ) : (
                <p className="text-sm text-mist-500">Go back and pick a style first.</p>
              )}
            </Field>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Cut">
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-line p-1">
                  {["Unisex", "Female", "Male"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set("gender", g)}
                      className={`min-h-[44px] rounded-lg text-[13px] font-bold ${draft.gender === g ? "bg-white shadow-sm" : "text-mist-500"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Career stage" error={tried && !draft.careerStage ? "Select one." : undefined}>
                <select
                  value={draft.careerStage}
                  onChange={(e) => set("careerStage", e.target.value)}
                  className={tried && !draft.careerStage ? inputErrorCls : inputCls}
                >
                  <option value="">Select…</option>
                  {CAREER_STAGES.map((c) => (
                    <option key={c.id} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-3">
              <Field label="Full name">
                <input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Dr. Adaeze Obi" className={inputCls} autoComplete="name" />
              </Field>
              <Field label="Email">
                <input value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" inputMode="email" className={inputCls} autoComplete="email" />
              </Field>
              <Field label="Phone">
                <input value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0803…" inputMode="tel" className={inputCls} autoComplete="tel" />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <FitAssistant
              value={draft.fit}
              onChange={(v) => set("fit", v)}
              identityNote={draft.email || undefined}
            />
            {tried && !fitComplete(draft.fit) && (
              <InlineBanner tone="warning" className="mt-3 font-semibold">
                Almost — pick a preset size or finish your measurements.
              </InlineBanner>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field
              label="Embroidery text"
              optional
              hint="e.g. “Dr. Adaeze Obi · Nursing”. Leave blank for no embroidery — plain sets ship faster."
            >
              <input
                value={draft.embroideryText}
                onChange={(e) => set("embroideryText", e.target.value.slice(0, 60))}
                placeholder="Your name · Department"
                className={inputCls}
              />
            </Field>
            {draft.embroideryText.trim() && (
              <div className="animate-fade-up space-y-4">
                <PlacementPicker value={draft.embroideryPlacement} onChange={(v) => set("embroideryPlacement", v)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Font">
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-line p-1">
                      {(["block", "script"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => set("embroideryFont", f)}
                          className={`min-h-[44px] rounded-lg text-sm font-bold capitalize ${draft.embroideryFont === f ? "bg-white shadow-sm" : "text-mist-500"} ${f === "script" ? "italic" : ""}`}
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
                          onClick={() => set("embroideryThread", t)}
                          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg text-sm font-bold capitalize ${draft.embroideryThread === t ? "bg-white shadow-sm" : "text-mist-500"}`}
                        >
                          <span className={`h-4 w-4 rounded-full border ${t === "white" ? "border-mist-300 bg-white" : "bg-navy-900"}`} />
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
                <div className="rounded-xl bg-navy-900 p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
                    Preview · {draft.embroideryPlacement.replace("-", " ")}
                  </p>
                  <p className={`mt-1 text-lg font-bold ${draft.embroideryThread === "white" ? "text-white" : "text-gold-300"} ${draft.embroideryFont === "script" ? "italic" : "tracking-wide"}`}>
                    {draft.embroideryText}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-paper p-4 text-sm">
              <p className="font-bold text-navy-900">
                {product?.name} · {draft.colour} · {draft.sets} set{draft.sets === 1 ? "" : "s"}
              </p>
              <p className="mt-0.5 text-mist-500">
                {draft.careerStage} · {fitSummary(draft.fit)}
                {draft.embroideryText.trim() ? ` · “${draft.embroideryText.trim()}”` : " · No embroidery"}
              </p>
              <dl className="mt-3 space-y-1.5 border-t border-line pt-3">
                <div className="flex justify-between">
                  <dt className="text-mist-500">Subtotal</dt>
                  <dd className="font-bold text-navy-900">{formatNaira(quote.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist-500">Delivery ({zone?.label})</dt>
                  <dd className="font-bold text-navy-900">
                    {delivery === 0 ? "FREE 🎉" : formatNaira(delivery)}
                  </dd>
                </div>
                <div className="flex justify-between text-base">
                  <dt className="font-black text-navy-900">Total</dt>
                  <dd className="font-black text-primary-700">{formatNaira(quote.total + delivery)}</dd>
                </div>
              </dl>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Delivery address">
                <input value={draft.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, area" className={inputCls} autoComplete="street-address" />
              </Field>
              <Field label="City">
                <input value={draft.city} onChange={(e) => set("city", e.target.value)} placeholder="Lagos" className={inputCls} autoComplete="address-level2" />
              </Field>
            </div>
            <Field label="Delivery zone" hint={quote.total >= FREE_DELIVERY_THRESHOLD ? "Your order ships FREE — nice one. 🎉" : `Free delivery over ${formatNaira(FREE_DELIVERY_THRESHOLD)}.`}>
              <div className="grid gap-1.5 sm:grid-cols-3">
                {DELIVERY_ZONES.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => set("zone", z.id)}
                    aria-pressed={draft.zone === z.id}
                    className={`min-h-[52px] rounded-xl border-2 px-3 py-2 text-left transition ${draft.zone === z.id ? "border-primary-600 bg-primary-50" : "border-line"}`}
                  >
                    <span className="block text-[13px] font-bold text-navy-900">{z.label}</span>
                    <span className="text-xs text-mist-500">{formatNaira(z.fee)}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Payment">
              <div className="space-y-1.5">
                {PAY_METHODS.map(([id, label, desc]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => set("paymentMethod", id)}
                    aria-pressed={draft.paymentMethod === id}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${draft.paymentMethod === id ? "border-primary-600 bg-primary-50" : "border-line"}`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${draft.paymentMethod === id ? "border-primary-600" : "border-mist-300"}`}>
                      {draft.paymentMethod === id && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-navy-900">{label}</span>
                      <span className="block text-xs text-mist-500">{desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Field>
            {error && (
              <InlineBanner tone="error" className="font-semibold">{error}</InlineBanner>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-2.5">
          {step > 0 && (
            <Button variant="secondary" onClick={() => { setStep((s) => s - 1); setError(""); setTried(false); }} className="flex-1">
              ← Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="flex-[2]">
              Continue <ArrowRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={place} disabled={placing} className="flex-[2]">
              {placing ? "Placing your order…" : `Pay ${formatNaira(quote.total + delivery)} & order ✓`}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-mist-400">
        Made to order in Lagos · ~3 weeks · free size exchanges ·{" "}
        <Link href="/faq" className="font-bold underline">Questions? Read the FAQs</Link>
      </p>
    </div>
  );
}
