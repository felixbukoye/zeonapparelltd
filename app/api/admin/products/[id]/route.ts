import { NextRequest } from "next/server";
import { deleteProduct, getProductById, saveProduct } from "@/lib/db";
import { requireAdmin, json, badRequest } from "@/lib/api-helpers";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  try {
    const { id } = await params;
    const current = await getProductById(id);
    if (!current) return badRequest("Product not found.");
    const body = await req.json();
    const price = Number(body.price ?? current.price);
    if (!Number.isFinite(price) || price <= 0)
      return badRequest("Enter a valid price.");

    const product = await saveProduct({
      id,
      slug: current.slug,
      name: body.name?.trim() || current.name,
      category: body.category || current.category,
      price: Math.round(price),
      compareAt: body.compareAt ? Math.round(Number(body.compareAt)) : undefined,
      colors: Array.isArray(body.colors) && body.colors.length ? body.colors : current.colors,
      sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes : current.sizes,
      description: body.description?.trim() ?? current.description,
      details: Array.isArray(body.details) ? body.details : current.details,
      fabric: body.fabric?.trim() ?? current.fabric,
      images: Array.isArray(body.images) && body.images.length ? body.images : current.images,
      featured: body.featured ?? current.featured,
      badge: body.badge?.trim() || undefined,
      stock: Math.max(0, Math.round(Number(body.stock ?? current.stock))),
    });
    return json({ product });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not update product.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  const { id } = await params;
  await deleteProduct(id);
  return json({ ok: true });
}
