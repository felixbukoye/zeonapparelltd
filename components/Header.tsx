"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES } from "@/lib/format";
import {
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { cartCount, wishlist, user, setCartOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink-900 text-white">
        <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium tracking-wide sm:text-[13px]">
          Free nationwide delivery on orders over ₦200,000 · Hospitals &amp;
          clinics:{" "}
          <Link href="/wholesale" className="underline underline-offset-2 hover:text-brand-200">
            wholesale programme
          </Link>
        </p>
      </div>

      <div className="border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:gap-6">
          <button
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-50 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-black text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v16M5 8.5h14" />
                <path d="M7 20.5h10" strokeWidth={2} />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block text-xl font-black tracking-tight text-ink-900">
                ZEON
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600">
                Apparel Ltd
              </span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            <div className="group relative">
              <Link
                href="/shop"
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-ink-50 ${
                  pathname?.startsWith("/shop") || pathname?.startsWith("/product")
                    ? "text-brand-700"
                    : "text-ink-700"
                }`}
              >
                Shop <ChevronDownIcon className="h-4 w-4" />
              </Link>
              <div className="invisible absolute left-0 top-full w-56 translate-y-1 rounded-2xl border border-ink-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <Link
                  href="/shop"
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink-800 hover:bg-brand-50 hover:text-brand-700"
                >
                  All products
                </Link>
                {CATEGORIES.map((c) => (
                  <Link
                    key={c}
                    href={`/shop?category=${encodeURIComponent(c)}`}
                    className="block rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
            {NAV.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-ink-50 ${
                  pathname === item.href ? "text-brand-700" : "text-ink-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="rounded-full p-2.5 text-ink-700 transition hover:bg-ink-50 hover:text-brand-700"
            >
              <SearchIcon />
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative rounded-full p-2.5 text-ink-700 transition hover:bg-ink-50 hover:text-brand-700"
            >
              <HeartIcon />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              aria-label="Account"
              className="hidden rounded-full p-2.5 text-ink-700 transition hover:bg-ink-50 hover:text-brand-700 sm:block"
            >
              <UserIcon />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <CartIcon className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-ink-900">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-ink-100 bg-white">
            <form
              onSubmit={submitSearch}
              className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3"
            >
              <SearchIcon className="h-5 w-5 text-ink-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scrubs, lab coats, clogs…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-overlay-in absolute inset-0 bg-ink-950/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="animate-drawer-in absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl" style={{ animationName: "drawer-in", transform: "scaleX(-1)" }}>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4" style={{ transform: "scaleX(-1)" }}>
              <span className="text-lg font-black text-ink-900">ZEON <span className="text-brand-600">Apparel</span></span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-ink-600 hover:bg-ink-50"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto p-4" style={{ transform: "scaleX(-1)" }}>
              {[{ href: "/", label: "Home" }, ...NAV].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[15px] font-semibold ${
                    pathname === item.href
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-semibold text-ink-700 hover:bg-ink-50"
              >
                {user ? `Hi, ${user.name.split(" ")[0]} — My Account` : "Sign in / Register"}
              </Link>
              <Link
                href="/track"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-semibold text-ink-700 hover:bg-ink-50"
              >
                Track my order
              </Link>
            </nav>
            <div className="mt-auto border-t border-ink-100 p-4" style={{ transform: "scaleX(-1)" }}>
              <p className="text-xs text-ink-500">Need help? Call us</p>
              <p className="text-sm font-bold text-ink-900">+234 801 234 5678</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
