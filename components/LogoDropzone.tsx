"use client";

import { useRef, useState } from "react";
import { AlertIcon, CheckIcon, ClockIcon, UploadIcon } from "./icons";
import { StatusBadge } from "./ui";

const ACCEPTED = ["ai", "eps", "jpg", "jpeg"];

export interface LogoFile {
  name: string;
  preview?: string;
}

export default function LogoDropzone({
  value,
  onChange,
  digitization,
}: {
  value?: LogoFile | null;
  onChange: (f: LogoFile | null) => void;
  digitization: "none" | "pending" | "digitized";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File | undefined) {
    setError("");
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED.includes(ext)) {
      setError(
        `We can't preview .${ext || "?"} files — please upload AI, EPS or JPG.`
      );
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("That file is over 15MB — please compress it and try again.");
      return;
    }
    if (["jpg", "jpeg"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = () =>
        onChange({ name: file.name, preview: String(reader.result) });
      reader.readAsDataURL(file);
    } else {
      onChange({ name: file.name });
    }
  }

  return (
    <div>
      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 text-center transition ${
            dragging ? "border-primary-600 bg-primary-50" : "border-mist-300 bg-white hover:border-primary-400 hover:bg-paper"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <UploadIcon className="h-6 w-6" />
          </span>
          <span className="text-sm font-bold text-navy-900">
            Drop your logo here, or tap to browse
          </span>
          <span className="text-xs text-mist-500">
            AI, EPS or JPG · max 15MB
          </span>
        </button>
      ) : (
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="flex items-center gap-4">
            {value.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value.preview}
                alt="Logo proof preview"
                className="h-16 w-16 rounded-xl border border-line object-contain"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-navy-900 font-display text-xs font-black text-gold-400">
                {value.name.split(".").pop()?.toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-navy-900">{value.name}</p>
              <div className="mt-1.5">
                {digitization === "digitized" ? (
                  <StatusBadge
                    tone="success"
                    icon={<CheckIcon className="h-3.5 w-3.5" />}
                    label="Digitized — ready to stitch"
                  />
                ) : (
                  <StatusBadge
                    tone="warning"
                    icon={<ClockIcon className="h-3.5 w-3.5" />}
                    label="Pending digitization (2–3 days)"
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="min-h-[44px] rounded-xl px-3 text-xs font-bold text-mist-500 hover:bg-paper hover:text-error"
            >
              Remove
            </button>
          </div>
          {digitization !== "digitized" && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900">
              This proof is <strong>not final</strong> — our digitizer converts
              it for embroidery within 2–3 days, then you approve the final
              mockup before production.
            </p>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".ai,.eps,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        aria-label="Upload logo file"
      />
      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-error">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
