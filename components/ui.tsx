"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";
import { WHATSAPP_NUMBER } from "@/lib/format";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  WhatsAppIcon,
} from "./icons";

/* --------------------------------- Button --------------------------------- */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "whatsapp"
  | "dark"
  | "gold"
  | "danger";

const BTN_BASE =
  "inline-flex min-h-[44px] items-center justify-content-center gap-2 rounded-xl px-6 text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
  secondary:
    "border border-line bg-white text-navy-900 hover:border-navy-200 hover:bg-paper",
  tertiary: "px-3 text-primary-600 hover:text-primary-700 hover:underline",
  whatsapp:
    "bg-whatsapp text-white shadow-sm hover:brightness-95",
  dark: "bg-navy-900 text-white hover:bg-navy-950",
  gold: "bg-gold-500 text-navy-950 hover:bg-gold-400",
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
        className="mt-2 h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
      >
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
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
                    ? "bg-primary-600 text-white"
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
          className={`h-full rounded-full transition-all duration-300 ${dark ? "bg-gold-500" : "bg-primary-600"}`}
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
  neutral: "bg-line text-mist-500",
  info: "bg-primary-50 text-primary-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  error: "bg-red-50 text-error",
  navy: "bg-navy-900 text-white",
  gold: "bg-gold-500/15 text-gold-600",
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
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-navy-900 outline-none transition placeholder:text-mist-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100";
export const inputErrorCls =
  "w-full rounded-xl border border-error bg-white px-4 py-3 text-navy-900 outline-none placeholder:text-mist-400 focus:ring-2 focus:ring-red-100";

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
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]} ${className}`}
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
      className={`flex flex-col items-center px-6 py-12 text-center ${dark ? "" : "rounded-2xl border border-line bg-white"}`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${dark ? "bg-white/10 text-gold-400" : "bg-primary-50 text-primary-600"}`}
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
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden />;
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
      <div className="animate-sheet-up relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
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
          className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-navy-950 px-4 py-3.5 text-white shadow-2xl"
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
