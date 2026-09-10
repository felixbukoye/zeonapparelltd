"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { CloseIcon, MenuIcon, UserIcon, WhatsAppIcon } from "./icons";
import { WHATSAPP_NUMBER } from "@/lib/format";

const NAV = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/coordinator", label: "Outfit your team" },
  { href: "/track", label: "Track order" },
  { href: "/discovery", label: "Discovery" },
  { href: "/about", label: "Community" },
];

export function Logo({ dark }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-xl font-black ${
          dark ? "bg-gold-500 text-navy-950" : "bg-navy-900 text-white"
        }`}
      >
        Z
      </span>
      <span className="leading-tight">
        <span
          className={`block font-display text-xl font-black tracking-tight ${dark ? "text-white" : "text-navy-900"}`}
        >
          ZEON
        </span>
        <span
          className={`block text-[10px] font-bold uppercase tracking-[0.22em] ${dark ? "text-gold-400" : "text-primary-600"}`}
        >
          Healthcare Apparels
        </span>
      </span>
    </span>
  );
}

export default function Header() {
  const { user } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const onDarkHero = pathname === "/";

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-navy-950 text-white">
        <p className="mx-auto max-w-[1200px] px-4 py-2 text-center text-xs font-medium tracking-wide sm:text-[13px]">
          Made-to-order in Lagos · Free size exchanges ·{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello ZEON! I have a question 🙏")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gold-300 underline underline-offset-2 hover:text-gold-200"
          >
            Chat with us on WhatsApp
          </a>
        </p>
      </div>

      <div
        className={`border-b backdrop-blur ${
          onDarkHero
            ? "border-white/10 bg-navy-950/90"
            : "border-line bg-white/95"
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3">
          <button
            className={`rounded-xl p-2.5 lg:hidden ${onDarkHero ? "text-white hover:bg-white/10" : "text-navy-900 hover:bg-paper"}`}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <Link href="/" aria-label="ZEON home">
            <Logo dark={onDarkHero} />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? onDarkHero
                        ? "bg-white/10 text-gold-300"
                        : "bg-primary-50 text-primary-700"
                      : onDarkHero
                        ? "text-white/80 hover:bg-white/5 hover:text-white"
                        : "text-navy-700 hover:bg-paper"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={user ? "/coordinator/account" : "/login"}
              className={`hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition sm:inline-flex ${
                onDarkHero
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-navy-800 hover:bg-paper"
              }`}
            >
              <UserIcon className="h-4.5 w-4.5" />
              {user ? user.name.split(" ")[0] : "Sign in"}
            </Link>
            <Link
              href="/catalogue"
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                onDarkHero
                  ? "bg-gold-500 text-navy-950 hover:bg-gold-400"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              }`}
            >
              Shop as an individual
            </Link>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-overlay-in absolute inset-0 bg-navy-950/60"
            onClick={() => setMenuOpen(false)}
          />
          <div className="animate-sheet-up absolute inset-x-4 top-4 rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between px-2 py-1">
              <Logo />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-xl p-2.5 text-navy-800 hover:bg-paper"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...NAV].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[15px] font-semibold ${
                    pathname === item.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-navy-800 hover:bg-paper"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={user ? "/coordinator/account" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-semibold text-navy-800 hover:bg-paper"
              >
                {user ? `Hi, ${user.name.split(" ")[0]} — My account` : "Sign in / Create account"}
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-[15px] font-bold text-white"
              >
                <WhatsAppIcon className="h-5 w-5" /> Talk to Sales
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
