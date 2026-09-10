"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { HeartIcon } from "./icons";
import Rating from "./Rating";

export default function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/8">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-ink-50"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-ink-900/80 py-2 text-center text-xs font-semibold uppercase tracking-widest text-white">
            Out of stock
          </span>
        )}
      </Link>

      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute right-3 top-12 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
          wishlisted
            ? "bg-red-500 text-white"
            : "bg-white/95 text-ink-600 hover:text-red-500"
        } ${discount > 0 ? "top-12" : "top-3"}`}
      >
        <HeartIcon className="h-4.5 w-4.5" filled={wishlisted} />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-600">
          {product.category}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 font-semibold leading-snug text-ink-900 transition-colors hover:text-brand-700"
        >
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-ink-900">
            {formatNaira(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-sm text-ink-400 line-through">
              {formatNaira(product.compareAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-400">
          {product.colors.length} colour{product.colors.length > 1 ? "s" : ""} ·{" "}
          {product.sizes.length} sizes
        </p>
      </div>
    </div>
  );
}
