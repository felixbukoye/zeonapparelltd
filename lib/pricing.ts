/* ZEON pricing tiers (Individual 1–4 sets tier per spec §5.3;
   team tiers + 30% deposit on 15+ sets per §5.6) */

export const PRODUCTION_STAGES = [
  "Order Confirmed",
  "Material Sourced",
  "Cutting",
  "Sewing & Assembly",
  "Customization",
  "Quality Check",
  "Packaging",
  "Dispatched",
] as const;

export interface TierInfo {
  min: number;
  max: number | null;
  discount: number;
  label: string;
  deposit: boolean;
}

export const SET_TIERS: TierInfo[] = [
  { min: 1, max: 4, discount: 0, label: "Individual (1–4 sets)", deposit: false },
  { min: 5, max: 14, discount: 0.1, label: "Team (5–14 sets) — 10% off", deposit: false },
  { min: 15, max: null, discount: 0.15, label: "Institutional (15+ sets) — 15% off, 30% deposit", deposit: true },
];

export function tierForSets(sets: number): TierInfo {
  return (
    SET_TIERS.find((t) => sets >= t.min && (t.max === null || sets <= t.max)) ??
    SET_TIERS[0]
  );
}

export function quoteForSets(sets: number, perSet: number) {
  const tier = tierForSets(sets);
  const subtotal = perSet * sets;
  const discount = Math.round(subtotal * tier.discount);
  const total = subtotal - discount;
  const depositDue = tier.deposit ? Math.round(total * 0.3) : total;
  return {
    perSet,
    sets,
    subtotal,
    discount,
    total,
    depositDue,
    balance: total - depositDue,
    tier,
  };
}

export function productionEta(fromDate = new Date(), weeks = 3): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString();
}

export function newProductionState(weeks = 3) {
  const now = new Date().toISOString();
  return {
    stage: 0,
    timestamps: [now, null, null, null, null, null, null, null] as (string | null)[],
    eta: productionEta(new Date(), weeks),
  };
}

export function advanceProduction(
  production: { stage: number; timestamps: (string | null)[]; eta: string },
  opts?: { slipWeeks?: number }
) {
  const stage = Math.min(7, production.stage + 1);
  const timestamps = [...production.timestamps];
  timestamps[stage] = new Date().toISOString();
  let eta = production.eta;
  if (opts?.slipWeeks) {
    const d = new Date(eta);
    d.setDate(d.getDate() + opts.slipWeeks * 7);
    eta = d.toISOString();
  }
  return { stage, timestamps, eta };
}
