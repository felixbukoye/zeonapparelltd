"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui";

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
    <div className="bg-navy-950 pb-16">
      <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:pt-14">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
          The style board
        </p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
          Pick a style — we&apos;ll make it yours
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
          Everything here is made-to-order in your size, in your colours, with
          your name stitched in. Nothing ships off a shelf.
        </p>

        {/* Filters */}
        <div className="mt-7 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam("q", search.trim());
            }}
            className="flex max-w-md items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-1 focus-within:border-gold-500/60"
          >
            <SearchIcon className="h-4.5 w-4.5 shrink-0 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search styles…"
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/35"
            />
            {q && (
              <button
                type="button"
                onClick={() => setParam("q", "")}
                aria-label="Clear search"
                className="rounded-lg p-2 text-white/50 hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </form>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
              Category
            </p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setParam("category", c)}
                  className={`min-h-[40px] shrink-0 rounded-full px-4 text-[13px] font-bold transition ${
                    category === c
                      ? "bg-gold-500 text-navy-950"
                      : "border border-white/15 text-white/70 hover:border-white/35 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Gender
              </p>
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setParam("gender", g)}
                    className={`min-h-[40px] rounded-full px-4 text-[13px] font-bold transition ${
                      gender === g
                        ? "bg-white text-navy-950"
                        : "border border-white/15 text-white/70 hover:border-white/35 hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Colour
              </p>
              <select
                value={colour}
                onChange={(e) => setParam("colour", e.target.value)}
                className="min-h-[40px] rounded-full border border-white/15 bg-navy-950 px-4 text-[13px] font-bold text-white outline-none focus:border-gold-500/60"
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
                className="mt-6 inline-flex min-h-[40px] items-center gap-1.5 text-[13px] font-bold text-gold-300 hover:text-gold-200"
              >
                <CloseIcon className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Masonry style board */}
        {loading ? (
          <div className="mt-8 columns-2 gap-4 md:columns-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`skeleton-dark mb-4 break-inside-avoid !rounded-2xl ${i % 2 ? "aspect-square" : "aspect-[3/4]"}`}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/20 px-6 py-16 text-center">
            <p className="font-display text-lg font-bold text-white">
              Nothing matches those filters
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/55">
              Try clearing a filter — or tell us what you&apos;re dreaming of
              and we&apos;ll see if our workroom can make it.
            </p>
            <button
              onClick={() => router.push("/catalogue", { scroll: false })}
              className="mt-5 min-h-[44px] rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-navy-950 hover:bg-gold-400"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="mt-6 text-xs font-semibold text-white/45">
              {filtered.length} style{filtered.length === 1 ? "" : "s"} · from{" "}
              {formatNaira(Math.min(...filtered.map((p) => p.price)))} per set
            </p>
            <div className="mt-4 columns-2 gap-4 md:columns-3">
              {filtered.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/catalogue/${p.slug}`}
                  className={`group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-white/10 transition hover:border-gold-500/50 ${
                    i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/92 via-navy-950/15 to-transparent" />
                  {p.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-950">
                      {p.badge}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-300">
                      {p.category}
                    </p>
                    <p className="mt-0.5 font-display text-base font-bold leading-snug text-white sm:text-lg">
                      {p.name}
                    </p>
                    <p className="mt-1 flex items-center justify-between text-sm">
                      <span className="font-bold text-white">{formatNaira(p.price)}</span>
                      <span className="text-xs font-semibold text-white/55">
                        {p.colors.length} colours
                      </span>
                    </p>
                    <p className="mt-2 inline-flex min-h-[36px] items-center rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur transition group-hover:bg-gold-500 group-hover:text-navy-950">
                      Order this style →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
