import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/db";
import StyleDetail from "./StyleDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Style not found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function StylePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const all = await getProducts();
  const related = [
    ...all.filter((p) => p.category === product.category && p.id !== product.id),
    ...all.filter((p) => p.category !== product.category && p.id !== product.id),
  ].slice(0, 3);
  return <StyleDetail product={product} related={related} />;
}
