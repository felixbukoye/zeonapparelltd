"use client";

import { useEffect, useState } from "react";
import type { Enquiry } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [kind, setKind] = useState<"wholesale" | "contact">("wholesale");
  const [loading, setLoading] = useState(true);

  async function load(k = kind) {
    setLoading(true);
    const res = await fetch(`/api/admin/enquiries?kind=${k}`, { cache: "no-store" });
    const data = await res.json();
    setEnquiries(data.enquiries ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load("wholesale");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeKind(k: "wholesale" | "contact") {
    setKind(k);
    load(k);
  }

  async function setStatus(id: string, status: Enquiry["status"]) {
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div>
      <div className="flex gap-2">
        {(["wholesale", "contact"] as const).map((k) => (
          <button
            key={k}
            onClick={() => changeKind(k)}
            className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition ${
              kind === k ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
            }`}
          >
            {k === "wholesale" ? "Wholesale quotes" : "Contact messages"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-500">Loading…</p>
      ) : enquiries.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink-500">
          No enquiries yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink-900">
                    {e.name}
                    {e.organisation && <span className="text-ink-500"> · {e.organisation}</span>}
                  </p>
                  <p className="text-xs text-ink-500">
                    {e.email} · {e.phone} · {formatDateTime(e.createdAt)}
                  </p>
                  {e.quantity && (
                    <p className="mt-1 text-xs font-bold text-brand-700">
                      Qty: {e.quantity}
                      {e.products ? ` · ${e.products}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {(["new", "contacted", "closed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(e.id, s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                        e.status === s
                          ? s === "new"
                            ? "bg-amber-100 text-amber-800"
                            : s === "contacted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-ink-100 text-ink-500"
                          : "bg-ink-50 text-ink-400 hover:bg-ink-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-ink-50 p-3.5 text-sm leading-relaxed text-ink-700">
                {e.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
