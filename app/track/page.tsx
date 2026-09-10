import type { Metadata } from "next";
import TrackClient from "./TrackClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Follow your made-to-order scrubs through all 8 production stages — no account needed.",
};

export default function TrackPage() {
  return <TrackClient />;
}
