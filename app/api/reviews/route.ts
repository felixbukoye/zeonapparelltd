import { NextRequest } from "next/server";
import {
  createReview,
  getApprovedReviewsForProduct,
  getProductById,
} from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return badRequest("productId is required.");
  const reviews = await getApprovedReviewsForProduct(productId);
  return json({ reviews });
}

export async function POST(req: NextRequest) {
  try {
    const { productId, name, rating, title, body } = await req.json();
    if (!productId || !name?.trim() || !body?.trim()) {
      return badRequest("Name and review are required.");
    }
    const stars = Number(rating);
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return badRequest("Please select a rating from 1 to 5.");
    }
    const product = await getProductById(productId);
    if (!product) return badRequest("Product not found.");
    const review = await createReview({
      productId,
      name: name.trim().slice(0, 60),
      rating: Math.round(stars),
      title: title?.trim().slice(0, 100),
      body: body.trim().slice(0, 2000),
    });
    return json(
      { review, message: "Thanks! Your review was submitted for moderation." },
      201
    );
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not submit review.");
  }
}
