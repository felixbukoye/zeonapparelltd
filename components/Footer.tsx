"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/format";
import { CheckIcon, MailIcon, PhoneIcon, PinIcon } from "./icons";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-ink-950 text-ink-200">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-black text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v16M5 8.5h14" />
                  <path d="M7 20.5h10" strokeWidth={2} />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block text-xl font-black tracking-tight text-white">ZEON</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-brand-300">
                  Apparel Ltd
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
              Premium healthcare apparel designed for Nigerian professionals —
              tailored in Lagos, worn in hospitals across the country.
            </p>
            <div className="mt-5 space-y-2.5 text-sm">
              <p className="flex items-start gap-2.5">
                <PinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-400" />
                14 Ogudu Road, Ikeja,
                Lagos, Nigeria
              </p>
              <p className="flex items-center gap-2.5">
                <PhoneIcon className="h-4.5 w-4.5 shrink-0 text-brand-400" />
                +234 801 234 5678
              </p>
              <p className="flex items-center gap-2.5">
                <MailIcon className="h-4.5 w-4.5 shrink-0 text-brand-400" />
                hello@zeonapparelltd.com
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/shop" className="hover:text-white">All products</Link>
              </li>
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(c)}`}
                    className="hover:text-white"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/track" className="hover:text-white">Track my order</Link></li>
              <li><Link href="/shipping" className="hover:text-white">Shipping &amp; returns</Link></li>
              <li><Link href="/size-guide" className="hover:text-white">Size guide</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
              <li><Link href="/wholesale" className="hover:text-white">Wholesale programme</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Stay in the loop</h3>
            <p className="mt-4 text-sm text-ink-300">
              New arrivals, restocks and exclusive offers for healthcare workers.
            </p>
            {subscribed ? (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-900/60 px-4 py-3 text-sm font-semibold text-brand-200">
                <CheckIcon className="h-5 w-5" /> You&apos;re subscribed. Welcome!
              </p>
            ) : (
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-ink-400 focus:border-brand-400"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500"
                >
                  Join
                </button>
              </form>
            )}
            <div className="mt-5 flex gap-2 text-xs text-ink-400">
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Zeon Apparel Ltd. All rights reserved.</p>
          <p>Designed &amp; tailored in Lagos, Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
