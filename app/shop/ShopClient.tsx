"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/format";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { CloseIcon, SearchIcon } from "@/components/icons";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

export default function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get("category") || "All";
  const size = searchParams.get("size") || "All";
  const sort = searchParams.get("sort") || "featured";
  const q = searchParams.get("q") || "";
  const [search, setSearch] = useState(q);

  useEffect(() => setSearch(q), [q]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (size !== "All") params.set("size", size);
    if (sort) params.set("sort", sort);
    if (q) params.set("q", q);
    fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, [category, size, sort, q]);

  function setParam(key: string, value: string, resetQ = false) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "" || (key === "sort" && value === "featured")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (resetQ) params.delete("q");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  }

  const hasFilters = useMemo(
    () => category !== "All" || size !== "All" || q !== "",
    [category, size, q]
  );

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink-500">Category</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setParam("category", c)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                category === c
                  ? "bg-ink-900 text-white"
                  : "bg-ink-50 text-ink-700 hover:bg-ink-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink-500">Size</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...SIZES].map((s) => (
            <button
              key={s}
              onClick={() => setParam("size", s)}
              className={`min-w-10 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                size === s
                  ? "bg-brand-600 text-white"
                  : "border border-ink-200 text-ink-700 hover:border-brand-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {hasFilters && (
        <button
          onClick={() => router.push("/shop", { scroll: false })}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          <CloseIcon className="h-4 w-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">The catalogue</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink-900">
            {category === "All" ? "Shop all workwear" : category}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading ? "Loading…" : `${products.length} product${products.length === 1 ? "" : "s"}`}
            {q && <> for &ldquo;{q}&rdquo;</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam("q", search.trim());
            }}
            className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 focus-within:border-brand-400"
          >
            <SearchIcon className="h-4 w-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-36 bg-transparent text-sm outline-none placeholder:text-ink-400 sm:w-48"
            />
          </form>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 outline-none focus:border-brand-400"
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="rounded-full border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 lg:hidden"
          >
            Filters
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 rounded-2xl border border-ink-100 bg-white p-5">
            {filterPanel}
          </div>
        </aside>
        {filtersOpen && (
          <div className="rounded-2xl border border-ink-100 bg-white p-5 lg:hidden">
            {filterPanel}
          </div>
        )}

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-ink-100 bg-white">
                  <div className="aspect-[4/5] bg-ink-100" />
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-1/3 rounded bg-ink-100" />
                    <div className="h-4 w-2/3 rounded bg-ink-100" />
                    <div className="h-4 w-1/4 rounded bg-ink-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
              <p className="text-lg font-bold text-ink-900">No products found</p>
              <p className="mt-1 text-sm text-ink-500">
                Try a different search or clear your filters.
              </p>
              <button
                onClick={() => router.push("/shop", { scroll: false })}
                className="mt-4 rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
