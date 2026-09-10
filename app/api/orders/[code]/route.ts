import { NextRequest } from "next/server";
import { getOrderByCode } from "@/lib/db";
import { sessionFromRequest, json } from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const order = await getOrderByCode(decodeURIComponent(code));
  if (!order) return json({ error: "Order not found." }, 404);

  // Guests must supply the order email; signed-in owners & admins pass freely.
  const user = await sessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();
  const isOwner =
    user && (user.role === "admin" || user.email.toLowerCase() === order.email.toLowerCase());

  if (!isOwner && email !== order.email.toLowerCase()) {
    return json({ error: "Email does not match this order.", gated: true }, 403);
  }
  return json({ order });
}
