"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CareerStage } from "@/lib/types";
import {
  AGE_BANDS,
  CAREER_STAGES,
  CONHESS_LEVELS,
  DEPARTMENTS,
  NIGERIAN_STATES,
} from "@/lib/sizing";
import { timeLeft } from "@/lib/format";
import { loadSaved, useAutosave, SavedIndicator } from "@/lib/autosave";
import FitAssistant, {
  EMPTY_FIT,
  fitComplete,
  fitSummary,
  type FitValue,
} from "@/components/FitAssistant";
import {
  Button,
  ButtonLink,
  Field,
  InlineBanner,
  Stepper,
  WhatsAppButton,
  inputCls,
} from "@/components/ui";
import { AlertIcon, ArrowRightIcon, CheckIcon, ClockIcon } from "@/components/icons";

const STEPS = ["Your details", "Your size", "Embroidery preview", "Confirm"];

interface InviteInfo {
  orgName: string;
  orderCode: string;
  headcount: number;
  submitted: number;
  expiresAt: string;
  collectionName: string;
  styles: { productId: string; name: string; image: string; colours: string[] }[];
  embroidery: { textEnabled: boolean; placement: string; font: string; thread: string };
}

interface Draft {
  name: string;
  department: string;
  ageBand: string;
  gender: string;
  careerStage: CareerStage | "";
  conhess: string;
  state: string;
  phone: string;
  fit: FitValue;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  department: "",
  ageBand: "",
  gender: "",
  careerStage: "",
  conhess: "",
  state: "",
  phone: "",
  fit: EMPTY_FIT,
};

