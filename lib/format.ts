export function formatNaira(amount: number): string {
  return "₦" + Math.round(amount).toLocaleString("en-NG");
}

export const WHATSAPP_NUMBER = "2348012345678";
export const WHATSAPP_SALES = `https://wa.me/${WHATSAPP_NUMBER}`;

export function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return `${Math.max(1, Math.floor(ms / 60000))}m left`;
  if (hours < 48) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h left`;
}

export function isExpiringSoon(iso: string): boolean {
  const ms = new Date(iso).getTime() - Date.now();
  return ms > 0 && ms < 48 * 3600000;
}

export function isExpired(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now();
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const DELIVERY_ZONES = [
  { id: "lagos", label: "Lagos State", fee: 2500, eta: "1–2 business days" },
  {
    id: "southwest",
    label: "South-West (Ogun, Oyo, Osun, Ondo, Ekiti)",
    fee: 4000,
    eta: "2–3 business days",
  },
  {
    id: "nationwide",
    label: "Nationwide (all other states + FCT)",
    fee: 5500,
    eta: "3–5 business days",
  },
] as const;

export const FREE_DELIVERY_THRESHOLD = 200000;

export const PAYMENT_METHODS = [
  {
    id: "pay-on-delivery",
    label: "Pay on Delivery",
    hint: "Lagos orders only — cash or transfer when your order arrives.",
  },
  {
    id: "bank-transfer",
    label: "Bank Transfer",
    hint: "We confirm your order and send account details by email & SMS.",
  },
  {
    id: "card",
    label: "Card / Paystack (Demo)",
    hint: "Online card payment — simulated checkout in this demo.",
  },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CATEGORIES = [
  "Scrub Tops",
  "Scrub Sets",
  "Lab Coats",
  "Trousers",
  "Tunics",
  "Jackets",
  "Headwear",
  "Footwear",
  "Accessories",
] as const;
