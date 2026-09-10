"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  BellIcon,
  CloseIcon,
  MenuIcon,
  SlidersIcon,
  WhatsAppIcon,
} from "./icons";
import { Avatar } from "./ui";
import { WHATSAPP_NUMBER } from "@/lib/format";

const NAV = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/coordinator", label: "Outfit your team" },
  { href: "/track", label: "Track order" },
  { href: "/discovery", label: "Discovery" },
  { href: "/about", label: "Community" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary font-display text-xl font-black text-white shadow-[0_6px_16px_rgb(59_110_246/0.35)]">
        Z
      </span>
      <span className="leading-tight">
        <span className="block font-display text-xl font-black tracking-tight text-navy-900">
          ZEON
        </span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-primary-600">
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

  return (
    <header className="sticky top-0 z-40">
      {/* Slim reassurance strip */}
      <div className="bg-navy-950 text-white">
        <p className="mx-auto max-w-[1200px] px-4 py-2 text-center text-xs font-medium tracking-wide sm:text-[13px]">
          Made-to-order in Lagos · Free size exchanges ·{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello ZEON! I have a question 🙏")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary-200 underline underline-offset-2 hover:text-white"
          >
            Chat with us on WhatsApp
          </a>
        </p>
      </div>

      {/* Top bar: logo → pill nav → utilities + avatar */}
      <div className="border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3">
          <button
            className="rounded-full p-2.5 text-navy-900 hover:bg-paper lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <Link href="/" aria-label="ZEON home" className="shrink-0">
            <Logo />
          </Link>

          {/* Pill tabs — active = solid blue, inactive = quiet gray */}
          <nav
            aria-label="Primary"
            className="ml-4 hidden items-center gap-1 lg:flex"
          >
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`min-h-[40px] rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-primary font-bold text-white shadow-[0_4px_14px_rgb(59_110_246/0.35)]"
                      : "font-semibold text-mist-500 hover:bg-paper hover:text-navy-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-mist-500 transition hover:bg-paper hover:text-navy-900 sm:flex"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <Link
              href="/coordinator/account"
              aria-label="Settings"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-mist-500 transition hover:bg-paper hover:text-navy-900 sm:flex"
            >
              <SlidersIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/track"
              aria-label="Notifications"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-mist-500 transition hover:bg-paper hover:text-navy-900 sm:flex"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            </Link>
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
            <Link
              href={user ? "/coordinator/account" : "/login"}
              className="flex min-h-[44px] items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-paper sm:pr-3"
              aria-label={user ? `Signed in as ${user.name}` : "Sign in"}
            >
              {user ? (
                <>
                  <Avatar name={user.name} size="sm" />
                  <span className="hidden text-sm font-bold text-navy-900 md:block">
                    {user.name.split(" ")[0]}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-xs font-bold text-mist-500">
                    ?
                  </span>
                  <span className="hidden text-sm font-bold text-navy-900 md:block">
                    Sign in
                  </span>
                </>
              )}
            </Link>
            <Link
              href="/catalogue"
              className="ml-1 hidden min-h-[44px] items-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgb(59_110_246/0.35)] transition hover:bg-primary-600 md:inline-flex"
            >
              + Shop styles
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
          <div className="animate-sheet-up absolute inset-x-4 top-4 rounded-card bg-white p-4 shadow-pop">
            <div className="flex items-center justify-between px-2 py-1">
              <Logo />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2.5 text-navy-800 hover:bg-paper"
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
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`rounded-full px-4 py-3 text-[15px] ${
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href))
                      ? "bg-primary font-bold text-white"
                      : "font-semibold text-navy-800 hover:bg-paper"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={user ? "/coordinator/account" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="rounded-full px-4 py-3 text-[15px] font-semibold text-navy-800 hover:bg-paper"
              >
                {user ? `Hi, ${user.name.split(" ")[0]} — My account` : "Sign in / Create account"}
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-[15px] font-bold text-white"
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
