"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/account";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed.");
      await refreshUser();
      router.push(data.user?.role === "admin" && next === "/account" ? "/admin" : next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-xl shadow-ink-900/5 sm:p-9">
        <h1 className="text-2xl font-black tracking-tight text-ink-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Sign in to track orders and check out faster.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-bold text-ink-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-ink-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            className="w-full rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-500">
          New to Zeon?{" "}
          <Link
            href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-bold text-brand-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
