"use client";

import { useState } from "react";
import { PRODUCTION_STAGES } from "@/lib/pricing";
import { formatDate, formatDateTime } from "@/lib/format";
import { CheckIcon, ClockIcon } from "./icons";

export interface ProductionState {
  stage: number; // -1 = not started
  timestamps: (string | null)[];
  eta: string;
}

export default function ProductionTracker({
  production,
  variant = "full",
  etaSlipped,
}: {
  production: ProductionState;
  variant?: "full" | "simple";
  etaSlipped?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const { stage, timestamps, eta } = production;

  if (stage < 0) {
    return (
      <div className="rounded-xl border border-dashed border-mist-300 bg-paper px-4 py-5 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-bold text-navy-900">
          <ClockIcon className="h-4.5 w-4.5 text-mist-500" />
          Production hasn&apos;t started yet
        </p>
        <p className="mt-1 text-xs text-mist-500">
          Your pieces move to the workroom as soon as payment is confirmed.
        </p>
      </div>
    );
  }

  const detail = selected !== null ? selected : stage;

  return (
    <div>
      <ol className="flex items-start" aria-label="Production progress">
        {PRODUCTION_STAGES.map((label, i) => {
          const done = i < stage;
          const current = i === stage;
          const isLast = i === PRODUCTION_STAGES.length - 1;
          return (
            <li key={label} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
              <button
                onClick={() => setSelected(i)}
                className="flex min-w-[44px] flex-col items-center rounded-lg px-1 py-1"
                aria-label={`${label}: ${done ? "completed" : current ? "in progress" : "upcoming"}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                    done
                      ? "bg-navy-900 text-white"
                      : current
                        ? "animate-pulse-soft bg-primary-600 text-white"
                        : "border-2 border-mist-300 bg-white text-mist-400"
                  }`}
                >
                  {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`mt-1.5 hidden max-w-[86px] text-center text-[10px] font-bold leading-tight sm:block ${
                    done || current ? "text-navy-900" : "text-mist-400"
                  }`}
                >
                  {label}
                </span>
              </button>
              {!isLast && (
                <div
                  className={`mx-0.5 mt-5 h-1 flex-1 rounded-full ${i < stage ? "bg-navy-900" : "bg-line"}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 rounded-xl bg-paper px-4 py-3">
        <p className="text-sm font-bold text-navy-900">
          {PRODUCTION_STAGES[detail]}
          {detail === stage && stage < 7 && (
            <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-700">
              In progress
            </span>
          )}
          {detail < stage && (
            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              ✓ Done
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-mist-500">
          {timestamps[detail]
            ? variant === "full"
              ? formatDateTime(timestamps[detail] as string)
              : formatDate(timestamps[detail] as string)
            : detail > stage
              ? "Coming up — we'll update you here."
              : "Just started."}
        </p>
        {variant === "full" && detail === stage && stage === 7 && (
          <p className="mt-0.5 text-xs font-semibold text-success">
            Your package is on its way 🚚
          </p>
        )}
      </div>

      {eta && (
        <p
          className={`mt-2.5 flex items-center gap-1.5 text-[13px] ${
            etaSlipped ? "font-bold text-amber-700" : "font-semibold text-mist-500"
          }`}
        >
          <ClockIcon className="h-4 w-4" />
          {etaSlipped ? (
            <>Updated delivery estimate: {formatDate(eta)} — thanks for your patience 🤍</>
          ) : (
            <>Estimated delivery: {formatDate(eta)}</>
          )}
        </p>
      )}
    </div>
  );
}
