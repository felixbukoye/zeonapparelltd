import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
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

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, file),
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

function uid(prefix = ""): string {
  return prefix + crypto.randomUUID().slice(0, 8).toUpperCase();
}

/* ---------------------------------- seeds --------------------------------- */

const ADMIN_EMAIL = "admin@zeonapparel.com";
const ADMIN_PASSWORD = "ZeonAdmin123!";

async function ensureSeeded() {
  const users = await readJson<User[]>("users.json", []);
  if (!users.some((u) => u.email.toLowerCase() === ADMIN_EMAIL)) {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto
      .createHash("sha256")
      .update(salt + ADMIN_PASSWORD)
      .digest("hex");
    users.push({
      id: crypto.randomUUID(),
      name: "Zeon Store Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      salt,
      role: "admin",
      phone: "+234 801 234 5678",
      address: "14 Ogudu Road, Ikeja",
      city: "Lagos",
      createdAt: new Date().toISOString(),
    });
    await writeJson("users.json", users);
  }
}

/* --------------------------------- products -------------------------------- */

export async function getProducts(): Promise<Product[]> {
  return readJson<Product[]>("products.json", []);
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function saveProduct(
  input: Omit<Product, "id" | "createdAt" | "rating" | "reviewCount"> & {
    id?: string;
  }
): Promise<Product> {
  const products = await getProducts();
  if (input.id) {
    const idx = products.findIndex((p) => p.id === input.id);
    if (idx === -1) throw new Error("Product not found");
    products[idx] = {
      ...products[idx],
      ...input,
      id: products[idx].id,
      createdAt: products[idx].createdAt,
    };
    await writeJson("products.json", products);
    return products[idx];
  }
  const product: Product = {
    ...input,
    id: crypto.randomUUID(),
    rating: 5,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };
  products.unshift(product);
  await writeJson("products.json", products);
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts();
  await writeJson(
    "products.json",
    products.filter((p) => p.id !== id)
  );
}

/* ---------------------------------- users ---------------------------------- */

export async function getUsers(): Promise<User[]> {
  await ensureSeeded();
  return readJson<User[]>("users.json", []);
}

export async function getUserByEmail(
  email: string
): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  orgName?: string;
  orgType?: string;
}): Promise<User> {
  const users = await getUsers();
  if (
    users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())
  ) {
    throw new Error("An account with this email already exists.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .createHash("sha256")
    .update(salt + input.password)
    .digest("hex");
  const user: User = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash,
    salt,
    role: "coordinator",
    phone: input.phone,
    orgName: input.orgName,
    orgType: input.orgType,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeJson("users.json", users);
  return user;
}

export async function updateUser(
  id: string,
  patch: Partial<
    Pick<User, "name" | "phone" | "address" | "city" | "orgName" | "orgType">
  >
): Promise<User> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found");
  users[idx] = { ...users[idx], ...patch };
  await writeJson("users.json", users);
  return users[idx];
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
  return readJson<Order[]>("orders.json", []);
}

export async function getOrderByCode(
  code: string
): Promise<Order | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.code.toLowerCase() === code.toLowerCase());
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const orders = await getOrders();
  return orders
    .filter((o) => o.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function nextOrderCode(existing: Order[]): string {
  const year = new Date().getFullYear();
  const seq = String(existing.length + 1).padStart(4, "0");
  return `ZN-${year}-${seq}-${uid()}`;
}

export async function createOrder(
  input: Omit<Order, "id" | "code" | "status" | "timeline" | "createdAt">
): Promise<Order> {
  const orders = await getOrders();
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: crypto.randomUUID(),
    code: nextOrderCode(orders),
    status: "pending",
    timeline: [{ status: "Order placed", at: now }],
    createdAt: now,
  };
  orders.unshift(order);
  await writeJson("orders.json", orders);

  // decrement stock
  const products = await getProducts();
  let changed = false;
  for (const item of order.items) {
    const p = products.find((x) => x.id === item.productId);
    if (p) {
      p.stock = Math.max(0, p.stock - item.qty);
      changed = true;
    }
  }
  if (changed) await writeJson("products.json", products);

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  note?: string
): Promise<Order> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");
  orders[idx].status = status;
  orders[idx].timeline.push({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    at: new Date().toISOString(),
    note,
  });
  await writeJson("orders.json", orders);
  return orders[idx];
}

