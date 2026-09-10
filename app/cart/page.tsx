"use client";

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { useStore } from "@/context/StoreContext";
import { formatNaira, FREE_DELIVERY_THRESHOLD } from "@/lib/format";
import { CartIcon, MinusIcon, PlusIcon, TrashIcon, TruckIcon, ArrowRightIcon } from "@/components/icons";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, cartSubtotal } = useStore();
  const remaining = FREE_DELIVERY_THRESHOLD - cartSubtotal;
  const progress = Math.min(100, (cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">Shopping cart</h1>
      <p className="mt-1 text-sm text-ink-500">
        {cart.length === 0
          ? "Your cart is empty."
          : `${cart.reduce((s, l) => s + l.qty, 0)} item(s) in your cart.`}
      </p>

      {cart.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-white px-8 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-400">
            <CartIcon className="h-8 w-8" />
          </span>
          <p className="text-lg font-bold text-ink-900">Nothing here yet</p>
          <p className="max-w-sm text-sm text-ink-500">
            Explore scrubs, lab coats, clogs and more — tailored for healthcare
            professionals.
          </p>
          <Link
            href="/shop"
            className="mt-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-bold text-white hover:bg-brand-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <TruckIcon className="h-5 w-5 text-brand-600" />
                {remaining > 0 ? (
                  <span>
                    Add <strong>{formatNaira(remaining)}</strong> more for free
                    nationwide delivery
                  </span>
                ) : (
                  <span className="font-bold text-brand-700">
                    You&apos;ve unlocked FREE nationwide delivery!
                  </span>
                )}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white px-5">
              {cart.map((line) => (
                <li key={line.key} className="flex gap-4 py-5 sm:gap-5">
                  <Link
                    href={`/product/${line.slug}`}
                    className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-ink-50"
                  >
                    <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col sm:flex-row sm:gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/product/${line.slug}`}
                        className="font-bold text-ink-900 hover:text-brand-700"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-500">
                        {line.color} · Size {line.size}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink-700">
                        {formatNaira(line.price)} each
                      </p>
                      <button
                        onClick={() => removeFromCart(line.key)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ink-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-end sm:justify-center sm:gap-3">
                      <div className="flex items-center rounded-full border border-ink-200">
                        <button
                          onClick={() => updateQty(line.key, line.qty - 1)}
                          className="p-2 px-2.5 text-ink-600 hover:text-brand-700"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-bold">{line.qty}</span>
                        <button
                          onClick={() => updateQty(line.key, line.qty + 1)}
                          className="p-2 px-2.5 text-ink-600 hover:text-brand-700"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-black text-ink-900">
                        {formatNaira(line.price * line.qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <Link href="/shop" className="text-sm font-bold text-brand-700 hover:underline">
                ← Continue shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-sm font-semibold text-ink-400 hover:text-red-600"
              >
                Clear cart
              </button>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-6 lg:sticky lg:top-32">
            <h2 className="font-black text-ink-900">Order summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-bold text-ink-900">{formatNaira(cartSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Delivery</dt>
                <dd className="font-semibold text-ink-700">Calculated at checkout</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
            >
              Proceed to checkout <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-ink-400">
              Secure checkout · Pay on delivery available in Lagos
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

