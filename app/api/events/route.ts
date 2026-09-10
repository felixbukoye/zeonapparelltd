import { NextRequest } from "next/server";
import { logEvent } from "@/lib/db";
import { json } from "@/lib/api-helpers";

/** Lightweight analytics hook (spec §11) — fire-and-forget from the UI. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== "string")
      return json({ error: "name is required." }, 400);
    await logEvent(body.name.slice(0, 80), body.props);
    return json({ ok: true });
  } catch {
    return json({ ok: true });
  }
}
