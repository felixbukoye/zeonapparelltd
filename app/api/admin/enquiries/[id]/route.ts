import { NextRequest } from "next/server";
import { updateEnquiryStatus } from "@/lib/db";
import { requireAdmin, json, badRequest } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!["new", "contacted", "closed"].includes(status))
      return badRequest("Invalid status.");
    const enquiry = await updateEnquiryStatus(id, status);
    return json({ enquiry });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not update enquiry.");
  }
}
