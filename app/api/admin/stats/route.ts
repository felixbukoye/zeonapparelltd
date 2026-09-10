import { NextRequest } from "next/server";
import { getOrders, getProducts, getEnquiries, getReviews } from "@/lib/db";
import { requireAdmin, json } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;

  const [orders, products, enquiries, reviews] = await Promise.all([
    getOrders(),
    getProducts(),
    getEnquiries(),
    getReviews(),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const byStatus: Record<string, number> = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

  return json({
    revenue,
    orderCount: orders.length,
    productCount: products.length,
    lowStock: products.filter((p) => p.stock <= 20).length,
    newEnquiries: enquiries.filter((e) => e.status === "new").length,
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    byStatus,
    recentOrders: orders.slice(0, 6),
  });
}
