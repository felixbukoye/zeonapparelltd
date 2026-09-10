"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SafeUser } from "@/lib/types";
import { BoxIcon, BuildingIcon, ChatIcon, UserIcon } from "@/components/icons";

const LINKS = [
  { href: "/coordinator", label: "Home", icon: BuildingIcon, exact: true },
  { href: "/coordinator/orders", label: "Orders", icon: BoxIcon },
  { href: "/coordinator/collections", label: "Collections", icon: ChatIcon },
  { href: "/coordinator/account", label: "Account", icon: UserIcon },
];

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [checking, setChecking] = useState(true);

  const isSetup = pathname === "/coordinator/setup";

  useEffect(() => {
    if (isSetup) {
      setChecking(false);
      return;
    }
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user || (d.user.role !== "coordinator" && d.user.role !== "admin")) {
          router.push("/login?next=/coordinator");
        } else {
          setUser(d.user);
        }
      })
      .finally(() => setChecking(false));
  }, [router, isSetup]);

  if (isSetup) return <>{children}</>;

  if (checking || !user) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-3 px-4 py-10">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 pb-24 sm:py-8 lg:pb-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Desktop left rail */}
        <aside className="hidden lg:block">
          <nav className="sticky top-32 space-y-1 rounded-2xl border border-line bg-white p-3">
            <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-mist-400">
              {user.orgName || "Coordinator"}
            </p>
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition ${
                    active ? "bg-primary-50 text-primary-700" : "text-navy-800 hover:bg-paper"
                  }`}
                >
                  <l.icon className="h-5 w-5" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-bold ${
                  active ? "text-primary-700" : "text-mist-400"
                }`}
              >
                <l.icon className="h-5.5 w-5.5" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
