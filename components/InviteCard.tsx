"use client";

import { useState } from "react";
import { isExpired, isExpiringSoon, timeLeft } from "@/lib/format";
import { CheckIcon, ClockIcon, CopyIcon, UsersIcon, WhatsAppIcon } from "./icons";

export default function InviteCard({
  token,
  submitted,
  headcount,
  expiry,
  orgName,
  compact,
}: {
  token: string;
  submitted: number;
  headcount: number;
  expiry: string;
  orgName: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/intake/${token}`
      : `/intake/${token}`;
  const expired = isExpired(expiry);
  const urgent = isExpiringSoon(expiry);
  const pct = headcount > 0 ? Math.min(100, (submitted / headcount) * 100) : 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  const waText = `Hello! You're invited to submit your measurements for ${orgName}'s ZEON uniforms 👕\n\nIt takes about 3 minutes, no account needed:\n${link}\n\nThank you! 🤍`;

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <UsersIcon className="h-5 w-5 text-primary-600" />
          {submitted} of {headcount} submitted
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            expired
              ? "bg-red-50 text-error"
              : urgent
                ? "bg-amber-50 text-amber-800"
                : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <ClockIcon className="h-3.5 w-3.5" />
          {expired ? "Link expired" : timeLeft(expiry)}
        </span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact && (
        <>
          <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-paper px-3.5 py-1.5">
            <code className="min-w-0 flex-1 truncate py-2 font-mono text-[13px] text-navy-800">
              {link}
            </code>
            <button
              onClick={copy}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold text-primary-700 hover:bg-primary-50"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4 text-success" /> Copied
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={copy}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-bold text-navy-900 hover:border-mist-300"
            >
              <CopyIcon className="h-4.5 w-4.5" />
              {copied ? "Copied!" : "Copy link"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 text-sm font-bold text-white hover:brightness-95"
            >
              <WhatsAppIcon className="h-4.5 w-4.5" /> Share
            </a>
          </div>
        </>
      )}
    </div>
  );
}
