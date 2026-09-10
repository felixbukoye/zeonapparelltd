import { NextRequest } from "next/server";
import {
  createTeamOrder,
  getCollectionById,
  getProducts,
  getTeamOrdersByCoordinator,
  logEvent,
} from "@/lib/db";
import { sessionFromRequest, json, badRequest } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await sessionFromRequest(req);
  if (!user || (user.role !== "coordinator" && user.role !== "admin"))
    return json({ error: "Please sign in as a coordinator." }, 401);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let orders = await getTeamOrdersByCoordinator(user.id);
  if (status === "active")
    orders = orders.filter((o) =>
      ["awaiting-deposit", "awaiting-submissions", "awaiting-approval", "in-production", "awaiting-balance"].includes(o.status)
    );
  else if (status === "awaiting")
    orders = orders.filter((o) =>
      ["draft", "quote", "awaiting-deposit", "awaiting-approval", "awaiting-balance"].includes(o.status)
    );
  else if (status === "complete")
    orders = orders.filter((o) => ["dispatched", "delivered", "complete"].includes(o.status));
  return json({ orders });
}

export async function POST(req: NextRequest) {
  const user = await sessionFromRequest(req);
  if (!user || (user.role !== "coordinator" && user.role !== "admin"))
    return json({ error: "Please sign in as a coordinator." }, 401);
  try {
    const body = await req.json();
    const collection = body.collectionId
      ? await getCollectionById(body.collectionId)
      : null;
    if (!collection) return badRequest("Choose a collection for this order.");
    if (user.role !== "admin" && collection.coordinatorId !== user.id)
      return badRequest("That collection isn't yours.");
    const headcount = Math.max(1, Math.min(2000, Number(body.headcount) || 0));
    if (!headcount) return badRequest("Tell us your headcount.");

    const products = await getProducts();
    const prices = collection.styles
      .map((s) => products.find((p) => p.id === s.productId)?.price ?? 0)
      .filter((n) => n > 0);
    const perSet = prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 32000;

    const order = await createTeamOrder({
      collectionId: collection.id,
      coordinatorId: user.id,
      orgName: body.orgName?.trim() || user.orgName || "Your organisation",
      headcount,
      departments: Array.isArray(body.departments) ? body.departments : [],
      type: body.type === "self" ? "self" : "team",
      embroidery: {
        placement: "left-chest",
        font: "block",
        thread: "white",
        digitization: "none",
        mockupApproved: false,
      },
      perSet,
    });
    await logEvent("team_order_created", { orderId: order.id, headcount });
    return json({ order }, 201);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not create order.");
  }
}
