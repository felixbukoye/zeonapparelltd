"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SafeUser } from "@/lib/types";
import { BoxIcon, BuildingIcon, ChatIcon, UserIcon } from "@/components/icons";
import { Avatar } from "@/components/ui";

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
        <div className="skeleton h-8 w-1/3 !rounded-full" />
        <div className="skeleton h-24 w-full !rounded-card" />
        <div className="skeleton h-24 w-full !rounded-card" />
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1200px] px-4 py-6 pb-24 sm:py-8 lg:pb-10">
        <div className="grid gap-5 lg:grid-cols-[232px_1fr]">
          {/* Desktop left rail */}
          <aside className="hidden lg:block">
            <nav
              aria-label="Coordinator"
              className="card sticky top-32 space-y-1 p-3"
            >
              <div className="flex items-center gap-3 px-2 pb-3 pt-1">
                <Avatar name={user.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-navy-900">
                    {user.name.split(" ")[0]}
                  </p>
                  <p className="truncate text-[11px] text-mist-400">
                    {user.orgName || "Coordinator"}
                  </p>
                </div>
              </div>
              {LINKS.map((l) => {
                const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[48px] items-center gap-3 rounded-full px-4 text-sm transition ${
                      active
                        ? "bg-primary font-bold text-white shadow-[0_4px_14px_rgb(59_110_246/0.35)]"
                        : "font-semibold text-mist-500 hover:bg-paper hover:text-navy-900"
                    }`}
                  >
                    <l.icon className="h-5 w-5" />
                    {l.label}
                  </Link>
                );
              })}
              <div className="px-2 pb-1 pt-3">
                <Link
                  href="/coordinator/orders/new"
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary-50 px-4 text-sm font-bold text-primary-700 transition hover:bg-primary-100"
                >
                  + New order
                </Link>
              </div>
            </nav>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>

        {/* Mobile bottom tab bar */}
        <nav
          aria-label="Coordinator"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden"
        >
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] ${
                    active ? "bg-primary font-bold text-white" : "font-semibold text-mist-400"
                  }`}
                >
                  <l.icon className="h-5 w-5" />
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
