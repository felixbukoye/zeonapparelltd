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

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: "customer" | "admin";
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export type SafeUser = Omit<User, "passwordHash" | "salt">;

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
