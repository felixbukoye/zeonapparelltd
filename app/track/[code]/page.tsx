import { Suspense } from "react";
import type { Metadata } from "next";
import TrackClient from "../TrackClient";

export const metadata: Metadata = { title: "Order Tracker" };

export default async function TrackCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { code } = await params;
  const { key } = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-mist-500">
          Finding your order…
        </div>
      }
    >
      <TrackClient initialCode={decodeURIComponent(code)} initialKey={key ?? ""} />
    </Suspense>
  );
}
