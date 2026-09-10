import { NextRequest } from "next/server";
import {
  getCollectionById,
  getProducts,
  getTeamOrderByInviteToken,
  logEvent,
  saveSizeProfile,
  submitIntake,
} from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const order = await getTeamOrderByInviteToken(token);
  if (!order) return json({ error: "Invite link not found." }, 404);
  if (new Date(order.inviteExpiry).getTime() <= Date.now())
    return json(
      {
        error: "expired",
        orgName: order.orgName,
        message:
          "This invite link has expired — please request a new one from your coordinator.",
      },
      410
    );
  const collection = await getCollectionById(order.collectionId);
  const products = await getProducts();
  const styles = (collection?.styles ?? []).map((s) => {
    const p = products.find((x) => x.id === s.productId);
    return {
      productId: s.productId,
      name: p?.name ?? "ZEON style",
      image: p?.images[0] ?? "/images/fabric-detail.jpg",
      colours: s.colours,
    };
  });
  const textEnabled =
    !collection ||
    collection.embroideryRules.length === 0 ||
    collection.embroideryRules.some((r) => r.mode === "text" || r.mode === "logo-text");
  return json({
    orgName: order.orgName,
    orderCode: order.code,
    headcount: order.headcount,
    submitted: order.roster.filter((r) => r.submitted).length,
    expiresAt: order.inviteExpiry,
    collectionName: collection?.name ?? "Team collection",
    styles,
    embroidery: {
      textEnabled,
      placement: order.embroidery.placement,
      font: order.embroidery.font,
      thread: order.embroidery.thread,
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const body = await req.json();
    if (!body.name?.trim()) return badRequest("Tell us your name so we can label your package.");
    if (!body.careerStage) return badRequest("Select your career stage.");
    if (!body.sizeMode) return badRequest("Choose how you'd like to size your order.");
    if (body.sizeMode === "preset" && !body.size)
      return badRequest("Pick your size — or switch to manual measurements.");
    const { entry, duplicate } = await submitIntake(token, {
      name: body.name.trim().slice(0, 80),
      department: body.department,
      ageBand: body.ageBand,
      gender: body.gender,
      careerStage: body.careerStage,
      conhess: body.conhess,
      state: body.state,
      phone: body.phone?.trim(),
      sizeMode: body.sizeMode,
      size: body.size,
      fit: body.fit === "relaxed" ? "relaxed" : "fitted",
      measurements: body.measurements,
      embroideryText: body.embroideryText?.slice(0, 80),
    });
    if (body.phone?.trim()) {
      await saveSizeProfile({
        identity: body.phone.trim(),
        name: body.name.trim().slice(0, 80),
        sizeMode: body.sizeMode,
        size: body.size,
        fit: body.fit === "relaxed" ? "relaxed" : "fitted",
        measurements: body.measurements,
      }).catch(() => undefined);
    }
    await logEvent("intake_flow_completed", { orderCode: entry.id });
    return json(
      {
        entry,
        duplicate,
        message: duplicate
          ? "Looks like this name is already on the list — we've saved your submission anyway. Your coordinator will confirm."
          : "Thank you! Your details are in — we'll take it from here.",
      },
      201
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not submit.";
    if (msg.includes("expired")) return json({ error: "expired", message: msg }, 410);
    return badRequest(msg);
  }
}
