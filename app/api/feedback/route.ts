import { NextRequest } from "next/server";
import {
  createFeedback,
  getIndividualOrderByCode,
  getTeamOrderByCode,
  logEvent,
} from "@/lib/db";
import { json, badRequest } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.orderCode?.trim() ?? "";
    if (!code) return badRequest("Order code is required.");
    const individual = await getIndividualOrderByCode(code);
    const team = individual ? null : await getTeamOrderByCode(code);
    if (!individual && !team)
      return badRequest("We couldn't find that order code.");
    if (!["yes", "slightly-tight", "slightly-loose", "no"].includes(body.fit))
      return badRequest("Tell us how the fit was.");
    const num = (v: unknown) => Math.max(1, Math.min(5, Math.round(Number(v) || 0)));
    const fb = await createFeedback({
      orderCode: code,
      kind: individual ? "individual" : "team",
      wearerName: body.wearerName?.trim().slice(0, 80),
      fit: body.fit,
      ratings: {
        overall: num(body.overall),
        sizing: num(body.sizing),
        fabric: num(body.fabric),
      },
      nameCorrect: body.nameCorrect,
      deptCorrect: body.deptCorrect,
      text: body.text?.trim().slice(0, 2000),
    });
    await logEvent("feedback_form_submitted", {
      orderCode: code,
      overall: fb.ratings.overall,
      sizing: fb.ratings.sizing,
    });
    return json(
      {
        feedback: fb,
        message: "Thank you — your feedback makes every future set better. 🤍",
      },
      201
    );
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not submit feedback.");
  }
}
