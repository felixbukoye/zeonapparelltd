"use client";

import { useMemo, useState } from "react";
import type { FitPreference } from "@/lib/types";
import {
  MEASUREMENT_FIELDS,
  SIZE_CHART,
  suggestSize,
} from "@/lib/sizing";
import { AlertIcon, ArrowRightIcon, CheckIcon, RulerIcon } from "./icons";
import { Button, Field, InlineBanner } from "./ui";

export interface FitValue {
  sizeMode: "preset" | "manual";
  size?: string;
  fit: FitPreference;
  measurements?: Record<string, number>;
  helper?: { shirtSize?: string; height?: string; build?: string };
}

export const EMPTY_FIT: FitValue = {
  sizeMode: "preset",
  size: undefined,
  fit: "fitted",
  measurements: {},
  helper: {},
};

export function fitComplete(v: FitValue): boolean {
  if (v.sizeMode === "preset") return !!v.size;
  return MEASUREMENT_FIELDS.every(
    (f) => typeof v.measurements?.[f.id] === "number" && (v.measurements?.[f.id] as number) > 0
  );
}

export function fitSummary(v: FitValue): string {
  const fit = v.fit === "fitted" ? "Fitted" : "Relaxed";
  if (v.sizeMode === "preset") return `${v.size ?? "—"} · ${fit}`;
  return `Custom measurements · ${fit}`;
}

/* ------------------------------ body map ---------------------------------- */

const ZONE_LABELS: Record<string, string> = {
  chest: "Chest",
  waist: "Waist",
  hip: "Hips",
  topLength: "Top length",
  sleeve: "Sleeve",
  trouserWaist: "Trouser waist",
  inseam: "Inseam",
};

export function BodyMap({ highlight }: { highlight?: string }) {
  const zone = (id: string, x1: number, y1: number, x2: number, y2: number) => {
    const on = highlight === id;
    return (
      <g key={id} opacity={highlight && !on ? 0.25 : 1}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={on ? "#0064FB" : "#9EA1A7"}
          strokeWidth={on ? 4 : 2.5}
          strokeLinecap="round"
          strokeDasharray={on ? "0" : "5 4"}
        />
        <circle cx={x1} cy={y1} r={3.5} fill={on ? "#0064FB" : "#9EA1A7"} />
        <circle cx={x2} cy={y2} r={3.5} fill={on ? "#0064FB" : "#9EA1A7"} />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 160 240" className="w-full max-w-[190px]" role="img" aria-label="Body measurement map">
      {/* figure */}
      <circle cx={80} cy={22} r={13} fill="none" stroke="#101F39" strokeWidth={2.5} />
      <path
        d="M52 48 C60 42 70 40 80 40 C90 40 100 42 108 48 L104 120 C100 132 92 138 80 138 C68 138 60 132 56 120 Z"
        fill="#FAFAFB"
        stroke="#101F39"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path d="M52 48 L30 92 M108 48 L130 92" stroke="#101F39" strokeWidth={2.5} strokeLinecap="round" />
      <path
        d="M60 138 L56 226 M100 138 L104 226"
        stroke="#101F39"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* zones */}
      {zone("chest", 50, 66, 110, 66)}
      {zone("waist", 58, 108, 102, 108)}
      {zone("hip", 56, 132, 104, 132)}
      {zone("topLength", 122, 44, 122, 138)}
      {zone("sleeve", 108, 50, 128, 88)}
      {zone("trouserWaist", 58, 146, 102, 146)}
      {zone("inseam", 78, 150, 78, 224)}
      {highlight && (
        <text
          x={80}
          y={238}
          textAnchor="middle"
          fontSize={10}
          fontWeight={800}
          fill="#0064FB"
        >
          {ZONE_LABELS[highlight]}
        </text>
      )}
    </svg>
  );
}

/* ---------------------------- fit preference ------------------------------- */

