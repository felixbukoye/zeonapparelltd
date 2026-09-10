"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { Collection } from "@/lib/types";
import CollectionBuilder from "../CollectionBuilder";
import { ButtonLink } from "@/components/ui";

export default function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/collections/${id}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          setMissing(true);
          return null;
        }
        const d = await r.json();
        return d.collection as Collection;
      })
      .then((c) => c && setCollection(c))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (missing || !collection) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <p className="font-display text-lg font-black text-navy-900">
          Collection not found
        </p>
        <Link href="/coordinator/collections" className="mt-2 inline-block text-sm font-bold text-primary-700 underline">
          ← Back to collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-navy-900">
            {collection.name}
          </h1>
          <p className="mt-1 text-sm text-mist-500">
            v{collection.version} · {collection.status === "for-production" ? "For Production" : "Draft"}
          </p>
        </div>
        {collection.status === "for-production" && (
          <ButtonLink href={`/coordinator/orders/new?collection=${collection.id}`}>
            Build an order from this →
          </ButtonLink>
        )}
      </div>
      <CollectionBuilder key={collection.id + collection.version} existing={collection} />
    </div>
  );
}
