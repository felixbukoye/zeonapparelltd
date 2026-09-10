"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button, Field, InlineBanner, inputCls } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/coordinator";

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
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} If you've forgotten your password, message us on WhatsApp and we'll sort it out.`
          : "Sign in failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
          Coordinator sign in
        </p>
        <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-mist-500">
          Running a team order? Pick up right where you left off.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3.5">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@hospital.com"
              className={inputCls}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </Field>
          {error && (
            <InlineBanner tone="error" className="font-semibold">{error}</InlineBanner>
          )}
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-mist-500">
          New here?{" "}
          <Link href="/coordinator/setup" className="font-bold text-primary-700 hover:underline">
            Create a coordinator account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-mist-400">
          A wearer with an invite link? You don&apos;t need an account — just
          open your link.{" "}
          <Link href="/track" className="font-bold underline">
            Or track your order →
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
