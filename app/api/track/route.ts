import { NextRequest } from "next/server";
import {
  getIndividualOrderByCode,
  getTeamOrderByCode,
} from "@/lib/db";
import { sessionFromRequest, json } from "@/lib/api-helpers";

/**
 * Unified link-based tracker.
 * - Individual orders (ZND-…): gated by checkout email.
 * - Team orders (ZNT-…): visible to the coordinator, or to a wearer
 *   who enters the phone number they submitted at intake.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim() ?? "";
  const key = searchParams.get("key")?.trim().toLowerCase() ?? "";
  if (!code) return json({ error: "Enter your order code." }, 400);

  const individual = await getIndividualOrderByCode(code);
  if (individual) {
    const user = await sessionFromRequest(req);
    const ok =
      (user && (user.role === "admin" || user.email.toLowerCase() === individual.email.toLowerCase())) ||
      (key && key === individual.email.toLowerCase());
    if (!ok)
      return json(
        { error: "That email doesn't match this order — try the one from checkout.", gated: true },
        403
      );
    return json({ kind: "individual", order: individual });
  }

  const team = await getTeamOrderByCode(code);
  if (team) {
    const user = await sessionFromRequest(req);
    const isOwner =
      user && (user.role === "admin" || user.id === team.coordinatorId);
    const rosterMatch =
      key &&
      team.roster.some(
        (r) => r.submitted && (r.phone ?? "").trim().toLowerCase() === key
      );
    if (!isOwner && !rosterMatch)
      return json(
        {
          error:
            "We couldn't find that phone number on this order — use the number you submitted at intake, or ask your coordinator.",
          gated: true,
        },
        403
      );
    return json({ kind: "team", order: team, mine: rosterMatch ? true : false });
  }

  return json({ error: "We couldn't find that order code — check it and try again." }, 404);
}
