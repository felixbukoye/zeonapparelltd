import { NextRequest } from "next/server";
import { getDiscoverySession, logEvent, saveDiscoverySession } from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getDiscoverySession(id);
  if (!session) return json({ error: "Session not found." }, 404);
  return json({ session });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getDiscoverySession(id);
  if (!session) return json({ error: "Session not found." }, 404);
  try {
    const body = await req.json();
    if (Array.isArray(body.answers)) {
      for (const a of body.answers) {
        session.answers.push({
          section: Number(a.section) || session.currentSection,
          question: String(a.question ?? "").slice(0, 300),
          answer: String(a.answer ?? "").slice(0, 4000),
          skipped: !!a.skipped,
          voiceNote: !!a.voiceNote,
        });
      }
    }
    if (typeof body.currentSection === "number")
      session.currentSection = Math.max(1, Math.min(5, body.currentSection));
    if (typeof body.communityOptIn === "boolean")
      session.communityOptIn = body.communityOptIn;
    if (body.complete) {
      session.completed = true;
      session.points = 100;
      session.completedAt = new Date().toISOString();
      await logEvent("discovery_session_completed", {
        mode: session.mode,
        sessionId: session.id,
        answers: session.answers.filter((a) => !a.skipped).length,
      });
    }
    await saveDiscoverySession(session);
    return json({ session });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not save progress.");
  }
}
