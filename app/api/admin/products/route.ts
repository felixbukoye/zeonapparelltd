import { NextRequest } from "next/server";
import { getProducts, saveProduct } from "@/lib/db";
import { requireAdmin, json, badRequest } from "@/lib/api-helpers";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  return json({ products: await getProducts() });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  try {
    const body = await req.json();
    if (!body.name?.trim()) return badRequest("Product name is required.");
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0)
      return badRequest("Enter a valid price.");

    const existing = await getProducts();
    let slug = slugify(body.slug?.trim() || body.name);
    if (existing.some((p) => p.slug === slug)) slug = `${slug}-${Date.now() % 100000}`;

    const product = await saveProduct({
      slug,
      name: body.name.trim(),
      category: body.category || "Scrub Tops",
      price: Math.round(price),
      compareAt: body.compareAt ? Math.round(Number(body.compareAt)) : undefined,
      colors: Array.isArray(body.colors) && body.colors.length ? body.colors : ["Navy"],
      sizes: Array.isArray(body.sizes) && body.sizes.length
        ? body.sizes
        : ["S", "M", "L", "XL"],
      description: body.description?.trim() || "",
      details: Array.isArray(body.details) ? body.details : [],
      fabric: body.fabric?.trim() || "",
      images:
        Array.isArray(body.images) && body.images.length
          ? body.images
          : ["/images/fabric-detail.jpg"],
      featured: !!body.featured,
      badge: body.badge?.trim() || undefined,
      stock: Math.max(0, Math.round(Number(body.stock) || 0)),
    });
    return json({ product }, 201);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not save product.");
  }
}
