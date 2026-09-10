"use client";

export const PLACEMENTS = [
  { id: "left-chest", label: "Left chest", hint: "Classic — over the heart" },
  { id: "right-chest", label: "Right chest", hint: "Mirrored classic" },
  { id: "sleeve", label: "Sleeve", hint: "Subtle & modern" },
] as const;

export default function PlacementPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
      <svg
        viewBox="0 0 200 210"
        className="mx-auto w-48 sm:w-full"
        role="group"
        aria-label="Embroidery placement diagram"
      >
        {/* scrub top outline */}
        <path
          d="M70 18 C60 22 48 28 36 36 L20 78 L44 88 L52 70 L52 192 L148 192 L148 70 L156 88 L180 78 L164 36 C152 28 140 22 130 18 C124 30 114 36 100 36 C86 36 76 30 70 18 Z"
          fill="#FAFAFB"
          stroke="#101F39"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* neck */}
        <path
          d="M70 18 C76 30 86 36 100 36 C114 36 124 30 130 18"
          fill="none"
          stroke="#101F39"
          strokeWidth={2.5}
        />
        <ZoneButton
          cx={72}
          cy={78}
          selected={value === "right-chest"}
          label="Right chest"
          onSelect={() => onChange("right-chest")}
        />
        <ZoneButton
          cx={128}
          cy={78}
          selected={value === "left-chest"}
          label="Left chest"
          onSelect={() => onChange("left-chest")}
        />
        <ZoneButton
          cx={163}
          cy={70}
          selected={value === "sleeve"}
          label="Sleeve"
          onSelect={() => onChange("sleeve")}
        />
      </svg>
      <div className="space-y-2">
        {PLACEMENTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={value === p.id}
            className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
              value === p.id
                ? "border-primary-600 bg-primary-50"
                : "border-line bg-white hover:border-mist-300"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                value === p.id ? "bg-primary-600 text-white" : "bg-line text-mist-500"
              }`}
            >
              {value === p.id ? "✓" : "○"}
            </span>
            <span>
              <span className="block text-sm font-bold text-navy-900">{p.label}</span>
              <span className="block text-xs text-mist-500">{p.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ZoneButton({
  cx,
  cy,
  selected,
  label,
  onSelect,
}: {
  cx: number;
  cy: number;
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <g
      onClick={onSelect}
      className="cursor-pointer"
      role="button"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <circle cx={cx} cy={cy} r={22} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={13}
        fill={selected ? "#0064FB" : "#FFFFFF"}
        stroke={selected ? "#0064FB" : "#9EA1A7"}
        strokeWidth={2.5}
        strokeDasharray={selected ? "0" : "4 3"}
      />
      {selected && (
        <path
          d={`M${cx - 5} ${cy} l3.5 3.5 L${cx + 5.5} ${cy - 4.5}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}
