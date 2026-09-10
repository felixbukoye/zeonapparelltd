import { NextRequest } from "next/server";
import { getProducts } from "@/lib/db";
import { json } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.toLowerCase().trim();
  const sort = searchParams.get("sort") || "featured";
  const featured = searchParams.get("featured");
  const min = Number(searchParams.get("min") || 0);
  const max = Number(searchParams.get("max") || 0);
  const size = searchParams.get("size");

  let products = await getProducts();

  if (featured === "true") products = products.filter((p) => p.featured);
  if (category && category !== "All")
    products = products.filter((p) => p.category === category);
  if (size && size !== "All") products = products.filter((p) => p.sizes.includes(size));
  if (min > 0) products = products.filter((p) => p.price >= min);
  if (max > 0) products = products.filter((p) => p.price <= max);
  if (q) {
    products = products.filter((p) =>
      `${p.name} ${p.category} ${p.description} ${p.colors.join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }

  switch (sort) {
    case "price-asc":
      products = [...products].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products = [...products].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products = [...products].sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      products = [...products].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      break;
    default:
      products = [...products].sort(
        (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)
      );
  }

  return json({ products });
}
