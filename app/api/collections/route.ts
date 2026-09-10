import { NextRequest } from "next/server";
import { getCollectionsByCoordinator, getProducts, saveCollection } from "@/lib/db";
import { sessionFromRequest, json, badRequest } from "@/lib/api-helpers";

async function coordinator(req: NextRequest) {
  const user = await sessionFromRequest(req);
  if (!user || (user.role !== "coordinator" && user.role !== "admin")) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await coordinator(req);
  if (!user) return json({ error: "Please sign in as a coordinator." }, 401);
  const collections = await getCollectionsByCoordinator(user.id);
  return json({ collections });
}

export async function POST(req: NextRequest) {
  const user = await coordinator(req);
  if (!user) return json({ error: "Please sign in as a coordinator." }, 401);
  try {
    const body = await req.json();
    if (!body.name?.trim()) return badRequest("Give your collection a name.");
    const products = await getProducts();
    const styles = Array.isArray(body.styles) ? body.styles : [];
    for (const s of styles) {
      if (!products.some((p) => p.id === s.productId))
        return badRequest("One selected style is no longer available.");
    }
    const collection = await saveCollection({
      coordinatorId: user.id,
      name: body.name.trim().slice(0, 80),
      mode: body.mode === "full" ? "full" : "custom",
      genders: Array.isArray(body.genders) ? body.genders : ["Women", "Men", "Unisex"],
      categories: Array.isArray(body.categories) ? body.categories : [],
      styles,
      approvedColours: Array.isArray(body.approvedColours) ? body.approvedColours : [],
      embroideryRules: Array.isArray(body.embroideryRules) ? body.embroideryRules : [],
      status: "draft",
    });
    return json({ collection }, 201);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not save collection.");
  }
}
