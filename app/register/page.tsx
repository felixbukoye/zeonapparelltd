"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/account";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      await refreshUser();
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-xl shadow-ink-900/5 sm:p-9">
        <h1 className="text-2xl font-black tracking-tight text-ink-900">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Track orders, save your wishlist and check out in seconds.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink-700">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Adaeze Okafor"
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink-700">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink-700">
              Phone <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0801 234 5678"
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink-700">
              Password <span className="font-normal text-ink-400">(min. 6 characters)</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-600 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link
            href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-bold text-brand-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
