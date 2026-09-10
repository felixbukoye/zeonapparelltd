import { Suspense } from "react";
import type { Metadata } from "next";
import IntakeClient from "./IntakeClient";

export const metadata: Metadata = {
  title: "Submit Your Measurements",
  description:
    "Your team is getting ZEON uniforms — submit your details and measurements in about 3 minutes. No account needed.",
};

export default async function IntakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-mist-500">
          Opening your invite…
        </div>
      }
    >
      <IntakeClient token={decodeURIComponent(token)} />
    </Suspense>
  );
}