/* --------------------------------- reviews --------------------------------- */

export async function getReviews(): Promise<Review[]> {
  return readJson<Review[]>("reviews.json", []);
}

export async function getApprovedReviewsForProduct(
  productId: string
): Promise<Review[]> {
  const reviews = await getReviews();
  return reviews
    .filter((r) => r.productId === productId && r.status === "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createReview(input: {
  productId: string;
  name: string;
  rating: number;
  title?: string;
  body: string;
}): Promise<Review> {
  const reviews = await getReviews();
  const review: Review = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(review);
  await writeJson("reviews.json", reviews);
  await refreshProductRating(input.productId);
  return review;
}

export async function moderateReview(
  id: string,
  action: "approve" | "delete"
): Promise<void> {
  const reviews = await getReviews();
  const review = reviews.find((r) => r.id === id);
  if (!review) throw new Error("Review not found");
  if (action === "delete") {
    await writeJson(
      "reviews.json",
      reviews.filter((r) => r.id !== id)
    );
  } else {
    review.status = "approved";
    await writeJson("reviews.json", reviews);
  }
  await refreshProductRating(review.productId);
}

async function refreshProductRating(productId: string) {
  const reviews = await getReviews();
  const approved = reviews.filter(
    (r) => r.productId === productId && r.status === "approved"
  );
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return;
  if (approved.length === 0) {
    products[idx].reviewCount = 0;
  } else {
    products[idx].reviewCount = approved.length;
    products[idx].rating =
      Math.round(
        (approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10
      ) / 10;
  }
  await writeJson("products.json", products);
}

/* --------------------------------- enquiries -------------------------------- */

export async function getEnquiries(): Promise<Enquiry[]> {
  return readJson<Enquiry[]>("enquiries.json", []);
}

export async function createEnquiry(
  input: Omit<Enquiry, "id" | "status" | "createdAt">
): Promise<Enquiry> {
  const enquiries = await getEnquiries();
  const enquiry: Enquiry = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  enquiries.unshift(enquiry);
  await writeJson("enquiries.json", enquiries);
  return enquiry;
}

export async function updateEnquiryStatus(
  id: string,
  status: Enquiry["status"]
): Promise<Enquiry> {
  const enquiries = await getEnquiries();
  const idx = enquiries.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error("Enquiry not found");
  enquiries[idx].status = status;
  await writeJson("enquiries.json", enquiries);
  return enquiries[idx];
}

/* -------------------------------- collections ------------------------------ */

export async function getCollections(): Promise<Collection[]> {
  return readJson<Collection[]>("collections.json", []);
}

export async function getCollectionsByCoordinator(
  coordinatorId: string
): Promise<Collection[]> {
  const all = await getCollections();
  return all
    .filter((c) => c.coordinatorId === coordinatorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCollectionById(
  id: string
): Promise<Collection | undefined> {
  const all = await getCollections();
  return all.find((c) => c.id === id);
}

export async function saveCollection(
  input: Omit<Collection, "id" | "createdAt" | "version" | "history"> & {
    id?: string;
    note?: string;
  }
): Promise<Collection> {
  const all = await getCollections();
  if (input.id) {
    const idx = all.findIndex((c) => c.id === input.id);
    if (idx === -1) throw new Error("Collection not found");
    const current = all[idx];
    const bumped =
      input.status === "for-production" && current.status !== "for-production";
    const version = bumped ? current.version + 1 : current.version;
    all[idx] = {
      ...current,
      ...input,
      id: current.id,
      createdAt: current.createdAt,
      version,
      history: bumped
        ? [
            ...current.history,
            {
              version,
              at: new Date().toISOString(),
              note: input.note || "Marked as For Production",
            },
          ]
        : current.history,
    };
    await writeJson("collections.json", all);
    return all[idx];
  }
  const now = new Date().toISOString();
  const collection: Collection = {
    ...input,
    id: crypto.randomUUID(),
    version: 1,
    history: [{ version: 1, at: now, note: "Collection created" }],
    createdAt: now,
  };
  all.unshift(collection);
  await writeJson("collections.json", all);
  return collection;
}

export async function deleteCollection(id: string): Promise<void> {
  const all = await getCollections();
  await writeJson(
    "collections.json",
    all.filter((c) => c.id !== id)
  );
}

/* -------------------------------- team orders ------------------------------ */

export async function getTeamOrders(): Promise<TeamOrder[]> {
  return readJson<TeamOrder[]>("team-orders.json", []);
}

export async function getTeamOrdersByCoordinator(
  coordinatorId: string
): Promise<TeamOrder[]> {
  const all = await getTeamOrders();
  return all
    .filter((o) => o.coordinatorId === coordinatorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTeamOrderById(
  id: string
): Promise<TeamOrder | undefined> {
  const all = await getTeamOrders();
  return all.find((o) => o.id === id);
}

export async function getTeamOrderByInviteToken(
  token: string
): Promise<TeamOrder | undefined> {
  const all = await getTeamOrders();
  return all.find((o) => o.inviteToken === token);
}

export async function getTeamOrderByCode(
  code: string
): Promise<TeamOrder | undefined> {
  const all = await getTeamOrders();
  return all.find((o) => o.code.toLowerCase() === code.toLowerCase());
}

function nextTeamCode(existing: TeamOrder[]): string {
  const year = new Date().getFullYear();
  return `ZNT-${year}-${String(existing.length + 1).padStart(3, "0")}`;
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
  const all = await getTeamOrders();
  const now = new Date().toISOString();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (input.inviteDays ?? 14));
  const order: TeamOrder = {
    id: crypto.randomUUID(),
    code: nextTeamCode(all),
    productIds: [],
    collectionId: input.collectionId,
    coordinatorId: input.coordinatorId,
    orgName: input.orgName,
    headcount: input.headcount,
    departments: input.departments,
    type: input.type,
    inviteToken: makeInviteToken(),
    inviteExpiry: expiry.toISOString(),
    roster: input.roster ?? [],
    quote: {
      perSet: input.perSet ?? 32000,
      sets: input.headcount,
      subtotal: (input.perSet ?? 32000) * input.headcount,
      discount: 0,
      total: (input.perSet ?? 32000) * input.headcount,
      depositDue: 0,
      balance: 0,
      status: "pending",
    },
    depositPaid: false,
    balancePaid: false,
    embroidery: input.embroidery,
    production: {
      stage: -1,
      timestamps: [null, null, null, null, null, null, null, null],
      eta: "",
    },
    status: "draft",
    createdAt: now,
  };
  all.unshift(order);
  await writeJson("team-orders.json", all);
  return order;
}

export async function saveTeamOrder(order: TeamOrder): Promise<TeamOrder> {
  const all = await getTeamOrders();
  const idx = all.findIndex((o) => o.id === order.id);
  if (idx === -1) throw new Error("Order not found");
  all[idx] = order;
  await writeJson("team-orders.json", all);
  return order;
}

export async function submitIntake(
  token: string,
  entry: Omit<RosterEntry, "id" | "submitted" | "submittedAt" | "source">
): Promise<{ order: TeamOrder; entry: RosterEntry; duplicate: boolean }> {
  const order = await getTeamOrderByInviteToken(token);
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
  order.roster.push(full);
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
  return readJson<IndividualOrder[]>("individual-orders.json", []);
}

export async function getIndividualOrderByCode(
  code: string
): Promise<IndividualOrder | undefined> {
  const all = await getIndividualOrders();
  return all.find((o) => o.code.toLowerCase() === code.toLowerCase());
}

export async function getIndividualOrdersByEmail(
  email: string
): Promise<IndividualOrder[]> {
  const all = await getIndividualOrders();
  return all
    .filter((o) => o.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createIndividualOrder(
  input: Omit<IndividualOrder, "id" | "code" | "productId" | "createdAt">
): Promise<IndividualOrder> {
  const all = await getIndividualOrders();
  const year = new Date().getFullYear();
  const order: IndividualOrder = {
    ...input,
    id: crypto.randomUUID(),
    code: `ZND-${year}-${String(all.length + 1).padStart(3, "0")}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
    productId: makeProductId("D"),
    createdAt: new Date().toISOString(),
  };
  all.unshift(order);
  await writeJson("individual-orders.json", all);
  return order;
}

export async function saveIndividualOrder(
  order: IndividualOrder
): Promise<IndividualOrder> {
  const all = await getIndividualOrders();
  const idx = all.findIndex((o) => o.id === order.id);
  if (idx === -1) throw new Error("Order not found");
  all[idx] = order;
  await writeJson("individual-orders.json", all);
  return order;
}

/* ------------------------------- size profiles ----------------------------- */

export async function getSizeProfiles(): Promise<SizeProfile[]> {
  return readJson<SizeProfile[]>("size-profiles.json", []);
}

export async function getSizeProfile(
  identity: string
): Promise<SizeProfile | undefined> {
  const all = await getSizeProfiles();
  return all.find((p) => p.identity.toLowerCase() === identity.toLowerCase());
}

export async function saveSizeProfile(
  input: Omit<SizeProfile, "id" | "updatedAt">
): Promise<SizeProfile> {
  const all = await getSizeProfiles();
  const idx = all.findIndex(
    (p) => p.identity.toLowerCase() === input.identity.toLowerCase()
  );
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...input, updatedAt: new Date().toISOString() };
    await writeJson("size-profiles.json", all);
    return all[idx];
  }
  const profile: SizeProfile = {
    ...input,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
  all.push(profile);
  await writeJson("size-profiles.json", all);
  return profile;
}

/* --------------------------------- discovery ------------------------------- */

export async function getDiscoverySessions(): Promise<DiscoverySession[]> {
  return readJson<DiscoverySession[]>("discovery.json", []);
}

export async function getDiscoverySession(
  id: string
): Promise<DiscoverySession | undefined> {
  const all = await getDiscoverySessions();
  return all.find((s) => s.id === id);
}

export async function createDiscoverySession(
  input: Partial<DiscoverySession> & { mode: DiscoverySession["mode"] }
): Promise<DiscoverySession> {
  const all = await getDiscoverySessions();
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
  all.unshift(session);
  await writeJson("discovery.json", all);
  return session;
}

export async function saveDiscoverySession(
  session: DiscoverySession
): Promise<DiscoverySession> {
  const all = await getDiscoverySessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx === -1) throw new Error("Session not found");
  all[idx] = session;
  await writeJson("discovery.json", all);
  return session;
}

/* --------------------------------- feedback -------------------------------- */

export async function getFeedback(): Promise<Feedback[]> {
  return readJson<Feedback[]>("feedback.json", []);
}

export async function createFeedback(
  input: Omit<Feedback, "id" | "createdAt">
): Promise<Feedback> {
  const all = await getFeedback();
  const fb: Feedback = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.unshift(fb);
  await writeJson("feedback.json", all);
  return fb;
}

/* ---------------------------------- events --------------------------------- */

export async function logEvent(
  name: string,
  props?: Record<string, string | number | boolean>
): Promise<void> {
  const all = await readJson<AppEvent[]>("events.json", []);
  all.push({ id: crypto.randomUUID(), name, props, at: new Date().toISOString() });
  await writeJson("events.json", all.slice(-2000));
}
