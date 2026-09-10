import { NextRequest } from "next/server";
import { getSizeProfile, saveSizeProfile } from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const identity = searchParams.get("identity")?.trim();
  if (!identity) return badRequest("identity is required.");
  const profile = await getSizeProfile(identity);
  return json({ profile: profile ?? null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.identity?.trim()) return badRequest("identity is required.");
    const profile = await saveSizeProfile({
      identity: body.identity.trim().slice(0, 120),
      name: body.name?.trim().slice(0, 80),
      sizeMode: body.sizeMode === "manual" ? "manual" : "preset",
      size: body.size,
      fit: body.fit === "relaxed" ? "relaxed" : "fitted",
      measurements: body.measurements,
      helper: body.helper,
    });
    return json({ profile }, 201);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not save size profile.");
  }
}
