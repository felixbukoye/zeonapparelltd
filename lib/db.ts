import crypto from "crypto";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type {
  AppEvent,
  Collection,
  DiscoverySession,
  Enquiry,
  Feedback,
  IndividualOrder,
  Order,
  Product,
  Review,
  RosterEntry,
  SizeProfile,
  TeamOrder,
  User,
} from "./types";

/* ------------------------------ infrastructure -----------------------------
 *
 * Storage migrated from local JSON files (read-only serverless filesystems)
 * to Supabase Postgres. The schema lives in supabase/schema.sql — columns
 * intentionally use the same camelCase names as the TypeScript types in
 * lib/types.ts, so rows round-trip with no field mapping.
 *
 * Conventions kept from the file-based version:
 *  - emails are stored + compared lowercase
 *  - order codes are stored as generated and compared uppercase
 *  - size-profile identity is stored + compared lowercase
 */

function uid(prefix = ""): string {
  return prefix + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function fail(error: PostgrestError | null, fallback: string): void {
  if (error) {
    console.error("[supabase]", fallback, error.code, error.message);
    throw new Error(error.message || fallback);
  }
}

/* ---------------------------------- seeds --------------------------------- */

const ADMIN_EMAIL = "admin@zeonapparel.com";
const ADMIN_PASSWORD = "ZeonAdmin123!";

async function ensureSeeded() {
  const s = supabase();
  const { data: existing } = await s
    .from("users")
    .select("id")
    .eq("email", ADMIN_EMAIL)
    .maybeSingle();
  if (existing) return;

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .createHash("sha256")
    .update(salt + ADMIN_PASSWORD)
    .digest("hex");
  // on-conflict → DO NOTHING, so concurrent first-requests stay safe.
  await s.from("users").upsert(
    {
      id: crypto.randomUUID(),
      name: "Zeon Store Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      salt,
      role: "admin",
      phone: "+234 801 234 5678",
      address: "14 Ogudu Road, Ikeja",
      city: "Lagos",
    },
    { onConflict: "email", ignoreDuplicates: true }
  );
}

/* --------------------------------- products -------------------------------- */

export async function getProducts(): Promise<Product[]> {
  const { data } = await supabase()
    .from("products")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as Product[];
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const { data } = await supabase()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? undefined) as Product | undefined;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data } = await supabase()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? undefined) as Product | undefined;
}

export async function saveProduct(
  input: Omit<Product, "id" | "createdAt" | "rating" | "reviewCount"> & {
    id?: string;
  }
): Promise<Product> {
  const s = supabase();
  if (input.id) {
    const { id, ...patch } = input;
    const { data, error } = await s
      .from("products")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) fail(error, "Failed to update product");
    if (!data) throw new Error("Product not found");
    return data as Product;
  }
  const { data, error } = await s
    .from("products")
    .insert({
      ...input,
      id: crypto.randomUUID(),
      rating: 5,
      reviewCount: 0,
    })
    .select()
    .single();
  fail(error, "Failed to create product");
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase().from("products").delete().eq("id", id);
  fail(error, "Failed to delete product");
}

/* ---------------------------------- users ---------------------------------- */

export async function getUsers(): Promise<User[]> {
  await ensureSeeded();
  const { data } = await supabase().from("users").select("*");
  return (data ?? []) as User[];
}

export async function getUserByEmail(
  email: string
): Promise<User | undefined> {
  const { data } = await supabase()
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return (data ?? undefined) as User | undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data } = await supabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? undefined) as User | undefined;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  orgName?: string;
  orgType?: string;
}): Promise<User> {
  const s = supabase();
  const email = input.email.toLowerCase();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .createHash("sha256")
    .update(salt + input.password)
    .digest("hex");
  const { data, error } = await s
    .from("users")
    .insert({
      id: crypto.randomUUID(),
      name: input.name,
      email,
      passwordHash,
      salt,
      role: "coordinator",
      phone: input.phone,
      orgName: input.orgName,
      orgType: input.orgType,
    })
    .select()
    .single();
  if (error) {
    // unique constraint on email (or a race with the check below)
    throw new Error("An account with this email already exists.");
  }
  return data as User;
}

export async function updateUser(
  id: string,
  patch: Partial<
    Pick<User, "name" | "phone" | "address" | "city" | "orgName" | "orgType">
  >
): Promise<User> {
  const { data, error } = await supabase()
    .from("users")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail(error, "Failed to update user");
  if (!data) throw new Error("User not found");
  return data as User;
}

