"use client";

import { AlertIcon, CheckIcon } from "./icons";
import { InlineBanner } from "./ui";

export const COLOUR_HEX: Record<string, string> = {
  Navy: "#1F2A44",
  "Ceil Blue": "#8FB4D9",
  Teal: "#1E8A8A",
  "Hunter Green": "#2F5D3A",
  Wine: "#722F37",
  Black: "#232323",
  White: "#FFFFFF",
  Royal: "#2B4BD8",
  Plum: "#6B3A5D",
  Olive: "#6B7043",
};

function hexFor(colour: string): string {
  return COLOUR_HEX[colour] ?? "#9EA1A7";
}

export default function SwatchPicker({
  colours,
  value,
  onChange,
  multi,
  approvedLibrary,
  orgName,
}: {
  colours: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
  approvedLibrary?: string[];
  orgName?: string;
}) {
  const selected = Array.isArray(value) ? value : [value];
  const outOfLibrary = approvedLibrary
    ? selected.filter((c) => !approvedLibrary.includes(c))
    : [];

  function toggle(colour: string) {
    if (multi) {
      const list = Array.isArray(value) ? value : [];
      onChange(
        list.includes(colour)
          ? list.filter((c) => c !== colour)
          : [...list, colour]
      );
    } else {
      onChange(colour);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3" role={multi ? "group" : "radiogroup"} aria-label="Choose colour">
        {colours.map((c) => {
          const isSelected = selected.includes(c);
          const flagged = !!approvedLibrary && !approvedLibrary.includes(c);
          const hex = hexFor(c);
          const light = ["White", "Ceil Blue"].includes(c);
          return (
            <button
              key={c}
              type="button"
              role={multi ? undefined : "radio"}
              aria-checked={multi ? undefined : isSelected}
              aria-label={`${c}${flagged ? " (outside approved library)" : ""}`}
              onClick={() => toggle(c)}
              className="flex min-h-[44px] min-w-[44px] flex-col items-center gap-1.5 rounded-xl p-1"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  isSelected
                    ? "ring-[3px] ring-primary-600 ring-offset-2"
                    : "ring-1 ring-black/10 hover:ring-2 hover:ring-primary-300"
                } ${flagged && isSelected ? "ring-amber-500" : ""}`}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <CheckIcon
                    className={`h-5 w-5 ${light ? "text-navy-900" : "text-white"}`}
                  />
                )}
              </span>
              <span
                className={`max-w-[72px] text-center text-[11px] font-semibold leading-tight ${
                  isSelected ? "text-navy-900" : "text-mist-500"
                }`}
              >
                {c}
              </span>
            </button>
          );
        })}
      </div>
      {outOfLibrary.length > 0 && (
        <InlineBanner tone="warning" className="mt-3 flex items-start gap-2">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>{outOfLibrary.join(", ")}</strong> {outOfLibrary.length === 1 ? "is" : "are"} outside{" "}
            {orgName ? `${orgName}'s` : "your"} approved colour library. You can
            still proceed — we&apos;ve flagged {outOfLibrary.length === 1 ? "it" : "them"} for confirmation.
          </span>
        </InlineBanner>
      )}
    </div>
  );
}
