"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SafeUser } from "@/lib/types";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user || d.user.role !== "admin") {
          router.push("/login?next=/admin");
        } else {
          setUser(d.user);
        }
      })
      .finally(() => setChecking(false));
  }, [router]);

  if (checking || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-ink-500">
        Checking admin access…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            Zeon admin
          </p>
          <h1 className="text-2xl font-black tracking-tight text-ink-900">
            Store manager
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-bold text-ink-700 hover:border-ink-400"
        >
          ← View storefront
        </Link>
      </div>
      <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-ink-200">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap px-4 py-3 text-sm font-bold transition ${
              pathname === l.href
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-ink-500 hover:text-ink-900"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="py-6">{children}</div>
    </div>
  );
}
