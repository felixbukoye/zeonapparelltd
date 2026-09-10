import { NextRequest } from "next/server";
import {
  createIndividualOrder,
  getProductById,
  logEvent,
  saveSizeProfile,
} from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";
import { DELIVERY_ZONES, FREE_DELIVERY_THRESHOLD } from "@/lib/format";
import { newProductionState, quoteForSets } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = body.styleId ? await getProductById(body.styleId) : null;
    if (!product) return badRequest("Choose a style to continue.");
    if (!body.colour || !product.colors.includes(body.colour))
      return badRequest("Choose a colour for your set.");
    if (!body.careerStage) return badRequest("Select your career stage.");
    if (!body.sizeMode) return badRequest("Choose how you'd like to size your order.");
    if (body.sizeMode === "preset" && !body.size)
      return badRequest("Pick your size — or switch to manual measurements.");
    const sets = Math.max(1, Math.min(4, Number(body.sets) || 1));
    if (!body.name?.trim() || !body.email?.trim() || !body.phone?.trim() || !body.address?.trim() || !body.city?.trim())
      return badRequest("Please fill in your contact and delivery details.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email))
      return badRequest("Please enter a valid email address.");

    const q = quoteForSets(sets, product.price);
    const zone = DELIVERY_ZONES.find((z) => z.id === body.zone) ?? DELIVERY_ZONES[0];
    const delivery = q.total >= FREE_DELIVERY_THRESHOLD ? 0 : zone.fee;

    let sizeProfileId: string | undefined;
    try {
      const profile = await saveSizeProfile({
        identity: body.email.trim(),
        name: body.name.trim(),
        sizeMode: body.sizeMode,
        size: body.size,
        fit: body.fit === "relaxed" ? "relaxed" : "fitted",
        measurements: body.measurements,
        helper: body.helper,
      });
      sizeProfileId = profile.id;
    } catch {
      /* non-blocking */
    }

    const order = await createIndividualOrder({
      styleId: product.id,
      styleName: product.name,
      image: product.images[0],
      colour: body.colour,
      gender: body.gender || "Unisex",
      careerStage: body.careerStage,
      sizeMode: body.sizeMode,
      size: body.size,
      fit: body.fit === "relaxed" ? "relaxed" : "fitted",
      measurements: body.measurements,
      sets,
      embroidery: body.embroideryText?.trim()
        ? {
            text: String(body.embroideryText).slice(0, 60),
            placement: body.embroideryPlacement || "left-chest",
            font: body.embroideryFont || "block",
            thread: body.embroideryThread || "white",
          }
        : undefined,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      city: body.city.trim(),
      zone: zone.label,
      subtotal: q.total,
      delivery,
      total: q.total + delivery,
      paymentMethod: body.paymentMethod || "card",
      paidAt: new Date().toISOString(),
      production: newProductionState(3),
      status: "confirmed",
      sizeProfileId,
    });

    await logEvent("order_confirmed", {
      orderId: order.id,
      kind: "individual",
      total: order.total,
    });
    return json({ order }, 201);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not place order.");
  }
}