export function FitPreferencePicker({
  value,
  onChange,
}: {
  value: FitPreference;
  onChange: (f: FitPreference) => void;
}) {
  const opts: { id: FitPreference; title: string; desc: string }[] = [
    {
      id: "fitted",
      title: "Fitted",
      desc: "Tailored close to the body — our signature ZEON silhouette",
    },
    {
      id: "relaxed",
      title: "Relaxed",
      desc: "Easy room to move — a looser, classic clinical cut",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Fit preference">
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`min-h-[44px] rounded-xl border-2 p-3.5 text-left transition ${
              on ? "border-primary-600 bg-primary-50" : "border-line bg-white hover:border-mist-300"
            }`}
          >
            <svg viewBox="0 0 60 64" className="h-14" aria-hidden>
              {o.id === "fitted" ? (
                <path
                  d="M20 6 C26 4 34 4 40 6 L44 26 C42 34 38 38 30 38 C22 38 18 34 16 26 Z M22 38 L21 58 M38 38 L39 58"
                  fill="none"
                  stroke={on ? "#0064FB" : "#9EA1A7"}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M14 6 C22 3 38 3 46 6 L50 30 C48 38 40 42 30 42 C20 42 12 38 10 30 Z M20 42 L19 58 M40 42 L41 58"
                  fill="none"
                  stroke={on ? "#0064FB" : "#9EA1A7"}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <span className="mt-2 flex items-center gap-1.5 text-sm font-bold text-navy-900">
              {on && <CheckIcon className="h-4 w-4 text-primary-600" />}
              {o.title}
              {o.id === "fitted" && (
                <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Popular
                </span>
              )}
            </span>
            <span className="mt-1 block text-xs leading-snug text-mist-500">{o.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Fit Assistant ------------------------------ */

export default function FitAssistant({
  value,
  onChange,
  identityNote,
}: {
  value: FitValue;
  onChange: (v: FitValue) => void;
  identityNote?: string;
}) {
  const [helperOpen, setHelperOpen] = useState(false);
  const [manualIdx, setManualIdx] = useState(0);
  const [showChart, setShowChart] = useState(false);

  const suggestion = useMemo(
    () =>
      suggestSize({
        shirtSize: value.helper?.shirtSize,
        height: value.helper?.height,
        build: value.helper?.build,
      }),
    [value.helper]
  );

  function patch(p: Partial<FitValue>) {
    onChange({ ...value, ...p });
  }

  const field = MEASUREMENT_FIELDS[manualIdx];
  const fieldVal = value.measurements?.[field.id] ?? "";

  return (
    <div className="space-y-5">
      {/* mode tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-line p-1" role="tablist" aria-label="Sizing method">
        {(
          [
            ["preset", "Preset size"],
            ["manual", "My measurements"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={value.sizeMode === id}
            onClick={() => patch({ sizeMode: id })}
            className={`min-h-[44px] rounded-lg text-sm font-bold transition ${
              value.sizeMode === id
                ? "bg-white text-navy-900 shadow-sm"
                : "text-mist-500 hover:text-navy-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {value.sizeMode === "preset" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div>
              <p className="text-sm font-bold text-navy-900">Pick your size</p>
              <div className="mt-2.5 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Size">
                {SIZE_CHART.map((r) => (
                  <button
                    key={r.size}
                    type="button"
                    role="radio"
                    aria-checked={value.size === r.size}
                    onClick={() => patch({ size: r.size })}
                    className={`min-h-[48px] rounded-xl text-sm font-bold transition ${
                      value.size === r.size
                        ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                        : "border border-line bg-white text-navy-800 hover:border-primary-400"
                    }`}
                  >
                    {r.size}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setHelperOpen((v) => !v)}
                  className="min-h-[44px] rounded-xl bg-navy-900 px-4 text-[13px] font-bold text-white hover:bg-navy-950"
                >
                  Not sure? Help me choose ✨
                </button>
                <button
                  type="button"
                  onClick={() => setShowChart((v) => !v)}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line px-4 text-[13px] font-bold text-navy-800 hover:border-mist-300"
                >
                  <RulerIcon className="h-4 w-4" /> Size chart (cm)
                </button>
              </div>

              {helperOpen && (
                <div className="animate-fade-up mt-3 rounded-xl border border-primary-100 bg-primary-50/60 p-4">
                  <p className="text-sm font-bold text-navy-900">
                    Let&apos;s find your starting size
                  </p>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                    <Field label="Usual shirt size">
                      <select
                        value={value.helper?.shirtSize ?? ""}
                        onChange={(e) =>
                          patch({ helper: { ...value.helper, shirtSize: e.target.value } })
                        }
                        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 outline-none focus:border-primary-600"
                      >
                        <option value="">Select…</option>
                        {["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Height">
                      <select
                        value={value.helper?.height ?? ""}
                        onChange={(e) =>
                          patch({ helper: { ...value.helper, height: e.target.value } })
                        }
                        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 outline-none focus:border-primary-600"
                      >
                        <option value="">Select…</option>
                        <option value="petite">Petite (under 160cm)</option>
                        <option value="average">Average (160–178cm)</option>
                        <option value="tall">Tall (over 178cm)</option>
                      </select>
                    </Field>
                    <Field label="Build">
                      <select
                        value={value.helper?.build ?? ""}
                        onChange={(e) =>
                          patch({ helper: { ...value.helper, build: e.target.value } })
                        }
                        className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 outline-none focus:border-primary-600"
                      >
                        <option value="">Select…</option>
                        <option value="slim">Slim</option>
                        <option value="average">Average</option>
                        <option value="broad">Broad</option>
                      </select>
                    </Field>
                  </div>
                  {suggestion ? (
                    <div className="mt-3 rounded-xl bg-white p-3.5">
                      <p className="text-sm text-navy-900">
                        We suggest starting with{" "}
                        <strong className="font-display text-lg text-primary-700">
                          {suggestion}
                        </strong>
                      </p>
                      <p className="mt-0.5 text-xs text-mist-500">
                        Just a suggestion — you can pick any size, or switch to
                        manual measurements for a truly custom fit.
                      </p>
                      <Button
                        variant="secondary"
                        className="mt-2.5 min-h-[44px] px-4 py-2 text-[13px]"
                        onClick={() => {
                          patch({ size: suggestion });
                          setHelperOpen(false);
                        }}
                      >
                        Use size {suggestion}
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-2.5 text-xs text-mist-500">
                      Pick at least your usual shirt size and we&apos;ll suggest
                      a ZEON size.
                    </p>
                  )}
                </div>
              )}

              {showChart && (
                <div className="animate-fade-up mt-3 overflow-x-auto rounded-xl border border-line bg-white">
                  <table className="w-full min-w-[440px] text-[13px]">
                    <thead>
                      <tr className="border-b border-line text-left text-[11px] uppercase tracking-widest text-mist-500">
                        <th className="px-3.5 py-2.5">Size</th>
                        <th className="px-3.5 py-2.5">Chest</th>
                        <th className="px-3.5 py-2.5">Waist</th>
                        <th className="px-3.5 py-2.5">Hips</th>
                        <th className="px-3.5 py-2.5">Height</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_CHART.map((r) => (
                        <tr
                          key={r.size}
                          className={`border-b border-paper last:border-0 ${value.size === r.size ? "bg-primary-50 font-bold" : ""}`}
                        >
                          <td className="px-3.5 py-2 font-bold text-primary-700">{r.size}</td>
                          <td className="px-3.5 py-2">{r.chest}</td>
                          <td className="px-3.5 py-2">{r.waist}</td>
                          <td className="px-3.5 py-2">{r.hip}</td>
                          <td className="px-3.5 py-2">{r.height}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="hidden justify-center rounded-xl border border-line bg-white p-3 sm:flex">
              <BodyMap />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-navy-900">
              Measurement {manualIdx + 1} of {MEASUREMENT_FIELDS.length}: {field.label}
            </p>
            <p className="text-xs font-semibold text-mist-500">
              {Object.values(value.measurements ?? {}).filter((v) => (v as number) > 0).length}/{MEASUREMENT_FIELDS.length} done
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${((manualIdx + 1) / MEASUREMENT_FIELDS.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
            <div className="mx-auto">
              <BodyMap highlight={field.id} />
            </div>
            <div>
              <p className="text-sm leading-relaxed text-navy-800">
                <strong>How to measure:</strong> {field.howTo}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={fieldVal}
                  onChange={(e) =>
                    patch({
                      measurements: {
                        ...value.measurements,
                        [field.id]: Number(e.target.value),
                      },
                    })
                  }
                  placeholder="e.g. 96"
                  className="w-32 rounded-xl border border-line px-4 py-3 text-center text-lg font-bold outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                  aria-label={`${field.label} in centimetres`}
                />
                <span className="text-sm font-bold text-mist-500">cm</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="min-h-[44px] px-4"
                  disabled={manualIdx === 0}
                  onClick={() => setManualIdx((i) => Math.max(0, i - 1))}
                >
                  ← Back
                </Button>
                {manualIdx < MEASUREMENT_FIELDS.length - 1 ? (
                  <Button
                    className="min-h-[44px]"
                    onClick={() =>
                      setManualIdx((i) => Math.min(MEASUREMENT_FIELDS.length - 1, i + 1))
                    }
                  >
                    Next <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <InlineBanner tone="success" className="flex flex-1 items-center gap-2 py-2">
                    <CheckIcon className="h-4 w-4 shrink-0" />
                    <span className="text-[13px] font-semibold">
                      All measurements captured — nicely done!
                    </span>
                  </InlineBanner>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {MEASUREMENT_FIELDS.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setManualIdx(i)}
                className={`min-h-[36px] rounded-full px-3 text-xs font-bold transition ${
                  i === manualIdx
                    ? "bg-navy-900 text-white"
                    : (value.measurements?.[f.id] as number) > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-paper text-mist-500 hover:text-navy-800"
                }`}
              >
                {(value.measurements?.[f.id] as number) > 0 ? "✓ " : ""}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-bold text-navy-900">How should it fit?</p>
        <p className="mb-2.5 mt-0.5 text-xs text-mist-500">
          Fitted is our signature — cut close, never tight. Relaxed gives you
          extra room to move.
        </p>
        <FitPreferencePicker value={value.fit} onChange={(fit) => patch({ fit })} />
      </div>

      {identityNote && (
        <InlineBanner tone="info" className="flex items-start gap-2">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
          <span>{identityNote}</span>
        </InlineBanner>
      )}
    </div>
  );
}