export function verifyPassword(
  user: User,
  password: string
): boolean {
  const hash = crypto
    .createHash("sha256")
    .update(user.salt + password)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.passwordHash));
}

/* ---------------------------------- orders --------------------------------- */

export async function getOrders(): Promise<Order[]> {
  const { data } = await supabase()
    .from("orders")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as Order[];
}

export async function getOrderByCode(
  code: string
): Promise<Order | undefined> {
  const { data } = await supabase()
    .from("orders")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  return (data ?? undefined) as Order | undefined;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const { data } = await supabase()
    .from("orders")
    .select("*")
    .eq("email", email.toLowerCase())
    .order("createdAt", { ascending: false });
  return (data ?? []) as Order[];
}

async function nextOrderCode(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase()
    .from("orders")
    .select("id", { count: "exact", head: true });
  const seq = String((count ?? 0) + 1).padStart(4, "0");
  return `ZN-${year}-${seq}-${uid()}`;
}

export async function createOrder(
  input: Omit<Order, "id" | "code" | "status" | "timeline" | "createdAt">
): Promise<Order> {
  const s = supabase();
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    email: input.email.toLowerCase(),
    id: crypto.randomUUID(),
    code: await nextOrderCode(),
    status: "pending",
    timeline: [{ status: "Order placed", at: now }],
    createdAt: now,
  };
  const { data, error } = await s
    .from("orders")
    .insert(order)
    .select()
    .single();
  fail(error, "Failed to create order");

  // decrement stock
  const ids = [...new Set(order.items.map((i) => i.productId))];
  if (ids.length) {
    const { data: prods } = await s
      .from("products")
      .select("id, stock")
      .in("id", ids);
    const products = (prods ?? []) as Array<{ id: string; stock: number }>;
    await Promise.all(
      products.map((p) => {
        const qty = order.items
          .filter((i) => i.productId === p.id)
          .reduce((n, i) => n + i.qty, 0);
        return s
          .from("products")
          .update({ stock: Math.max(0, (p.stock ?? 0) - qty) })
          .eq("id", p.id);
      })
    );
  }

  return data as Order;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  note?: string
): Promise<Order> {
  const s = supabase();
  const { data, error } = await s
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(error, "Failed to read order");
  const order = data as Order | null;
  if (!order) throw new Error("Order not found");
  order.status = status;
  order.timeline.push({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    at: new Date().toISOString(),
    note,
  });
  const { data: updated, error: upErr } = await s
    .from("orders")
    .update({ status: order.status, timeline: order.timeline })
    .eq("id", id)
    .select()
    .single();
  fail(upErr, "Failed to update order status");
  return updated as Order;
}

/* --------------------------------- reviews --------------------------------- */

export async function getReviews(): Promise<Review[]> {
  const { data } = await supabase()
    .from("reviews")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as Review[];
}

export async function getApprovedReviewsForProduct(
  productId: string
): Promise<Review[]> {
  const { data } = await supabase()
    .from("reviews")
    .select("*")
    .eq("productId", productId)
    .eq("status", "approved")
    .order("createdAt", { ascending: false });
  return (data ?? []) as Review[];
}

