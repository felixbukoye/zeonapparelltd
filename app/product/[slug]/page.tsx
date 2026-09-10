import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApprovedReviewsForProduct, getProductBySlug, getProducts } from "@/lib/db";
import ProductView from "./ProductView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, all] = await Promise.all([
    getApprovedReviewsForProduct(product.id),
    getProducts(),
  ]);
  const related = [
    ...all.filter((p) => p.category === product.category && p.id !== product.id),
    ...all.filter((p) => p.category !== product.category && p.id !== product.id),
  ].slice(0, 4);

  return <ProductView product={product} reviews={reviews} related={related} />;
}
