import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Enquiry, Order, Product, Review, User } from "./types";

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
    role: "customer",
    phone: input.phone,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeJson("users.json", users);
  return user;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "phone" | "address" | "city">>
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
