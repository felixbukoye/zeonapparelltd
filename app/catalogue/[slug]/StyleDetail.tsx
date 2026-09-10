"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

export default function StyleDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [imageIdx, setImageIdx] = useState(0);

  return (
    <div className="bg-navy-950 pb-16">
      <div className="mx-auto max-w-[1200px] px-4 pt-8">
        <nav className="text-xs text-white/50">
          <Link href="/" className="hover:text-gold-300">Home</Link>
          {" / "}
          <Link href="/catalogue" className="hover:text-gold-300">Catalogue</Link>
          {" / "}
          <span className="font-semibold text-white/80">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={product.images[imageIdx] ?? product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-gold-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-navy-950">
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setImageIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                      imageIdx === i ? "border-gold-500" : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
              {product.category} · Made-to-order
            </p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 font-display text-2xl font-black text-gold-300">
              {formatNaira(product.price)}{" "}
              <span className="text-sm font-semibold text-white/50">per set</span>
            </p>
            <p className="mt-4 leading-relaxed text-white/70">{product.description}</p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-400">
                You asked, we stitched
              </p>
              <ul className="mt-3 space-y-2.5">
                {product.details.slice(0, 4).map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-white/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-300">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-white/60">
              <p><strong className="text-white/85">Fabric:</strong> {product.fabric}</p>
              <p><strong className="text-white/85">Colours:</strong> {product.colors.join(" · ")}</p>
              <p><strong className="text-white/85">Sizes:</strong> XS – 6XL, fitted or relaxed — or send your measurements</p>
            </div>

            {/* Theme shift: committing to an order moves to light/transactional */}
            <div className="mt-6 rounded-2xl bg-white p-5 sm:p-6">
              <p className="font-display text-base font-black text-navy-900">
                Ready? Let&apos;s make it yours.
              </p>
              <p className="mt-1 text-[13px] text-mist-500">
                Next: colour, your fit, optional name embroidery — then payment.
                About 4 minutes.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <Link
                  href={`/order/individual?style=${product.id}`}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700"
                >
                  Order this style <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/coordinator/collections/new"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-navy-900 px-6 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
                >
                  Add to team collection
                </Link>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-xl font-black text-white">
              Keep exploring the board
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/catalogue/${p.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-display text-sm font-bold text-white sm:text-base">{p.name}</p>
                    <p className="text-[13px] font-bold text-gold-300">{formatNaira(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
