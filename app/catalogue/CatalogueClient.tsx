"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { Card, Skeleton } from "@/components/ui";

const CATEGORIES = [
  "All",
  "Scrub Tops",
  "Trousers",
  "Scrub Sets",
  "Lab Coats",
  "Tunics",
  "Jackets",
  "Headwear",
  "Footwear",
  "Accessories",
];

const GENDERS = ["All", "Women", "Men", "Unisex"];

function genderOf(p: Product): string {
  if (/women|tunic/i.test(p.name + p.category)) return "Women";
  return "Unisex";
}

export default function CatalogueClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "All";
  const gender = searchParams.get("gender") || "All";
  const colour = searchParams.get("colour") || "All";
  const q = searchParams.get("q") || "";
  const [search, setSearch] = useState(q);

  useEffect(() => setSearch(q), [q]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "") params.delete(key);
    else params.set(key, value);
    router.push(`/catalogue?${params.toString()}`, { scroll: false });
  }

  const allColours = Array.from(new Set(products.flatMap((p) => p.colors)));

  const filtered = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (gender !== "All" && genderOf(p) !== gender && genderOf(p) !== "Unisex")
      return false;
    if (colour !== "All" && !p.colors.includes(colour)) return false;
    if (
      q &&
      !`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q.toLowerCase())
    )
      return false;
    return true;
  });

  const hasFilters = category !== "All" || gender !== "All" || colour !== "All" || q !== "";

  return (
    <div className="bg-paper pb-16">
      <div className="calm-wash">
        <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:pt-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            The style board
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Pick a style — we&apos;ll make it yours
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-500">
            Everything here is made-to-order in your size, in your colours, with
            your name stitched in. Nothing ships off a shelf.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4">
        {/* Filter toolbar card */}
        <Card className="mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setParam("q", search.trim());
              }}
              className="flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-paper px-4 py-1 transition focus-within:border-primary focus-within:bg-white"
            >
              <SearchIcon className="h-4.5 w-4.5 shrink-0 text-mist-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search styles…"
                className="w-full bg-transparent py-2.5 text-sm text-navy-900 outline-none placeholder:text-mist-400"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setParam("q", "")}
                  aria-label="Clear search"
                  className="rounded-full p-2 text-mist-400 hover:text-navy-900"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </form>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-mist-400">
                  Fit
                </span>
                <div className="flex gap-1.5">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setParam("gender", g)}
                      className={`min-h-[40px] rounded-full px-4 text-[13px] transition ${
                        gender === g
                          ? "bg-primary font-bold text-white shadow-[0_4px_14px_rgb(59_110_246/0.35)]"
                          : "bg-paper font-semibold text-mist-500 hover:bg-primary-50 hover:text-primary-700"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-mist-400">
                  Colour
                </span>
                <select
                  value={colour}
                  onChange={(e) => setParam("colour", e.target.value)}
                  className="min-h-[40px] rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-navy-900 outline-none focus:border-primary"
                  aria-label="Filter by colour"
                >
                  <option>All</option>
                  {allColours.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              {hasFilters && (
                <button
                  onClick={() => router.push("/catalogue", { scroll: false })}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-primary-600 hover:underline"
                >
                  <CloseIcon className="h-4 w-4" /> Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setParam("category", c)}
                className={`min-h-[40px] shrink-0 rounded-full px-4 text-[13px] transition ${
                  category === c
                    ? "bg-primary font-bold text-white shadow-[0_4px_14px_rgb(59_110_246/0.35)]"
                    : "border border-line bg-white font-semibold text-mist-500 hover:border-primary-200 hover:text-primary-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>

        {/* Style board */}
        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] !rounded-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="mt-6 px-6 py-16 text-center">
            <p className="text-lg font-bold text-navy-900">
              Nothing matches those filters
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-mist-500">
              Try clearing a filter — or tell us what you&apos;re dreaming of
              and we&apos;ll see if our workroom can make it.
            </p>
            <button
              onClick={() => router.push("/catalogue", { scroll: false })}
              className="mt-5 min-h-[44px] rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-600"
            >
              Clear filters
            </button>
          </Card>
        ) : (
          <>
            <p className="mt-6 text-xs font-semibold text-mist-400">
              {filtered.length} style{filtered.length === 1 ? "" : "s"} · from{" "}
              {formatNaira(Math.min(...filtered.map((p) => p.price)))} per set
            </p>
            <div className="mt-3 grid grid-cols-2 gap-5 md:grid-cols-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/catalogue/${p.slug}`}
                  className="card card-hover group overflow-hidden !p-0"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-paper">
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {p.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-navy-950 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                        {p.badge}
                      </span>
                    )}
                  </span>
                  <span className="block p-4 sm:p-5">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-primary-600">
                      {p.category}
                    </span>
                    <span className="mt-0.5 block truncate text-[15px] font-semibold text-navy-900">
                      {p.name}
                    </span>
                    <span className="mt-1 line-clamp-2 block min-h-[2.2em] text-[13px] leading-snug text-mist-500">
                      {p.description}
                    </span>
                    <span className="tnum mt-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-navy-900">{formatNaira(p.price)}</span>
                      <span className="text-xs font-medium text-mist-400">
                        {p.colors.length} colours
                      </span>
                    </span>
                    <span className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-primary-50 px-4 py-2 text-xs font-bold text-primary-700 transition group-hover:bg-primary group-hover:text-white">
                      Order this style →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
