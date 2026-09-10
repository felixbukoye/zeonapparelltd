import { NextRequest } from "next/server";
import { getProductBySlug, getApprovedReviewsForProduct } from "@/lib/db";
import { json } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return json({ error: "Product not found." }, 404);
  const reviews = await getApprovedReviewsForProduct(product.id);
  return json({ product, reviews });
}
