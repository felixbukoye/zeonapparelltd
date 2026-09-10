import { NextRequest } from "next/server";
import { createDiscoverySession, logEvent } from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = body.mode;
    if (!["assisted", "guided", "embedded"].includes(mode))
      return badRequest("Choose how you'd like to join the conversation.");
    const session = await createDiscoverySession({
      mode,
      name: body.name?.trim().slice(0, 80),
      contact: body.contact?.trim().slice(0, 120),
      ambassador: body.ambassador?.trim().slice(0, 80),
      orderCode: body.orderCode?.trim(),
    });
    await logEvent("discovery_session_started", { mode, sessionId: session.id });
    return json({ session }, 201);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not start session.");
  }
}
