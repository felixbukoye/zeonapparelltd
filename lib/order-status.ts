import type { BadgeTone } from "@/components/ui";
import type { IndividualOrderStatus, TeamOrderStatus } from "@/lib/types";

export const TEAM_STATUS: Record<TeamOrderStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  quote: { label: "Quote ready", tone: "info" },
  "awaiting-deposit": { label: "Deposit due", tone: "warning" },
  "awaiting-submissions": { label: "Collecting sizes", tone: "info" },
  "awaiting-approval": { label: "Ready to approve", tone: "warning" },
  "in-production": { label: "In production", tone: "navy" },
  "awaiting-balance": { label: "Balance due", tone: "warning" },
  dispatched: { label: "Dispatched", tone: "info" },
  delivered: { label: "Delivered", tone: "success" },
  complete: { label: "Complete", tone: "success" },
};

export const INDIVIDUAL_STATUS: Record<IndividualOrderStatus, { label: string; tone: BadgeTone }> = {
  confirmed: { label: "Confirmed", tone: "navy" },
  "in-production": { label: "In production", tone: "navy" },
  dispatched: { label: "Dispatched", tone: "info" },
  delivered: { label: "Delivered", tone: "success" },
};
