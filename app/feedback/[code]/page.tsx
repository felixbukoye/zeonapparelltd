"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, ButtonLink, Field, InlineBanner } from "@/components/ui";
import { CheckIcon, StarIcon } from "@/components/icons";

const FIT_OPTIONS = [
  ["yes", "Yes, perfect! 🎉"],
  ["slightly-tight", "Slightly tight"],
  ["slightly-loose", "Slightly loose"],
  ["no", "No, needs a remake"],
] as const;

function Stars({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          onClick={() => onChange(s)}
          className={`rounded-lg p-1 ${s <= value ? "text-amber-400" : "text-line"}`}
        >
          <StarIcon className="h-9 w-9" filled={s <= value} />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const params = useParams();
  const code = decodeURIComponent(params.code as string);
  const [fit, setFit] = useState<string>("");
  const [ratings, setRatings] = useState({ overall: 0, sizing: 0, fabric: 0 });
  const [nameCorrect, setNameCorrect] = useState<boolean | undefined>();
  const [deptCorrect, setDeptCorrect] = useState<boolean | undefined>();
  const [wearerName, setWearerName] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fit) {
      setStatus("error");
      setMessage("Tell us how the fit was — that's the most important part.");
      return;
    }
    if (!ratings.overall || !ratings.sizing || !ratings.fabric) {
      setStatus("error");
      setMessage("Please tap a star rating for all three rows.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: code,
          fit,
          overall: ratings.overall,
          sizing: ratings.sizing,
          fabric: ratings.fabric,
          nameCorrect,
          deptCorrect,
          wearerName,
          text,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setStatus("done");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not submit.");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
          <span className="animate-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-black text-navy-900">
            Feedback received 🤍
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-mist-500">{message}</p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-navy-900 p-5">
            <p className="font-display font-black text-gold-400">
              Want 100 ZEON Points?
            </p>
            <p className="mt-1 text-[13px] text-white/65">
              Join a 10-minute Discovery chat about your workwear life — your
              answers shape what we sew next.
            </p>
            <ButtonLink
              href={`/discovery?mode=embedded&order=${encodeURIComponent(code)}`}
              variant="gold"
              fullWidth
              className="mt-4"
            >
              Start Discovery chat
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const toggle = (
    v: boolean | undefined,
    set: (b: boolean) => void,
    label: string
  ) => (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      <span className="flex gap-2">
        <button
          type="button"
          onClick={() => set(true)}
          aria-pressed={v === true}
          className={`min-h-[44px] min-w-[64px] rounded-xl text-sm font-bold transition ${
            v === true ? "bg-success text-white" : "bg-white text-mist-500 hover:text-navy-900"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => set(false)}
          aria-pressed={v === false}
          className={`min-h-[44px] min-w-[64px] rounded-xl text-sm font-bold transition ${
            v === false ? "bg-error text-white" : "bg-white text-mist-500 hover:text-navy-900"
          }`}
        >
          No
        </button>
      </span>
    </div>
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
        Fit check · {code}
      </p>
      <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">
        How do they feel?
      </h1>
      <p className="mt-2 text-sm text-mist-500">
        60 seconds, 4 taps — and if anything isn&apos;t right, we&apos;ll make
        it right.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-7">
        <Field label="Does it fit well?">
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Fit">
            {FIT_OPTIONS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={fit === id}
                onClick={() => setFit(id)}
                className={`min-h-[52px] rounded-xl border-2 px-4 text-sm font-bold transition ${
                  fit === id
                    ? "border-primary-600 bg-primary-50 text-primary-800"
                    : "border-line text-navy-800 hover:border-mist-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <div className="space-y-3.5">
          <Field label="Overall, how happy are you?">
            <Stars label="Overall rating" value={ratings.overall} onChange={(v) => setRatings((r) => ({ ...r, overall: v }))} />
          </Field>
          <Field label="How accurate was the sizing?">
            <Stars label="Sizing rating" value={ratings.sizing} onChange={(v) => setRatings((r) => ({ ...r, sizing: v }))} />
          </Field>
          <Field label="How's the fabric?">
            <Stars label="Fabric rating" value={ratings.fabric} onChange={(v) => setRatings((r) => ({ ...r, fabric: v }))} />
          </Field>
        </div>

        <div className="space-y-2">
          {toggle(nameCorrect, setNameCorrect, "Is your embroidered name spelt right?")}
          {toggle(deptCorrect, setDeptCorrect, "Is your department correct?")}
        </div>

        <Field label="Your name" optional hint="For team orders — so we match this to your package.">
          <input
            value={wearerName}
            onChange={(e) => setWearerName(e.target.value)}
            placeholder="e.g. Nurse Funke"
            className="w-full rounded-xl border border-line px-4 py-3 outline-none placeholder:text-mist-400 focus:border-primary-600"
          />
        </Field>

        <Field label="Anything else we should know?" optional>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Loose thread? Long sleeve? Dream feature? Tell us everything."
            className="w-full rounded-xl border border-line px-4 py-3 outline-none placeholder:text-mist-400 focus:border-primary-600"
          />
        </Field>

        {status === "error" && message && (
          <InlineBanner tone="error" className="font-semibold">{message}</InlineBanner>
        )}

        <Button type="submit" fullWidth disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send feedback"}
        </Button>
      </form>
    </div>
  );
}
