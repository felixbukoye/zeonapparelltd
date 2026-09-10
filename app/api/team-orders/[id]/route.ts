import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  getTeamOrderById,
  logEvent,
  makeInviteToken,
  makeProductId,
  saveTeamOrder,
} from "@/lib/db";
import { sessionFromRequest, json, badRequest } from "@/lib/api-helpers";
import { advanceProduction, newProductionState, quoteForSets } from "@/lib/pricing";

async function owner(req: NextRequest, id: string) {
  const user = await sessionFromRequest(req);
  if (!user || (user.role !== "coordinator" && user.role !== "admin")) return null;
  const order = await getTeamOrderById(id);
  if (!order) return null;
  if (user.role !== "admin" && order.coordinatorId !== user.id) return null;
  return order;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await owner(req, id);
  if (!order) return json({ error: "Order not found." }, 404);
  return json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await owner(req, id);
  if (!order) return json({ error: "Order not found." }, 404);
  try {
    const body = await req.json();
    const action = body.action as string;

    switch (action) {
      case "issue-quote": {
        const q = quoteForSets(order.headcount, order.quote.perSet);
        order.quote = { ...q, status: "ready", issuedAt: new Date().toISOString() };
        order.status = "quote";
        await logEvent("quote_viewed", { orderId: order.id, total: q.total });
        break;
      }
      case "accept-quote": {
        if (order.quote.status !== "ready") return badRequest("No ready quote to accept.");
        order.quote.status = "accepted";
        order.status = "awaiting-deposit";
        break;
      }
      case "pay-deposit": {
        if (order.quote.status !== "accepted")
          return badRequest("Accept your quote first.");
        order.depositPaid = true;
        order.depositAt = new Date().toISOString();
        order.productIds = Array.from({ length: order.headcount }, () =>
          makeProductId("T")
        );
        if (order.quote.balance === 0) order.balancePaid = true;
        order.status = "awaiting-submissions";
        await logEvent("deposit_paid", { orderId: order.id, amount: order.quote.depositDue });
        await logEvent("order_confirmed", { orderId: order.id, kind: "team" });
        break;
      }
      case "save-embroidery": {
        const e = body.embroidery ?? {};
        order.embroidery = {
          placement: e.placement || order.embroidery.placement,
          font: e.font === "script" ? "script" : "block",
          thread: e.thread === "black" ? "black" : "white",
          logoName: e.logoName ?? order.embroidery.logoName,
          digitization: e.logoName
            ? order.embroidery.digitization === "digitized"
              ? "digitized"
              : "pending"
            : order.embroidery.digitization,
          mockupApproved: false,
        };
        break;
      }
      case "mark-digitized": {
        order.embroidery.digitization = "digitized";
        break;
      }
      case "approve-mockup": {
        const submitted = order.roster.filter((r) => r.submitted).length;
        if (submitted < order.headcount)
          return badRequest(
            `You're missing ${order.headcount - submitted} response(s) — production planning needs everyone in.`
          );
        if (order.embroidery.logoName && order.embroidery.digitization !== "digitized")
          return badRequest("Your logo is still being digitized — approval unlocks once it's ready.");
        order.embroidery.mockupApproved = true;
        order.embroidery.mockupApprovedAt = new Date().toISOString();
        order.production = newProductionState(3);
        order.status = "in-production";
        break;
      }
      case "advance-stage": {
        if (["dispatched", "delivered", "complete"].includes(order.status))
          return badRequest("This order has already been dispatched.");
        if (order.status !== "in-production" && order.status !== "awaiting-balance")
          return badRequest("Production hasn't started yet.");
        const next = order.production.stage + 1;
        if (next >= 7) {
          if (order.quote.balance > 0 && !order.balancePaid)
            return badRequest("Balance must be paid before we can dispatch.");
          order.production = advanceProduction(order.production);
          order.status = "dispatched";
          order.trackingCode = `GIG-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        } else {
          order.production = advanceProduction(order.production, {
            slipWeeks: body.slipWeeks ? Number(body.slipWeeks) : undefined,
          });
        }
        break;
      }
      case "pay-balance": {
        order.balancePaid = true;
        order.balanceAt = new Date().toISOString();
        if (order.status === "awaiting-balance") order.status = "in-production";
        break;
      }
      case "add-roster": {
        const entries = Array.isArray(body.entries) ? body.entries : [];
        for (const e of entries) {
          if (!e.name?.trim()) continue;
          order.roster.push({
            id: crypto.randomUUID(),
            name: String(e.name).trim().slice(0, 80),
            department: e.department,
            phone: e.phone?.trim() || undefined,
            sizeMode: e.size ? "preset" : undefined,
            size: e.size,
            fit: e.fit === "relaxed" ? "relaxed" : "fitted",
            submitted: true,
            submittedAt: new Date().toISOString(),
            source: "manual",
          });
        }
        break;
      }
      case "remove-roster": {
        order.roster = order.roster.filter((r) => r.id !== body.entryId);
        break;
      }
      case "refresh-invite": {
        order.inviteToken = makeInviteToken();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 14);
        order.inviteExpiry = expiry.toISOString();
        break;
      }
      case "mark-delivered": {
        if (order.status !== "dispatched") return badRequest("Order isn't dispatched yet.");
        order.status = "delivered";
        break;
      }
      case "complete": {
        order.status = "complete";
        break;
      }
      case "update-details": {
        if (["in-production", "dispatched", "delivered", "complete"].includes(order.status))
          return badRequest("Details can't change once production starts.");
        if (body.headcount) order.headcount = Math.max(1, Math.min(2000, Number(body.headcount)));
        if (Array.isArray(body.departments)) order.departments = body.departments;
        if (body.type === "team" || body.type === "self") order.type = body.type;
        if (body.orgName?.trim()) order.orgName = body.orgName.trim();
        order.quote.sets = order.headcount;
        order.quote.status = "pending";
        order.status = "draft";
        break;
      }
      default:
        return badRequest("Unknown action.");
    }

    await saveTeamOrder(order);
    return json({ order });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not update order.");
  }
}