export default function IntakeClient({ token }: { token: string }) {
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState("");
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY_DRAFT,
    ...(loadSaved<Draft>(`zeon_intake_${token}`) ?? {}),
    fit: { ...EMPTY_FIT, ...(loadSaved<Draft>(`zeon_intake_${token}`)?.fit ?? {}) },
  }));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ duplicate: boolean; message: string } | null>(null);
  const { saved, clear } = useAutosave(`zeon_intake_${token}`, draft);

  useEffect(() => {
    fetch(`/api/intake/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          if (data.error === "expired") setExpired(data.message);
          else setExpired("We couldn't find that invite link — it may have been mistyped.");
          return null;
        }
        return data as InviteInfo;
      })
      .then((d) => d && setInfo(d))
      .finally(() => setLoading(false));
  }, [token]);

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
    setError("");
  }

  function begin() {
    setStarted(true);
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "intake_flow_started", props: { orderCode: info?.orderCode ?? "" } }),
    }).catch(() => undefined);
    window.scrollTo({ top: 0 });
  }

  function validate(s: number): boolean {
    if (s === 0) {
      if (!draft.name.trim()) {
        setError("Tell us your name so we can label your package.");
        return false;
      }
      if (!draft.careerStage) {
        setError("Select your career stage.");
        return false;
      }
    }
    if (s === 1 && !fitComplete(draft.fit)) {
      setError(
        draft.fit.sizeMode === "preset"
          ? "Pick your size — or switch to manual measurements."
          : "Fill in every measurement so we can cut your perfect fit."
      );
      return false;
    }
    return true;
  }

  function next() {
    if (!validate(step)) return;
    setError("");
    // skip embroidery step if disabled for this collection
    let n = step + 1;
    if (n === 2 && !info?.embroidery.textEnabled) n = 3;
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    let n = step - 1;
    if (n === 2 && !info?.embroidery.textEnabled) n = 1;
    setStep(n);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!validate(0) || !validate(1)) {
      setError("A couple of details are missing — let's fix them before you submit.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/intake/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          embroideryText: `${draft.name.trim()}${draft.department ? ` · ${draft.department}` : ""}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "expired") {
          setExpired(data.message);
          return;
        }
        throw new Error(data.error || "Could not submit.");
      }
      clear();
      setResult({ duplicate: data.duplicate, message: data.message });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* --------------------------------- loading -------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-10">
        <div className="skeleton h-8 w-2/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    );
  }

  /* --------------------------------- expired -------------------------------- */
  if (expired || !info) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ClockIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-black text-navy-900">
          This link has expired
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-500">
          {expired || "This invite link isn't valid anymore."} Ask your
          coordinator for a fresh link — it only takes them a tap to send.
        </p>
        <div className="mt-6">
          <WhatsAppButton
            message="Hello! My ZEON uniform invite link has expired — please send me a new one 🙏"
            label="Message your coordinator"
          />
        </div>
      </div>
    );
  }

  /* ---------------------------------- done ---------------------------------- */
  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
          <span className="animate-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-black text-navy-900">
            You&apos;re in, {draft.name.split(" ")[0] || "star"}! 🎉
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mist-500">
            {result.message}
          </p>
          {result.duplicate && (
            <InlineBanner tone="warning" className="mx-auto mt-4 max-w-sm text-left">
              Looks like this name is already on the list — is this you, or
              someone else? We&apos;ve saved everything either way; nothing is
              lost.
            </InlineBanner>
          )}
          <div className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm">
            {[
              "Your coordinator sees your submission instantly",
              "Once everyone is in, they approve the final mockup",
              "Then we sew — and you can track every stage with your phone number",
            ].map((t, i) => (
              <p key={t} className="flex items-start gap-2.5 rounded-xl bg-paper px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {t}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <ButtonLink href={`/track/${info.orderCode}`}>
              Track the team order
            </ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back home
            </ButtonLink>
          </div>
          <p className="mt-5 text-xs text-mist-400">
            After delivery we&apos;ll invite you to a short Discovery chat —
            worth 100 ZEON Points.
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------- landing -------------------------------- */
  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="bg-navy-900 px-6 py-8 text-center sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
              You&apos;re invited 🎉
            </p>
            <h1 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">
              {info.orgName} is getting ZEON uniforms
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
              {info.collectionName} · {info.submitted} of {info.headcount} already
              in · link expires in {timeLeft(info.expiresAt)}
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-navy-900">What you&apos;ll do (about 3 minutes, no account):</p>
            <ol className="mt-3 space-y-2 text-sm text-mist-500">
              {[
                "Tell us a bit about you — name, department, career stage",
                "Pick your size or send measurements with our Fit Assistant",
                "Preview your embroidered name",
                "Confirm — and track everything with your phone number",
              ].map((t, i) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>

            {info.styles.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-bold text-navy-900">Your team&apos;s styles:</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {info.styles.slice(0, 6).map((s) => (
                    <div key={s.productId} className="overflow-hidden rounded-xl border border-line">
                      <span className="relative block aspect-square bg-paper">
                        <Image src={s.image} alt={s.name} fill sizes="180px" className="object-cover" loading="lazy" />
                      </span>
                      <span className="block p-2">
                        <span className="block truncate text-xs font-bold text-navy-900">{s.name}</span>
                        <span className="block truncate text-[11px] text-mist-500">{s.colours.join(" · ")}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={begin} fullWidth className="mt-6 min-h-[52px]">
              Start — it takes 3 minutes <ArrowRightIcon className="h-4 w-4" />
            </Button>
            <p className="mt-3 text-center text-xs text-mist-400">
              Your progress saves automatically, even if your network drops.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------- steps --------------------------------- */
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
            {info.orgName} · {info.orderCode}
          </p>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-900">
            {step === 0 && "Tell us a bit about you"}
            {step === 1 && "Let's get your fit right"}
            {step === 2 && "Your embroidery preview"}
            {step === 3 && "Confirm your submission"}
          </h1>
        </div>
        <SavedIndicator show={saved} />
      </div>

      <Stepper steps={STEPS} current={step} className="mt-4" />

      <div className="mt-5 rounded-2xl border border-line bg-white p-5 sm:p-7">
        {step === 0 && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full name" hint="As you'd like it on your package — and embroidery.">
                <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} placeholder="e.g. Funke Adeyemi" className={inputCls} />
              </Field>
            </div>
            <Field label="Department" optional>
              <select value={draft.department} onChange={(e) => patch({ department: e.target.value })} className={inputCls}>
                <option value="">Select…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone" hint="You'll track the order with this number.">
              <input value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="0801 234 5678" className={inputCls} />
            </Field>
            <Field label="Career stage">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {CAREER_STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => patch({ careerStage: s.id as CareerStage })}
                    aria-pressed={draft.careerStage === s.id}
                    className={`min-h-[48px] rounded-xl border-2 px-2 text-[13px] font-bold transition ${
                      draft.careerStage === s.id
                        ? "border-primary-600 bg-primary-50 text-primary-800"
                        : "border-line text-navy-800 hover:border-mist-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Gender" optional>
              <div className="grid grid-cols-3 gap-1.5">
                {["Female", "Male", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => patch({ gender: g })}
                    aria-pressed={draft.gender === g}
                    className={`min-h-[48px] rounded-xl border-2 text-[13px] font-bold transition ${
                      draft.gender === g
                        ? "border-primary-600 bg-primary-50 text-primary-800"
                        : "border-line text-navy-800 hover:border-mist-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Age band" optional>
              <select value={draft.ageBand} onChange={(e) => patch({ ageBand: e.target.value })} className={inputCls}>
                <option value="">Select…</option>
                {AGE_BANDS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="CONHESS level" optional>
              <select value={draft.conhess} onChange={(e) => patch({ conhess: e.target.value })} className={inputCls}>
                <option value="">Select…</option>
                {CONHESS_LEVELS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="State" optional>
                <select value={draft.state} onChange={(e) => patch({ state: e.target.value })} className={inputCls}>
                  <option value="">Select…</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <FitAssistant
            value={draft.fit}
            onChange={(fit) => patch({ fit })}
            identityNote="We save this as your Size Profile under your phone number — no re-measuring next time."
          />
        )}

        {step === 2 && info.embroidery.textEnabled && (
          <div>
            <p className="text-sm leading-relaxed text-mist-500">
              Pulled automatically from your details — nothing to retype. Your
              coordinator chose {info.embroidery.placement.replace("-", " ")},{" "}
              {info.embroidery.font} font, {info.embroidery.thread} thread.
            </p>
            <div className="mt-4 rounded-2xl bg-navy-900 p-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
                Your embroidery · {info.embroidery.placement.replace("-", " ")}
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  info.embroidery.thread === "white" ? "text-white" : "text-gold-300"
                } ${info.embroidery.font === "script" ? "italic" : "tracking-wide"}`}
              >
                {draft.name || "Your Name"}
              </p>
              {draft.department && (
                <p className={`mt-1 text-sm ${info.embroidery.thread === "white" ? "text-white/70" : "text-gold-300/70"}`}>
                  {draft.department}
                </p>
              )}
            </div>
            {(!draft.name.trim() || !draft.department) && (
              <InlineBanner tone="info" className="mt-4 flex items-start gap-2">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <span>
                  Add your name{draft.name.trim() ? "" : " and department"} on
                  step 1 to see your exact embroidery.
                </span>
              </InlineBanner>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-paper p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-mist-500">You</p>
              <p className="mt-1 font-bold text-navy-900">
                {draft.name || "—"}{draft.department ? ` · ${draft.department}` : ""}
              </p>
              <p className="text-mist-500">
                {[draft.careerStage, draft.gender, draft.ageBand, draft.conhess, draft.state]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-paper p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-mist-500">Your fit</p>
              <p className="mt-1 font-bold text-navy-900">{fitSummary(draft.fit)}</p>
            </div>
            {info.embroidery.textEnabled && (
              <div className="rounded-xl bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-mist-500">Embroidery</p>
                <p className="mt-1 font-bold text-navy-900">
                  &ldquo;{draft.name}
                  {draft.department ? ` · ${draft.department}` : ""}&rdquo;
                </p>
              </div>
            )}
            <InlineBanner tone="info">
              What happens next: your coordinator sees this instantly. Once
              everyone is in, they approve the final mockup and we start sewing
              — you can follow along with your phone number on the tracker.
            </InlineBanner>
          </div>
        )}

        {error && (
          <InlineBanner tone="error" className="mt-5 font-semibold">{error}</InlineBanner>
        )}

        <div className="mt-6 flex gap-2.5">
          {step > 0 && (
            <Button variant="secondary" onClick={back}>
              ← Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={next} fullWidth>
              Continue <ArrowRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting} fullWidth>
              {submitting ? "Submitting…" : "Confirm my submission 🎉"}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-mist-400">
        Stuck?{" "}
        <Link href="/" className="underline">
          Talk to us on WhatsApp
        </Link>{" "}
        — a human replies in minutes.
      </p>
    </div>
  );
}
