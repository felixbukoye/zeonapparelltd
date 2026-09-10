"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";
import { WHATSAPP_NUMBER } from "@/lib/format";
import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  DotsIcon,
  WhatsAppIcon,
} from "./icons";

/* --------------------------------- Button ---------------------------------
   Guide: primary = filled blue pill, white text, icon + label.
   Secondary = white/outline pill, gray text. 40px+ targets. */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "whatsapp"
  | "dark"
  | "gold"
  | "danger";

const BTN_BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[0_6px_20px_rgb(59_110_246/0.35)] hover:bg-primary-600",
  secondary:
    "border border-line bg-white text-navy-800 shadow-card hover:border-primary-200 hover:text-primary-700",
  tertiary: "px-3 text-primary-600 hover:text-primary-700 hover:underline",
  whatsapp:
    "bg-whatsapp text-white shadow-sm hover:brightness-95",
  dark: "bg-navy-950 text-white hover:bg-navy-900",
  gold: "bg-primary-50 text-primary-700 hover:bg-primary-100",
  danger: "bg-error text-white hover:brightness-95",
};

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}) {
  return (
    <button
      className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: {
  href: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function WhatsAppButton({
  message,
  label = "Talk to Sales",
  variant = "whatsapp",
  className = "",
}: {
  message: string;
  label?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${className}`}
    >
      <WhatsAppIcon className="h-5 w-5" />
      {label}
    </a>
  );
}

/* ------------------------------ Card primitives ---------------------------
   Guide: every distinct piece of info lives in its own self-contained card.
   Header row = title (left) + contextual link (right), every card. */

export function Card({
  children,
  className = "",
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <section className={`card p-5 ${hover ? "card-hover" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  sub,
  action,
  menuLabel,
  onMenu,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  menuLabel?: string;
  onMenu?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold tracking-tight text-navy-900">
          {title}
        </h3>
        {sub && <p className="mt-0.5 text-xs text-mist-500">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        {onMenu && (
          <button
            onClick={onMenu}
            aria-label={menuLabel ?? `More actions for ${title}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-mist-400 transition hover:bg-paper hover:text-navy-900"
          >
            <DotsIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function CardLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[40px] items-center whitespace-nowrap px-2 text-[13px] font-semibold text-primary-600 hover:text-primary-700 hover:underline"
    >
      {children}
    </Link>
  );
}

/* ------------------------- Toolbar filter control -------------------------
   Guide: icon + label + chevron, minimal border, sits under page header. */

export function FilterButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition ${
        active
          ? "border-primary-200 bg-primary-50 text-primary-700"
          : "border-line bg-white text-navy-800 hover:border-primary-200 hover:text-primary-700"
      }`}
    >
      {icon}
      {label}
      <ChevronDownIcon className="h-4 w-4 text-mist-400" />
    </button>
  );
}

/* ------------------------------- Progress bar -----------------------------
   Guide: thin, rounded ends, blue fill, light track, date label above. */

export function ProgressBar({
  value,
  label,
  hint,
  tone = "primary",
}: {
  value: number; // 0–100
  label?: string;
  hint?: string;
  tone?: "primary" | "success" | "navy";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fills = {
    primary: "bg-primary",
    success: "bg-success",
    navy: "bg-navy-950",
  };
  return (
    <div>
      {(label || hint) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && (
            <p className="text-xs font-semibold text-navy-900">{label}</p>
          )}
          {hint && <p className="text-[11px] text-mist-400">{hint}</p>}
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className={`progress-fill ${fills[tone]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* --------------------------------- Avatar --------------------------------- */

const AVATAR_TONES = [
  "bg-primary-50 text-primary-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
];

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const tone =
    AVATAR_TONES[
      [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length
    ];
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  };
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${tone} ${sizes[size]} ${className}`}
    >
      {initials || "?"}
    </span>
  );
}

/* ------------------------------ Delta / legend ---------------------------- */

export function Delta({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-error"
      }`}
    >
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      {up ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <span
          key={i.label}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-mist-500"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: i.color }}
            aria-hidden
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------- Line chart (SVG) ---------------------------
   Guide: smooth curves, single-color stroke, soft gradient fill, dashed
   vertical guideline + navy tooltip bubble on the focus point. */

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function LineChart({
  series,
  labels,
  height = 180,
  focusIndex,
  focusLabel,
  secondSeries,
}: {
  series: number[];
  labels: string[];
  height?: number;
  focusIndex?: number;
  focusLabel?: string;
  secondSeries?: number[];
}) {
  const gid = useId().replace(/:/g, "");
  const W = 560;
  const H = height;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 26;
  const all = secondSeries ? [...series, ...secondSeries] : series;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const x = (i: number) =>
    padL + (i / Math.max(1, series.length - 1)) * (W - padL - padR);
  const y = (v: number) =>
    padT + (1 - (v - min) / span) * (H - padT - padB);
  const pts = series.map((v, i) => ({ x: x(i), y: y(v) }));
  const line = smoothPath(pts);
  const area = `${line} L ${x(series.length - 1)},${H - padB} L ${x(0)},${H - padB} Z`;
  const pts2 = secondSeries?.map((v, i) => ({ x: x(i), y: y(v) }));
  const line2 = pts2 ? smoothPath(pts2) : "";
  const fi = focusIndex ?? series.length - 1;
  const fp = pts[Math.max(0, Math.min(series.length - 1, fi))];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          <linearGradient id={`zg-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B6EF6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3B6EF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padL}
            x2={W - padR}
            y1={padT + t * (H - padT - padB)}
            y2={padT + t * (H - padT - padB)}
            className="chart-grid"
            strokeDasharray="3 5"
            opacity={0.7}
          />
        ))}
        <path d={area} fill={`url(#zg-${gid})`} />
        {line2 && (
          <path
            d={line2}
            fill="none"
            stroke="#8A93A6"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            opacity={0.8}
          />
        )}
        <path
          d={line}
          fill="none"
          stroke="#3B6EF6"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* dashed guideline + focus dot */}
        <line
          x1={fp.x}
          x2={fp.x}
          y1={padT - 4}
          y2={H - padB}
          stroke="#0B1B3F"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.35}
        />
        <circle cx={fp.x} cy={fp.y} r={8} fill="#3B6EF6" opacity={0.15} />
        <circle
          cx={fp.x}
          cy={fp.y}
          r={4.5}
          fill="#fff"
          stroke="#3B6EF6"
          strokeWidth={2.5}
        />
        {labels.map((l, i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            className="chart-axis"
          >
            {l}
          </text>
        ))}
      </svg>
      {focusLabel && (
        <div className="-mt-1 flex justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950 px-3 py-1.5 text-[11px] font-bold text-white shadow-card">
            <span className="h-2 w-2 rounded-full bg-primary-300" />
            {focusLabel}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Bar chart (SVG) ---------------------------
   Guide: rounded-top bars, vertical gradient, one bar "active" (full
   opacity) vs others muted. */

export function BarChart({
  values,
  labels,
  height = 180,
  activeIndex,
}: {
  values: number[];
  labels: string[];
  height?: number;
  activeIndex?: number;
}) {
  const gid = useId().replace(/:/g, "");
  const W = 560;
  const H = height;
  const padB = 26;
  const padT = 12;
  const max = Math.max(...values, 1);
  const slot = W / values.length;
  const bw = Math.min(44, slot * 0.46);
  const ai = activeIndex ?? values.indexOf(max);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Bar chart"
    >
      <defs>
        <linearGradient id={`bg-${gid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3B6EF6" stopOpacity="1" />
          <stop offset="100%" stopColor="#3B6EF6" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`bm-${gid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3B6EF6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#3B6EF6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {[0.33, 0.66].map((t) => (
        <line
          key={t}
          x1={0}
          x2={W}
          y1={padT + t * (H - padT - padB)}
          y2={padT + t * (H - padT - padB)}
          className="chart-grid"
          strokeDasharray="3 5"
          opacity={0.7}
        />
      ))}
      {values.map((v, i) => {
        const h = Math.max(6, (v / max) * (H - padT - padB));
        const cx = slot * i + slot / 2;
        return (
          <g key={i} opacity={i === ai ? 1 : 0.75}>
            <rect
              x={cx - bw / 2}
              y={H - padB - h}
              width={bw}
              height={h}
              rx={bw / 2}
              fill={i === ai ? `url(#bg-${gid})` : `url(#bm-${gid})`}
            />
            <text x={cx} y={H - 8} textAnchor="middle" className="chart-axis">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --------------------------------- Stepper -------------------------------- */

export function Stepper({
  steps,
  current,
  className = "",
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  const pct = Math.min(100, ((current + 1) / steps.length) * 100);
  return (
    <div className={className}>
      <p className="text-[13px] font-bold text-navy-900">
        Step {current + 1} of {steps.length}:{" "}
        <span className="text-primary-600">{steps[current]}</span>
      </p>
      <div
        className="progress-track mt-2"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 sm:flex">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              i < current
                ? "text-success"
                : i === current
                  ? "text-primary-700"
                  : "text-mist-400"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                i < current
                  ? "bg-success text-white"
                  : i === current
                    ? "bg-primary text-white"
                    : "bg-line text-mist-500"
              }`}
            >
              {i < current ? <CheckIcon className="h-3 w-3" /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SectionProgress({
  current,
  total,
  label,
  dark,
}: {
  current: number;
  total: number;
  label: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-[13px] font-bold ${dark ? "text-white" : "text-navy-900"}`}
      >
        Section {current} of {total} · {label}
      </p>
      <div
        className={`mt-2 h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-line"}`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${dark ? "bg-white" : "bg-primary"}`}
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------- Status pill ------------------------------ */

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "navy"
  | "gold";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-paper text-mist-500",
  info: "bg-primary-50 text-primary-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  error: "bg-red-50 text-error",
  navy: "bg-navy-950 text-white",
  gold: "bg-primary-50 text-primary-700",
};

export function StatusBadge({
  tone = "neutral",
  icon,
  label,
  className = "",
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${BADGE_TONES[tone]} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

/* ------------------------------- Field shell ------------------------------ */

export function Field({
  label,
  error,
  hint,
  optional,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-bold text-navy-900">
        {label}{" "}
        {optional && (
          <span className="font-medium text-mist-400">(optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs leading-relaxed text-mist-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-error">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-navy-900 outline-none transition placeholder:text-mist-400 focus:border-primary focus:ring-2 focus:ring-primary-100";
export const inputErrorCls =
  "w-full rounded-2xl border border-error bg-white px-4 py-3 text-navy-900 outline-none placeholder:text-mist-400 focus:ring-2 focus:ring-red-100";

/* ------------------------------ Inline banner ----------------------------- */

export function InlineBanner({
  tone = "info",
  children,
  className = "",
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-primary-100 bg-primary-50 text-navy-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------- Empty state ------------------------------ */

export function EmptyState({
  title,
  body,
  action,
  dark,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center px-6 py-12 text-center ${dark ? "" : "rounded-card border border-line bg-white"}`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${dark ? "bg-white/10 text-white" : "bg-primary-50 text-primary-600"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 4v16M5 8.5h14" />
          <path d="M7 20.5h10" strokeWidth={1.6} />
        </svg>
      </span>
      <p
        className={`mt-4 font-display text-lg font-bold ${dark ? "text-white" : "text-navy-900"}`}
      >
        {title}
      </p>
      <p
        className={`mt-1.5 max-w-sm text-sm leading-relaxed ${dark ? "text-white/60" : "text-mist-500"}`}
      >
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* --------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} aria-hidden />;
}

/* ---------------------------------- Modal --------------------------------- */

export function Modal({
  title,
  body,
  confirmLabel,
  cancelLabel = "Go back",
  onConfirm,
  onCancel,
  danger,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <div className="animate-overlay-in absolute inset-0 bg-navy-950/60" onClick={onCancel} />
      <div className="animate-sheet-up relative w-full max-w-md rounded-card bg-white p-6 shadow-pop">
        <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist-500">{body}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Persistent WhatsApp --------------------------- */

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello ZEON! I need some help 🙏")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[60] flex min-h-[52px] items-center gap-2.5 rounded-full bg-whatsapp py-3 pl-4 pr-5 text-sm font-bold text-white shadow-xl shadow-navy-950/20 transition hover:brightness-95 active:scale-95"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline">Talk to Sales</span>
    </a>
  );
}

/* ------------------------------ Offline banner ----------------------------- */

export function OfflineBanner() {
  return null;
}

export function OfflineWatcher() {
  const { notify } = useApp();
  if (typeof window === "undefined") return null;
  return <OfflineWatcherInner notify={notify} />;
}

function OfflineWatcherInner({
  notify,
}: {
  notify: (t: { tone: "success" | "error" | "info"; title: string; body?: string }) => void;
}) {
  useEffect(() => {
    const onOffline = () =>
      notify({
        tone: "info",
        title: "You're offline",
        body: "We'll keep saving your progress on this device and submit when you're back.",
      });
    const onOnline = () =>
      notify({ tone: "success", title: "You're back online" });
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [notify]);
  return null;
}

/* ---------------------------------- Toaster -------------------------------- */

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[80] flex flex-col items-center gap-2 sm:bottom-8 sm:left-auto sm:right-24 sm:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-navy-950 px-4 py-3.5 text-white shadow-pop"
          role="status"
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              t.tone === "success"
                ? "bg-emerald-500"
                : t.tone === "error"
                  ? "bg-error"
                  : "bg-primary-500"
            }`}
          >
            {t.tone === "error" ? (
              <AlertIcon className="h-3.5 w-3.5" />
            ) : (
              <CheckIcon className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">{t.title}</span>
            {t.body && (
              <span className="mt-0.5 block text-[13px] leading-snug text-white/70">
                {t.body}
              </span>
            )}
          </span>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="rounded-lg p-1 text-white/60 hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Greeting hook ------------------------------ */

export function useDaypart() {
  const [label, setLabel] = useState("Good morning");
  useEffect(() => {
    const h = new Date().getHours();
    setLabel(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return label;
}
