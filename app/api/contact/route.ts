import { NextRequest } from "next/server";
import { createEnquiry } from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return badRequest("Please fill in your name, email and message.");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return badRequest("Please enter a valid email address.");
    }
    await createEnquiry({
      kind: "contact",
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "—",
      message: message.trim(),
    });
    return json(
      { message: "Message sent! We reply within one business day." },
      201
    );
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not send message.");
  }
}
