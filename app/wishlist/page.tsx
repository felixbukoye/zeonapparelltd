"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import { HeartIcon } from "@/components/icons";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">My wishlist</h1>
      <p className="mt-1 text-sm text-ink-500">
        {wishlist.length === 0
          ? "Nothing saved yet."
          : `${wishlist.length} saved item(s).`}
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-ink-500">Loading…</p>
      ) : saved.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-white px-8 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-400">
            <HeartIcon className="h-8 w-8" />
          </span>
          <p className="text-lg font-bold text-ink-900">Your wishlist is empty</p>
          <p className="max-w-sm text-sm text-ink-500">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="mt-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-bold text-white hover:bg-brand-700"
          >
            Discover products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
