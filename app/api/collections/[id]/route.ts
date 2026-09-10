import { NextRequest } from "next/server";
import {
  deleteCollection,
  getCollectionById,
  getProducts,
  saveCollection,
} from "@/lib/db";
import { sessionFromRequest, json, badRequest } from "@/lib/api-helpers";

async function owner(req: NextRequest, id: string) {
  const user = await sessionFromRequest(req);
  if (!user || (user.role !== "coordinator" && user.role !== "admin")) return null;
  const collection = await getCollectionById(id);
  if (!collection) return null;
  if (user.role !== "admin" && collection.coordinatorId !== user.id) return null;
  return collection;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const collection = await owner(req, id);
  if (!collection) return json({ error: "Collection not found." }, 404);
  return json({ collection });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const current = await owner(req, id);
  if (!current) return json({ error: "Collection not found." }, 404);
  try {
    const body = await req.json();
    const products = await getProducts();
    const styles = Array.isArray(body.styles) ? body.styles : current.styles;
    for (const s of styles) {
      if (!products.some((p) => p.id === s.productId))
        return badRequest("One selected style is no longer available.");
    }
    const collection = await saveCollection({
      id,
      coordinatorId: current.coordinatorId,
      name: body.name?.trim() || current.name,
      mode: body.mode ?? current.mode,
      genders: Array.isArray(body.genders) ? body.genders : current.genders,
      categories: Array.isArray(body.categories) ? body.categories : current.categories,
      styles,
      approvedColours: Array.isArray(body.approvedColours)
        ? body.approvedColours
        : current.approvedColours,
      embroideryRules: Array.isArray(body.embroideryRules)
        ? body.embroideryRules
        : current.embroideryRules,
      status: body.status === "for-production" ? "for-production" : current.status,
      note: body.note,
    });
    return json({ collection });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not update collection.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const current = await owner(req, id);
  if (!current) return json({ error: "Collection not found." }, 404);
  await deleteCollection(id);
  return json({ ok: true });
}
