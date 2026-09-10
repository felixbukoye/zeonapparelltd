import { NextRequest } from "next/server";
import { updateOrderStatus } from "@/lib/db";
import { requireAdmin, json, badRequest } from "@/lib/api-helpers";

const VALID = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  try {
    const { id } = await params;
    const { status, note } = await req.json();
    if (!VALID.includes(status)) return badRequest("Invalid status.");
    const order = await updateOrderStatus(id, status, note?.trim());
    return json({ order });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not update order.");
  }
}
