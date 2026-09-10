import { NextRequest } from "next/server";
import { getOrders } from "@/lib/db";
import { requireAdmin, json } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let orders = await getOrders();
  if (status && status !== "all") orders = orders.filter((o) => o.status === status);
  return json({ orders });
}
