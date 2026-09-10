/* ------------------------------ catalogue ------------------------------ */

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  colors: string[];
  sizes: string[];
  description: string;
  details: string[];
  fabric: string;
  images: string[];
  featured?: boolean;
  badge?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

/* --------------------------------- people --------------------------------- */

export type CareerStage = "student" | "nysc" | "staff" | "senior";
export type FitPreference = "fitted" | "relaxed";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: "coordinator" | "admin";
  phone?: string;
  orgName?: string;
  orgType?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export type SafeUser = Omit<User, "passwordHash" | "salt">;

/* ------------------------------- collections ------------------------------ */

export interface CollectionStyle {
  productId: string;
  colours: string[];
}

export interface EmbroideryRule {
  category: string;
  mode: "logo-text" | "logo" | "text" | "none";
}

export interface Collection {
  id: string;
  coordinatorId: string;
  name: string;
  mode: "full" | "custom";
  genders: string[];
  categories: string[];
  styles: CollectionStyle[];
  approvedColours: string[];
  embroideryRules: EmbroideryRule[];
  status: "draft" | "for-production";
  version: number;
  history: { version: number; at: string; note: string }[];
  createdAt: string;
}

/* -------------------------------- team orders ------------------------------ */

export interface RosterEntry {
  id: string;
  name: string;
  department?: string;
  ageBand?: string;
  gender?: string;
  careerStage?: CareerStage;
  conhess?: string;
  state?: string;
  phone?: string;
  sizeMode?: "preset" | "manual";
  size?: string;
  fit?: FitPreference;
  measurements?: Record<string, number>;
  embroideryText?: string;
  submitted: boolean;
  submittedAt?: string;
  source: "invite" | "manual";
}

export interface TeamQuote {
  perSet: number;
  sets: number;
  subtotal: number;
  discount: number;
  total: number;
  depositDue: number;
  balance: number;
  status: "pending" | "ready" | "accepted";
  issuedAt?: string;
}

export type TeamOrderStatus =
  | "draft"
  | "quote"
  | "awaiting-deposit"
  | "awaiting-submissions"
  | "awaiting-approval"
  | "in-production"
  | "awaiting-balance"
  | "dispatched"
  | "delivered"
  | "complete";

export interface TeamOrder {
  id: string;
  code: string;
  productIds: string[];
  collectionId: string;
  coordinatorId: string;
  orgName: string;
  headcount: number;
  departments: string[];
  type: "team" | "self";
  inviteToken: string;
  inviteExpiry: string;
  roster: RosterEntry[];
  quote: TeamQuote;
  depositPaid: boolean;
  depositAt?: string;
  balancePaid: boolean;
  balanceAt?: string;
  embroidery: {
    placement: string;
    font: "block" | "script";
    thread: "white" | "black";
    logoName?: string;
    digitization: "none" | "pending" | "digitized";
    mockupApproved: boolean;
    mockupApprovedAt?: string;
  };
  production: { stage: number; timestamps: (string | null)[]; eta: string };
  status: TeamOrderStatus;
  trackingCode?: string;
  createdAt: string;
}

/* ----------------------------- individual orders --------------------------- */

export type IndividualOrderStatus =
  | "confirmed"
  | "in-production"
  | "dispatched"
  | "delivered";

export interface IndividualOrder {
  id: string;
  code: string;
  productId: string;
  styleId: string;
  styleName: string;
  image: string;
  colour: string;
  gender: string;
  careerStage: CareerStage;
  sizeMode: "preset" | "manual";
  size?: string;
  fit: FitPreference;
  measurements?: Record<string, number>;
  sets: number;
  embroidery?: {
    text: string;
    placement: string;
    font: string;
    thread: string;
  };
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zone: string;
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod: string;
  paidAt: string;
  production: { stage: number; timestamps: (string | null)[]; eta: string };
  status: IndividualOrderStatus;
  trackingCode?: string;
  sizeProfileId?: string;
  createdAt: string;
}

/* ------------------------------- size profiles ----------------------------- */

export interface SizeProfile {
  id: string;
  identity: string;
  name?: string;
  sizeMode: "preset" | "manual";
  size?: string;
  fit: FitPreference;
  measurements?: Record<string, number>;
  helper?: { shirtSize?: string; height?: string; build?: string };
  updatedAt: string;
}

/* --------------------------------- discovery ------------------------------- */

export type DiscoveryMode = "assisted" | "guided" | "embedded";

export interface DiscoveryAnswer {
  section: number;
  question: string;
  answer: string;
  skipped: boolean;
  voiceNote?: boolean;
}

export interface DiscoverySession {
  id: string;
  mode: DiscoveryMode;
  name?: string;
  contact?: string;
  ambassador?: string;
  answers: DiscoveryAnswer[];
  currentSection: number;
  completed: boolean;
  points: number;
  communityOptIn?: boolean;
  orderCode?: string;
  createdAt: string;
  completedAt?: string;
}

/* --------------------------------- feedback -------------------------------- */

export interface Feedback {
  id: string;
  orderCode: string;
  kind: "individual" | "team";
  wearerName?: string;
  fit: "yes" | "slightly-tight" | "slightly-loose" | "no";
  ratings: { overall: number; sizing: number; fabric: number };
  nameCorrect?: boolean;
  deptCorrect?: boolean;
  text?: string;
  createdAt: string;
}

/* ---------------------------------- events --------------------------------- */

export interface AppEvent {
  id: string;
  name: string;
  props?: Record<string, string | number | boolean>;
  at: string;
}

/* ------------------------- legacy retail (deprecated) ---------------------- */

export interface CartItemInput {
  productId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  price: number;
  qty: number;
  image: string;
}

export interface OrderItem extends CartItemInput {}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  code: string;
  userId?: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  zone: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "on-delivery";
  status: OrderStatus;
  notes?: string;
  timeline: { status: string; at: string; note?: string }[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  title?: string;
  body: string;
  status: "approved" | "pending";
  createdAt: string;
}

export interface Enquiry {
  id: string;
  kind: "wholesale" | "contact";
  name: string;
  email: string;
  phone: string;
  organisation?: string;
  quantity?: string;
  products?: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}
