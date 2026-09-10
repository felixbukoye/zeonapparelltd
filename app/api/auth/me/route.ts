import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/lib/db";
import { sessionFromRequest, json } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await sessionFromRequest(req);
  if (!user) return json({ error: "Not signed in." }, 401);
  return json({ user });
}

export async function PATCH(req: NextRequest) {
  const user = await sessionFromRequest(req);
  if (!user) return json({ error: "Not signed in." }, 401);
  const { name, phone, address, city, orgName, orgType } = await req.json();
  const updated = await updateUser(user.id, {
    name,
    phone,
    address,
    city,
    orgName,
    orgType,
  });
  const { passwordHash: _ph, salt: _s, ...safe } = updated;
  return NextResponse.json({ user: safe });
}
