"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { formatNaira, FREE_DELIVERY_THRESHOLD } from "@/lib/format";
import { CartIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon, TruckIcon } from "./icons";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeFromCart, cartSubtotal } =
    useStore();

  if (!cartOpen) return null;

  const progress = Math.min(100, (cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const remaining = FREE_DELIVERY_THRESHOLD - cartSubtotal;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="animate-overlay-in absolute inset-0 bg-ink-950/50"
        onClick={() => setCartOpen(false)}
      />
      <aside className="animate-drawer-in absolute right-0 top-0 flex h-full w-[26rem] max-w-[92vw] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <CartIcon className="h-5 w-5" /> Your cart
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-50"
          >
            <CloseIcon />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-400">
              <CartIcon className="h-8 w-8" />
            </span>
            <p className="text-lg font-bold text-ink-900">Your cart is empty</p>
            <p className="text-sm text-ink-500">
              Browse our scrubs, lab coats and more — made for healthcare heroes.
            </p>
            <Link
              href="/shop"
              onClick={() => setCartOpen(false)}
              className="mt-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-ink-100 px-5 py-3">
              <p className="flex items-center gap-2 text-xs font-medium text-ink-600">
                <TruckIcon className="h-4 w-4 text-brand-600" />
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
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="nice-scroll flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
              {cart.map((line) => (
                <li key={line.key} className="flex gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold leading-snug text-ink-900">
                          {line.name}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {line.color} · Size {line.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(line.key)}
                        aria-label="Remove item"
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-ink-200">
                        <button
                          onClick={() => updateQty(line.key, line.qty - 1)}
                          className="p-1.5 px-2 text-ink-600 hover:text-brand-700"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold">
                          {line.qty}
                        </span>
                        <button
                          onClick={() => updateQty(line.key, line.qty + 1)}
                          className="p-1.5 px-2 text-ink-600 hover:text-brand-700"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-ink-900">
                        {formatNaira(line.price * line.qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink-100 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">Subtotal</span>
                <span className="text-lg font-bold text-ink-900">
                  {formatNaira(cartSubtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                Delivery calculated at checkout.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="rounded-full border border-ink-200 px-4 py-2.5 text-center text-sm font-bold text-ink-800 hover:border-ink-400"
                >
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-brand-700"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
