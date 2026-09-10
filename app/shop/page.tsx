import { Suspense } from "react";
import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop All Healthcare Workwear",
  description:
    "Shop scrubs, lab coats, theatre wear, tunics, clogs and accessories — tailored in Lagos for healthcare professionals.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-ink-500">
          Loading shop…
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