export async function createReview(input: {
  productId: string;
  name: string;
  rating: number;
  title?: string;
  body: string;
}): Promise<Review> {
  const { data, error } = await supabase()
    .from("reviews")
    .insert({
      ...input,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();
  fail(error, "Failed to create review");
  await refreshProductRating(input.productId);
  return data as Review;
}

export async function moderateReview(
  id: string,
  action: "approve" | "delete"
): Promise<void> {
  const s = supabase();
  const { data, error } = await s
    .from("reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(error, "Failed to read review");
  const review = data as Review | null;
  if (!review) throw new Error("Review not found");
  if (action === "delete") {
    await s.from("reviews").delete().eq("id", id);
  } else {
    await s.from("reviews").update({ status: "approved" }).eq("id", id);
  }
  await refreshProductRating(review.productId);
}

async function refreshProductRating(productId: string) {
  const s = supabase();
  const { data: product } = await s
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return;

  const { data: approvedRaw } = await s
    .from("reviews")
    .select("rating")
    .eq("productId", productId)
    .eq("status", "approved");
  const approved = (approvedRaw ?? []) as Array<{ rating: number }>;

  if (approved.length === 0) {
    await s.from("products").update({ reviewCount: 0 }).eq("id", productId);
  } else {
    const avg =
      approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
    await s
      .from("products")
      .update({ reviewCount: approved.length, rating: Math.round(avg * 10) / 10 })
      .eq("id", productId);
  }
}

/* --------------------------------- enquiries -------------------------------- */

export async function getEnquiries(): Promise<Enquiry[]> {
  const { data } = await supabase()
    .from("enquiries")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as Enquiry[];
}

export async function createEnquiry(
  input: Omit<Enquiry, "id" | "status" | "createdAt">
): Promise<Enquiry> {
  const { data, error } = await supabase()
    .from("enquiries")
    .insert({
      ...input,
      id: crypto.randomUUID(),
      status: "new",
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();
  fail(error, "Failed to create enquiry");
  return data as Enquiry;
}

export async function updateEnquiryStatus(
  id: string,
  status: Enquiry["status"]
): Promise<Enquiry> {
  const { data, error } = await supabase()
    .from("enquiries")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail(error, "Failed to update enquiry");
  if (!data) throw new Error("Enquiry not found");
  return data as Enquiry;
}

/* -------------------------------- collections ------------------------------ */

export async function getCollections(): Promise<Collection[]> {
  const { data } = await supabase()
    .from("collections")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as Collection[];
}

export async function getCollectionsByCoordinator(
  coordinatorId: string
): Promise<Collection[]> {
  const { data } = await supabase()
    .from("collections")
    .select("*")
    .eq("coordinatorId", coordinatorId)
    .order("createdAt", { ascending: false });
  return (data ?? []) as Collection[];
}

export async function getCollectionById(
  id: string
): Promise<Collection | undefined> {
  const { data } = await supabase()
    .from("collections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? undefined) as Collection | undefined;
}

export async function saveCollection(
  input: Omit<Collection, "id" | "createdAt" | "version" | "history"> & {
    id?: string;
    note?: string;
  }
): Promise<Collection> {
  const s = supabase();
  if (input.id) {
    const { id, note, ...patch } = input;
    const { data, error } = await s
      .from("collections")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) fail(error, "Failed to read collection");
    const current = data as Collection | null;
    if (!current) throw new Error("Collection not found");
    const bumped =
      input.status === "for-production" && current.status !== "for-production";
    const version = bumped ? current.version + 1 : current.version;
    const history = bumped
      ? [
          ...current.history,
          {
            version,
            at: new Date().toISOString(),
            note: note || "Marked as For Production",
          },
        ]
      : current.history;
    const { data: updated, error: upErr } = await s
      .from("collections")
      .update({ ...patch, version, history })
      .eq("id", id)
      .select()
      .single();
    fail(upErr, "Failed to save collection");
    return updated as Collection;
  }
  const now = new Date().toISOString();
  const { note, ...rest } = input;
  const { data, error } = await s
    .from("collections")
    .insert({
      ...rest,
      id: crypto.randomUUID(),
      version: 1,
      history: [{ version: 1, at: now, note: "Collection created" }],
    })
    .select()
    .single();
  fail(error, "Failed to create collection");
  return data as Collection;
}

export async function deleteCollection(id: string): Promise<void> {
  const { error } = await supabase().from("collections").delete().eq("id", id);
  fail(error, "Failed to delete collection");
}

/* -------------------------------- team orders ------------------------------ */

export async function getTeamOrders(): Promise<TeamOrder[]> {
  const { data } = await supabase()
    .from("team_orders")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as TeamOrder[];
}

export async function getTeamOrdersByCoordinator(
  coordinatorId: string
): Promise<TeamOrder[]> {
  const { data } = await supabase()
    .from("team_orders")
    .select("*")
    .eq("coordinatorId", coordinatorId)
    .order("createdAt", { ascending: false });
  return (data ?? []) as TeamOrder[];
}

export async function getTeamOrderById(
  id: string
): Promise<TeamOrder | undefined> {
  const { data } = await supabase()
    .from("team_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? undefined) as TeamOrder | undefined;
}

export async function getTeamOrderByInviteToken(
  token: string
): Promise<TeamOrder | undefined> {
  const { data } = await supabase()
    .from("team_orders")
    .select("*")
    .eq("inviteToken", token)
    .maybeSingle();
  return (data ?? undefined) as TeamOrder | undefined;
}

export async function getTeamOrderByCode(
  code: string
): Promise<TeamOrder | undefined> {
  const { data } = await supabase()
    .from("team_orders")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  return (data ?? undefined) as TeamOrder | undefined;
}

async function nextTeamCode(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase()
    .from("team_orders")
    .select("id", { count: "exact", head: true });
  return `ZNT-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`;
}

export function makeInviteToken(): string {
  return "ZIN-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export function makeProductId(kind: "T" | "D"): string {
  const year = new Date().getFullYear();
  return `ZP${kind}-${year}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createTeamOrder(
  input: Omit<
    TeamOrder,
    | "id"
    | "code"
    | "productIds"
    | "inviteToken"
    | "inviteExpiry"
    | "roster"
    | "quote"
    | "depositPaid"
    | "balancePaid"
    | "production"
    | "status"
    | "createdAt"
  > & {
    roster?: RosterEntry[];
    inviteDays?: number;
    perSet?: number;
  }
): Promise<TeamOrder> {
  const { roster, inviteDays, perSet, ...rest } = input;
  const now = new Date().toISOString();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (inviteDays ?? 14));
  const per = perSet ?? 32000;
  const order: TeamOrder = {
    ...rest,
    id: crypto.randomUUID(),
    code: await nextTeamCode(),
    productIds: [],
    inviteToken: makeInviteToken(),
    inviteExpiry: expiry.toISOString(),
    roster: roster ?? [],
    quote: {
      perSet: per,
      sets: rest.headcount,
      subtotal: per * rest.headcount,
      discount: 0,
      total: per * rest.headcount,
      depositDue: 0,
      balance: 0,
      status: "pending",
    },
    depositPaid: false,
    balancePaid: false,
    production: {
      stage: -1,
      timestamps: [null, null, null, null, null, null, null, null],
      eta: "",
    },
    status: "draft",
    createdAt: now,
  };
  const { data, error } = await supabase()
    .from("team_orders")
    .insert(order)
    .select()
    .single();
  fail(error, "Failed to create team order");
  return data as TeamOrder;
}

export async function saveTeamOrder(order: TeamOrder): Promise<TeamOrder> {
  const { data, error } = await supabase()
    .from("team_orders")
    .update(order)
    .eq("id", order.id)
    .select()
    .maybeSingle();
  if (error) fail(error, "Failed to save team order");
  if (!data) throw new Error("Order not found");
  return data as TeamOrder;
}

export async function submitIntake(
  token: string,
  entry: Omit<RosterEntry, "id" | "submitted" | "submittedAt" | "source">
): Promise<{ order: TeamOrder; entry: RosterEntry; duplicate: boolean }> {
  const s = supabase();
  const { data, error } = await s
    .from("team_orders")
    .select("*")
    .eq("inviteToken", token)
    .maybeSingle();
  if (error) fail(error, "Failed to read team order");
  const order = data as TeamOrder | null;
  if (!order) throw new Error("Invite link not found.");
  if (new Date(order.inviteExpiry).getTime() <= Date.now())
    throw new Error("This invite link has expired.");
  const duplicate = order.roster.some(
    (r) =>
      r.submitted &&
      r.name.trim().toLowerCase() === entry.name.trim().toLowerCase()
  );
  const full: RosterEntry = {
    ...entry,
    id: crypto.randomUUID(),
    submitted: true,
    submittedAt: new Date().toISOString(),
    source: "invite",
  };
  order.roster = [...order.roster, full];
  if (
    order.status === "awaiting-submissions" &&
    order.roster.filter((r) => r.submitted).length >= order.headcount
  ) {
    order.status = "awaiting-approval";
  }
  await saveTeamOrder(order);
  return { order, entry: full, duplicate };
}

/* ---------------------------- individual orders ---------------------------- */

export async function getIndividualOrders(): Promise<IndividualOrder[]> {
  const { data } = await supabase()
    .from("individual_orders")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as IndividualOrder[];
}

export async function getIndividualOrderByCode(
  code: string
): Promise<IndividualOrder | undefined> {
  const { data } = await supabase()
    .from("individual_orders")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  return (data ?? undefined) as IndividualOrder | undefined;
}

export async function getIndividualOrdersByEmail(
  email: string
): Promise<IndividualOrder[]> {
  const { data } = await supabase()
    .from("individual_orders")
    .select("*")
    .eq("email", email.toLowerCase())
    .order("createdAt", { ascending: false });
  return (data ?? []) as IndividualOrder[];
}

export async function createIndividualOrder(
  input: Omit<IndividualOrder, "id" | "code" | "productId" | "createdAt">
): Promise<IndividualOrder> {
  const s = supabase();
  const year = new Date().getFullYear();
  const { count } = await s
    .from("individual_orders")
    .select("id", { count: "exact", head: true });
  const order: IndividualOrder = {
    ...input,
    email: input.email.toLowerCase(),
    id: crypto.randomUUID(),
    code: `ZND-${year}-${String((count ?? 0) + 1).padStart(3, "0")}-${crypto
      .randomBytes(2)
      .toString("hex")
      .toUpperCase()}`,
    productId: makeProductId("D"),
    createdAt: new Date().toISOString(),
  };
  const { data, error } = await s
    .from("individual_orders")
    .insert(order)
    .select()
    .single();
  fail(error, "Failed to create individual order");
  return data as IndividualOrder;
}

export async function saveIndividualOrder(
  order: IndividualOrder
): Promise<IndividualOrder> {
  const { data, error } = await supabase()
    .from("individual_orders")
    .update(order)
    .eq("id", order.id)
    .select()
    .maybeSingle();
  if (error) fail(error, "Failed to save individual order");
  if (!data) throw new Error("Order not found");
  return data as IndividualOrder;
}

/* ------------------------------- size profiles ----------------------------- */

export async function getSizeProfiles(): Promise<SizeProfile[]> {
  const { data } = await supabase().from("size_profiles").select("*");
  return (data ?? []) as SizeProfile[];
}

export async function getSizeProfile(
  identity: string
): Promise<SizeProfile | undefined> {
  const { data } = await supabase()
    .from("size_profiles")
    .select("*")
    .eq("identity", identity.toLowerCase())
    .maybeSingle();
  return (data ?? undefined) as SizeProfile | undefined;
}

export async function saveSizeProfile(
  input: Omit<SizeProfile, "id" | "updatedAt">
): Promise<SizeProfile> {
  const s = supabase();
  const identity = input.identity.toLowerCase();
  const { data: existing } = await s
    .from("size_profiles")
    .select("id")
    .eq("identity", identity)
    .maybeSingle();
  if (existing) {
    const { data, error } = await s
      .from("size_profiles")
      .update({ ...input, identity, updatedAt: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    fail(error, "Failed to save size profile");
    return data as SizeProfile;
  }
  const { data, error } = await s
    .from("size_profiles")
    .insert({
      ...input,
      identity,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();
  fail(error, "Failed to create size profile");
  return data as SizeProfile;
}

/* --------------------------------- discovery ------------------------------- */

export async function getDiscoverySessions(): Promise<DiscoverySession[]> {
  const { data } = await supabase()
    .from("discovery_sessions")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as DiscoverySession[];
}

export async function getDiscoverySession(
  id: string
): Promise<DiscoverySession | undefined> {
  const { data } = await supabase()
    .from("discovery_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? undefined) as DiscoverySession | undefined;
}

export async function createDiscoverySession(
  input: Partial<DiscoverySession> & { mode: DiscoverySession["mode"] }
): Promise<DiscoverySession> {
  const session: DiscoverySession = {
    id: crypto.randomUUID().slice(0, 8),
    mode: input.mode,
    name: input.name,
    contact: input.contact,
    ambassador: input.ambassador,
    orderCode: input.orderCode,
    answers: [],
    currentSection: 1,
    completed: false,
    points: 0,
    createdAt: new Date().toISOString(),
  };
  const { data, error } = await supabase()
    .from("discovery_sessions")
    .insert(session)
    .select()
    .single();
  fail(error, "Failed to create discovery session");
  return data as DiscoverySession;
}

export async function saveDiscoverySession(
  session: DiscoverySession
): Promise<DiscoverySession> {
  const { data, error } = await supabase()
    .from("discovery_sessions")
    .update(session)
    .eq("id", session.id)
    .select()
    .maybeSingle();
  if (error) fail(error, "Failed to save discovery session");
  if (!data) throw new Error("Session not found");
  return data as DiscoverySession;
}

/* --------------------------------- feedback -------------------------------- */

export async function getFeedback(): Promise<Feedback[]> {
  const { data } = await supabase()
    .from("feedback")
    .select("*")
    .order("createdAt", { ascending: false });
  return (data ?? []) as Feedback[];
}

export async function createFeedback(
  input: Omit<Feedback, "id" | "createdAt">
): Promise<Feedback> {
  const { data, error } = await supabase()
    .from("feedback")
    .insert({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();
  fail(error, "Failed to create feedback");
  return data as Feedback;
}

/* ---------------------------------- events --------------------------------- */

export async function logEvent(
  name: string,
  props?: Record<string, string | number | boolean>
): Promise<void> {
  const { error } = await supabase()
    .from("events")
    .insert({
      id: crypto.randomUUID(),
      name,
      props,
      at: new Date().toISOString(),
    });
  // best-effort telemetry — never let an analytics write break a request
  if (error) console.error("[supabase] logEvent failed", error.message);
}
