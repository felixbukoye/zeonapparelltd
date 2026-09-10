import { NextRequest } from "next/server";
import { createEnquiry } from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, organisation, quantity, products, message } =
      await req.json();
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
      return badRequest("Please fill in your name, email, phone and requirements.");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return badRequest("Please enter a valid email address.");
    }
    const enquiry = await createEnquiry({
      kind: "wholesale",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      organisation: organisation?.trim(),
      quantity: quantity?.trim(),
      products: products?.trim(),
      message: message.trim(),
    });
    return json(
      {
        enquiry,
        message:
          "Enquiry received! Our wholesale team will contact you within one business day.",
      },
      201
    );
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not send enquiry.");
  }
}
