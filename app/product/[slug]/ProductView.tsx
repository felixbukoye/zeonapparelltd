"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, Review } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { formatNaira } from "@/lib/format";
import Rating from "@/components/Rating";
import ProductCard from "@/components/ProductCard";
import {
  CartIcon,
  CheckIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

export default function ProductView({
  product,
  reviews,
  related,
}: {
  product: Product;
  reviews: Review[];
  related: Product[];
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [imageIdx, setImageIdx] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [tab, setTab] = useState<"details" | "fabric" | "reviews">("details");

  const wishlisted = isWishlisted(product.id);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  function handleAdd(buyNow = false) {
    if (!size) {
      setSizeError(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      color,
      price: product.price,
      qty,
      image: product.images[0],
    });
    if (buyNow) router.push("/checkout");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <nav className="text-xs text-ink-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        {" / "}
        <Link href="/shop" className="hover:text-brand-700">Shop</Link>
        {" / "}
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-brand-700"
        >
          {product.category}
        </Link>
        {" / "}
        <span className="font-semibold text-ink-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-50">
            <Image
              src={product.images[imageIdx] ?? product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-ink-900/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white">
                Save {discount}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setImageIdx(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                    imageIdx === i ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} />
            <button
              onClick={() => setTab("reviews")}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              Read reviews
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-black text-ink-900">{formatNaira(product.price)}</p>
            {product.compareAt && (
              <p className="text-lg text-ink-400 line-through">{formatNaira(product.compareAt)}</p>
            )}
          </div>
          <p className="mt-4 leading-relaxed text-ink-600">{product.description}</p>

          <div className="mt-6">
            <p className="text-sm font-bold text-ink-900">
              Colour: <span className="font-semibold text-brand-700">{color}</span>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    color === c
                      ? "bg-ink-900 text-white"
                      : "border border-ink-200 text-ink-700 hover:border-brand-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5" id="size-picker">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink-900">Select size</p>
              <Link href="/size-guide" className="text-xs font-semibold text-brand-700 hover:underline">
                Size guide
              </Link>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={`min-w-12 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                    size === s
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "border border-ink-200 text-ink-700 hover:border-brand-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                Please select a size first.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-ink-200 px-1">
              <button
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="p-2.5 text-ink-600 hover:text-brand-700"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((v) => Math.min(product.stock, v + 1))}
                className="p-2.5 text-ink-600 hover:text-brand-700"
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Toggle wishlist"
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                wishlisted
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-ink-200 text-ink-600 hover:border-red-300 hover:text-red-500"
              }`}
            >
              <HeartIcon filled={wishlisted} />
            </button>
            <p className={`text-sm font-semibold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  In stock — {product.stock} available
                </span>
              ) : (
                "Out of stock"
              )}
            </p>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button
              onClick={() => handleAdd(false)}
              disabled={product.stock === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink-900 px-6 py-3.5 text-sm font-bold text-ink-900 transition hover:bg-ink-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CartIcon className="h-4.5 w-4.5" /> Add to cart
            </button>
            <button
              onClick={() => handleAdd(true)}
              disabled={product.stock === 0}
              className="rounded-full bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy it now
            </button>
          </div>

          <div className="mt-6 grid gap-2.5 rounded-2xl bg-ink-50 p-4 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2 font-medium text-ink-700">
              <TruckIcon className="h-5 w-5 shrink-0 text-brand-600" />
              Nationwide delivery in 1–5 days
            </p>
            <p className="flex items-center gap-2 font-medium text-ink-700">
              <ShieldIcon className="h-5 w-5 shrink-0 text-brand-600" />
              14-day easy size exchange
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-1 border-b border-ink-200">
          {(
            [
              ["details", "Details & features"],
              ["fabric", "Fabric & care"],
              ["reviews", `Reviews (${reviews.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-3 text-sm font-bold transition sm:px-6 ${
                tab === id
                  ? "border-b-2 border-brand-600 text-brand-700"
                  : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "details" && (
          <ul className="grid gap-2.5 py-6 sm:grid-cols-2">
            {product.details.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-sm text-ink-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {d}
              </li>
            ))}
          </ul>
        )}
        {tab === "fabric" && (
          <div className="max-w-2xl py-6 text-sm leading-relaxed text-ink-700">
            <p><strong className="text-ink-900">Fabric:</strong> {product.fabric}</p>
            <p className="mt-3">
              <strong className="text-ink-900">Care:</strong> Machine wash cold
              with like colours. Tumble dry low. Cool iron if needed. Do not
              bleach. Autoclavable where stated — our fabrics are tested for
              100+ industrial wash cycles.
            </p>
          </div>
        )}
        {tab === "reviews" && (
          <div className="grid gap-8 py-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {reviews.length === 0 && (
                <p className="rounded-2xl bg-ink-50 p-6 text-sm text-ink-600">
                  No reviews yet — be the first to share your experience with
                  this product.
                </p>
              )}
              {reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-ink-100 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Rating value={r.rating} />
                    <span className="text-xs text-ink-400">
                      {new Date(r.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {r.title && <p className="mt-2 font-bold text-ink-900">{r.title}</p>}
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{r.body}</p>
                  <p className="mt-3 text-xs font-semibold text-ink-500">
                    — {r.name} · <span className="text-emerald-600">Verified buyer</span>
                  </p>
                </article>
              ))}
            </div>
            <ReviewForm productId={product.id} />
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-black tracking-tight text-ink-900 sm:text-2xl">
            You may also like
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const [form, setForm] = useState({ name: "", rating: 5, title: "", body: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review.");
      setStatus("done");
      setMessage(data.message);
      setForm({ name: "", rating: 5, title: "", body: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not submit review.");
    }
  }

  return (
    <div className="h-fit rounded-2xl border border-ink-100 bg-white p-6 lg:sticky lg:top-32">
      <h3 className="font-bold text-ink-900">Write a review</h3>
      <p className="mt-1 text-xs text-ink-500">
        Reviews are moderated before they appear.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-bold text-ink-700">Your rating</label>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: s }))}
                aria-label={`${s} star${s > 1 ? "s" : ""}`}
                className={s <= form.rating ? "text-amber-400" : "text-ink-200"}
              >
                <StarIcon className="h-7 w-7" filled={s <= form.rating} />
              </button>
            ))}
          </div>
        </div>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Your name"
          className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Review title (optional)"
          className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <textarea
          required
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          placeholder="How was the fit, fabric and quality?"
          rows={4}
          className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-ink-900 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {status === "sending" ? "Submitting…" : "Submit review"}
        </button>
        {message && (
          <p className={`text-xs font-semibold ${status === "done" ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
