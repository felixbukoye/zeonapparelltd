import { NextRequest } from "next/server";
import { getReviews } from "@/lib/db";
import { requireAdmin, json } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  return json({ reviews: await getReviews() });
}
