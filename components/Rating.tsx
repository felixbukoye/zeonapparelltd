import { StarIcon } from "./icons";

export default function Rating({
  value,
  count,
  className = "",
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="inline-flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            className="h-3.5 w-3.5"
            filled={value >= i - 0.25}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-ink-500">
        {value.toFixed(1)}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
    </span>
  );
}
