"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import Rating from "@/components/Rating";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews", { cache: "no-store" });
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function moderate(id: string, action: "approve" | "delete") {
    if (action === "delete" && !confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
  }

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");

  return (
    <div>
      <h2 className="font-black text-ink-900">
        Pending moderation ({pending.length})
      </h2>
      {loading ? (
        <p className="mt-4 text-sm text-ink-500">Loading…</p>
      ) : pending.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white p-6 text-center text-sm text-ink-500">
          Nothing waiting for moderation.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {pending.map((r) => (
            <ReviewCard key={r.id} review={r} onModerate={moderate} />
          ))}
        </div>
      )}

      <h2 className="mt-8 font-black text-ink-900">
        Approved ({approved.length})
      </h2>
      <div className="mt-4 space-y-3">
        {approved.map((r) => (
          <ReviewCard key={r.id} review={r} onModerate={moderate} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onModerate,
}: {
  review: Review;
  onModerate: (id: string, action: "approve" | "delete") => void;
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Rating value={review.rating} />
          <p className="text-xs text-ink-400">{formatDateTime(review.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {review.status === "pending" && (
            <button
              onClick={() => onModerate(review.id, "approve")}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => onModerate(review.id, "delete")}
            className="rounded-full border border-ink-200 px-4 py-1.5 text-xs font-bold text-red-600 hover:border-red-300"
          >
            Delete
          </button>
        </div>
      </div>
      {review.title && <p className="mt-2 font-bold text-ink-900">{review.title}</p>}
      <p className="mt-1 text-sm text-ink-600">{review.body}</p>
      <p className="mt-2 text-xs font-semibold text-ink-500">
        — {review.name} · product: {review.productId}
      </p>
    </div>
  );
}
