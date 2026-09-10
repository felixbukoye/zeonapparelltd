import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import BuilderClient from "./BuilderClient";

export const metadata: Metadata = {
  title: "Build your order",
  description:
    "Kamscomfort individual order builder — pick your style, colour and size, add embroidery, and check out in minutes.",
};

export default async function IndividualOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string }>;
}) {
  const { style } = await searchParams;
  const products = await getProducts();
  return <BuilderClient products={products} initialStyleId={style} />;
}
