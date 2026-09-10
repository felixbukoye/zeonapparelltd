import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "./db";
import { parseSessionToken, COOKIE_NAME } from "./auth";
import type { SafeUser } from "./types";

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function sessionFromRequest(
  req: NextRequest
): Promise<SafeUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  const user = await getUserById(payload.uid);
  if (!user) return null;
  const { passwordHash: _ph, salt: _s, ...safe } = user;
  return safe;
}

export async function requireAdmin(
  req: NextRequest
): Promise<SafeUser | NextResponse> {
  const user = await sessionFromRequest(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  return user;
}
