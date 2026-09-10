import { NextRequest } from "next/server";
import { getEnquiries } from "@/lib/db";
import { requireAdmin, json } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  let enquiries = await getEnquiries();
  if (kind === "wholesale" || kind === "contact")
    enquiries = enquiries.filter((e) => e.kind === kind);
  return json({ enquiries });
}
