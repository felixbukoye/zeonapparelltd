import crypto from "crypto";
import { cookies } from "next/headers";
import { getUserById } from "./db";
import type { SafeUser } from "./types";

type SafeUserShim = SafeUser;

const COOKIE_NAME = "zeon_session";
const SECRET =
  process.env.ZEON_SESSION_SECRET || "zeon-demo-secret-change-in-production";

interface SessionPayload {
  uid: string;
  role: "customer" | "admin";
  exp: number;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(
  userId: string,
  role: "customer" | "admin"
): string {
  const payload: SessionPayload = {
    uid: userId,
    role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 days
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function parseSessionToken(token: string): SessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload.uid || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<
  (SafeUserShim & { role: "customer" | "admin" }) | null
> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  const user = await getUserById(payload.uid);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    city: user.city,
    createdAt: user.createdAt,
  };
}

export { COOKIE_NAME };
