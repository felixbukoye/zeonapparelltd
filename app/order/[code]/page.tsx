import { Suspense } from "react";
import type { Metadata } from "next";
import OrderView from "./OrderView";

export const metadata: Metadata = { title: "Order Confirmation" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-ink-500">
          Loading your order…
        </div>
      }
    >
      <OrderView code={code} />
    </Suspense>
  );
}
