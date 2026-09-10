"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { CATEGORIES, formatNaira } from "@/lib/format";
import { CloseIcon } from "@/components/icons";

const EMPTY = {
  name: "",
  category: "Scrub Tops",
  price: "",
  compareAt: "",
  stock: "50",
  colors: "Navy, Ceil Blue, Teal",
  sizes: "XS, S, M, L, XL, 2XL",
  badge: "",
  featured: false,
  description: "",
  fabric: "",
  details: "",
  images: "/images/fabric-detail.jpg",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      compareAt: p.compareAt ? String(p.compareAt) : "",
      stock: String(p.stock),
      colors: p.colors.join(", "),
      sizes: p.sizes.join(", "),
      badge: p.badge ?? "",
      featured: !!p.featured,
      description: p.description,
      fabric: p.fabric,
      details: p.details.join("\n"),
      images: p.images.join(", "),
    });
    setError("");
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        compareAt: form.compareAt ? Number(form.compareAt) : undefined,
        stock: Number(form.stock),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        badge: form.badge,
        featured: form.featured,
        description: form.description,
        fabric: form.fabric,
        details: form.details.split("\n").map((s) => s.trim()).filter(Boolean),
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch(
        editing ? `/api/admin/products/${editing.id}` : "/api/admin/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save product.");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    await load();
  }

  const inputCls =
    "w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500";

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{products.length} product(s)</p>
        <button
          onClick={openCreate}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          + Add product
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-500">Loading products…</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-widest text-ink-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <span className="relative h-11 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                        <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                      </span>
                      <span className="font-semibold text-ink-900">{p.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{p.category}</td>
                  <td className="px-4 py-3 font-bold">{formatNaira(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 20 ? "font-bold text-red-600" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.featured ? "★" : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="mr-2 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs font-bold hover:border-brand-400 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="rounded-full border border-ink-200 px-3.5 py-1.5 text-xs font-bold text-red-600 hover:border-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/50 p-4">
          <form
            onSubmit={save}
            className="mx-auto my-8 max-w-2xl rounded-3xl bg-white p-6 sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-ink-900">
                {editing ? "Edit product" : "Add product"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 hover:bg-ink-50"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold">Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Badge (optional)</label>
                <input value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className={inputCls} placeholder="e.g. New" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Price (₦) *</label>
                <input required type="number" min={1} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Compare-at price (₦)</label>
                <input type="number" min={0} value={form.compareAt} onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Stock</label>
                <input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className={inputCls} />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="h-4 w-4 accent-teal-700"
                  />
                  Featured on homepage
                </label>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Colours (comma-separated)</label>
                <input value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Sizes (comma-separated)</label>
                <input value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold">Fabric</label>
                <input value={form.fabric} onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold">Feature bullets (one per line)</label>
                <textarea rows={3} value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold">Image URLs (comma-separated)</label>
                <input value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} className={inputCls} />
                <p className="mt-1 text-[11px] text-ink-400">
                  Product photos live in <code>public/images/products/</code> — e.g. /images/products/scrub-set-navy.jpg
                </p>
              </div>
            </div>
            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                {error}
              </p>
            )}
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-full border border-ink-200 py-3 text-sm font-bold hover:border-ink-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
