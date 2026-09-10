"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItemInput, SafeUser } from "@/lib/types";

interface CartLine extends CartItemInput {
  key: string;
}

interface StoreState {
  cart: CartLine[];
  wishlist: string[];
  user: SafeUser | null;
  authLoading: boolean;
  cartOpen: boolean;
  cartCount: number;
  cartSubtotal: number;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: CartItemInput) => void;
  updateQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreState | null>(null);

function lineKey(item: CartItemInput): string {
  return `${item.productId}__${item.size}__${item.color}`;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() =>
    load<CartLine[]>("zeon_cart", [])
  );
  const [wishlist, setWishlist] = useState<string[]>(() =>
    load<string[]>("zeon_wishlist", [])
  );
  const [user, setUser] = useState<SafeUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("zeon_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem("zeon_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const addToCart = useCallback((item: CartItemInput) => {
    const key = lineKey(item);
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: l.qty + item.qty } : l
        );
      }
      return [...prev, { ...item, key }];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty } : l))
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const value = useMemo<StoreState>(() => {
    const cartCount = cart.reduce((s, l) => s + l.qty, 0);
    const cartSubtotal = cart.reduce((s, l) => s + l.qty * l.price, 0);
    return {
      cart,
      wishlist,
      user,
      authLoading,
      cartOpen,
      cartCount,
      cartSubtotal,
      setCartOpen,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
      refreshUser,
      logout,
    };
  }, [
    cart,
    wishlist,
    user,
    authLoading,
    cartOpen,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted,
    refreshUser,
    logout,
  ]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
