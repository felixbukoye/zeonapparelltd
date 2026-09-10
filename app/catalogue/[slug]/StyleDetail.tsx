"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { Card, CardHeader, CardLink } from "@/components/ui";

export default function StyleDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [imageIdx, setImageIdx] = useState(0);

  return (
    <div className="bg-paper pb-16">
      <div className="mx-auto max-w-[1200px] px-4 pt-8">
        <nav className="text-xs text-mist-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          {" / "}
          <Link href="/catalogue" className="hover:text-primary-600">Catalogue</Link>
          {" / "}
          <span className="font-semibold text-navy-900">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <div className="card overflow-hidden !p-0">
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                <Image
                  src={product.images[imageIdx] ?? product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-navy-950 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setImageIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition ${
                      imageIdx === i ? "border-primary" : "border-line opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-600">
              {product.category} · Made-to-order
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="tnum mt-3 text-[28px] font-bold text-navy-900">
              {formatNaira(product.price)}{" "}
              <span className="text-sm font-semibold text-mist-400">per set</span>
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-mist-500">{product.description}</p>

            <Card className="mt-5">
              <CardHeader
                title="You asked, we stitched"
                sub="Features requested by HCPs like you"
              />
              <ul className="mt-3 space-y-2.5">
                {product.details.slice(0, 4).map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-navy-800">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="mt-4 grid gap-2 text-sm text-mist-500">
              <p><strong className="text-navy-900">Fabric:</strong> {product.fabric}</p>
              <p><strong className="text-navy-900">Colours:</strong> {product.colors.join(" · ")}</p>
              <p><strong className="text-navy-900">Sizes:</strong> XS – 6XL, fitted or relaxed — or send your measurements</p>
            </div>

            <Card className="mt-5">
              <p className="text-base font-bold text-navy-900">
                Ready? Let&apos;s make it yours.
              </p>
              <p className="mt-1 text-[13px] text-mist-500">
                Next: colour, your fit, optional name embroidery — then payment.
                About 4 minutes.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <Link
                  href={`/order/individual?style=${product.id}`}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgb(59_110_246/0.35)] transition hover:bg-primary-600"
                >
                  Order this style <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/coordinator/collections/new"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-sm font-bold text-navy-900 transition hover:border-primary-200 hover:text-primary-700"
                >
                  Add to team collection
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {related.length > 0 && (
          <Card className="mt-8">
            <CardHeader
              title="Keep exploring the board"
              action={<CardLink href="/catalogue">Open style board →</CardLink>}
            />
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/catalogue/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-line transition hover:border-primary-200 hover:shadow-card-hover"
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
                  </span>
                  <span className="block p-4">
                    <span className="block truncate text-sm font-semibold text-navy-900">{p.name}</span>
                    <span className="tnum mt-0.5 block text-[13px] font-bold text-primary-600">{formatNaira(p.price)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
