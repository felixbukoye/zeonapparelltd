"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Collection } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ButtonLink, EmptyState, StatusBadge } from "@/components/ui";
import { CheckIcon, ClockIcon, PlusIcon } from "@/components/icons";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collections", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCollections(d.collections ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-navy-900">
            Collections
          </h1>
          <p className="mt-1 text-sm text-mist-500">
            Approved styles, colours and embroidery rules for your facility.
          </p>
        </div>
        <ButtonLink href="/coordinator/collections/new">
          <PlusIcon className="h-4 w-4" /> Build a Collection
        </ButtonLink>
      </div>

      {collections.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No collections yet"
            body="A collection is your facility's approved uniform menu — styles, colours and embroidery rules in one place. Build your first one now."
            action={
              <ButtonLink href="/coordinator/collections/new">
                Build your first collection
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/coordinator/collections/${c.id}`}
              className="rounded-2xl border border-line bg-white p-5 transition hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-black text-navy-900">{c.name}</p>
                  <p className="mt-0.5 text-xs text-mist-500">
                    v{c.version} · updated {formatDate(c.createdAt)}
                  </p>
                </div>
                {c.status === "for-production" ? (
                  <StatusBadge
                    tone="success"
                    icon={<CheckIcon className="h-3.5 w-3.5" />}
                    label="For Production"
                  />
                ) : (
                  <StatusBadge
                    tone="neutral"
                    icon={<ClockIcon className="h-3.5 w-3.5" />}
                    label="Draft"
                  />
                )}
              </div>
              <p className="mt-3 text-[13px] text-mist-500">
                {c.mode === "full"
                  ? "Full ZEON catalogue"
                  : `${c.styles.length} style(s) · ${c.categories.length} categor${c.categories.length === 1 ? "y" : "ies"}`}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {c.approvedColours.slice(0, 5).map((col) => (
                  <span
                    key={col}
                    className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-navy-800"
                  >
                    {col}
                  </span>
                ))}
                {c.approvedColours.length > 5 && (
                  <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-mist-500">
                    +{c.approvedColours.length - 5} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
