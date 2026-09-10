import { Suspense } from "react";
import type { Metadata } from "next";
import DiscoveryClient from "./DiscoveryClient";

export const metadata: Metadata = {
  title: "Discovery Conversation",
  description:
    "Tell us about your workwear life — shape what ZEON sews next and earn 100 ZEON Points.",
};

export default function DiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-mist-500">
          Loading Discovery…
        </div>
      }
    >
      <DiscoveryClient />
    </Suspense>
  );
}
