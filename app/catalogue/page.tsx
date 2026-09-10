import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogueClient from "./CatalogueClient";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "The ZEON style board — scrubs, lab coats, theatre wear and more. Pick a style and we'll make it to your size.",
};

export default function CataloguePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-paper py-20 text-center text-sm text-mist-500">
          Loading the style board…
        </div>
      }
    >
      <CatalogueClient />
    </Suspense>
  );
}
