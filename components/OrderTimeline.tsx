import { ORDER_STATUS_LABELS, formatDateTime } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { CheckIcon } from "./icons";

const STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

export function statusColor(status: OrderStatus): string {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "confirmed":
      return "bg-brand-100 text-brand-800";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-ink-100 text-ink-700";
  }
}

export default function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-sm font-semibold text-red-700">
        This order was cancelled. Contact us if you need help with a replacement
        order.
      </div>
    );
  }
  const currentIdx = STEPS.indexOf(order.status);

  return (
    <div>
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const isLast = i === STEPS.length - 1;
          return (
            <li key={step} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400"
                  }`}
                >
                  {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`mt-1.5 hidden text-[11px] font-bold uppercase tracking-wide sm:block ${
                    done ? "text-brand-700" : "text-ink-400"
                  }`}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </div>
              {!isLast && (
                <div className={`mx-1 mb-0 h-1 flex-1 rounded-full sm:mb-6 ${i < currentIdx ? "bg-brand-600" : "bg-ink-100"}`} />
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 space-y-2.5 border-t border-ink-100 pt-4">
        {order.timeline.map((t, i) => (
          <div key={i} className="flex items-start justify-between gap-3 text-sm">
            <p className="font-semibold text-ink-800">
              {t.status}
              {t.note && <span className="block text-xs font-normal text-ink-500">{t.note}</span>}
            </p>
            <p className="shrink-0 text-xs text-ink-400">{formatDateTime(t.at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
