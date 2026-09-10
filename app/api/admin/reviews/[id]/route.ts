import { NextRequest } from "next/server";
import { moderateReview } from "@/lib/db";
import { requireAdmin, json, badRequest } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  try {
    const { id } = await params;
    const { action } = await req.json();
    if (action !== "approve" && action !== "delete")
      return badRequest("Invalid action.");
    await moderateReview(id, action);
    return json({ ok: true });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not moderate review.");
  }
}
