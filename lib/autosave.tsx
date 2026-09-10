"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Load a previously autosaved form state (offline-tolerant forms). */
export function loadSaved<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Silently autosaves `value` to localStorage after a pause in input.
 * Returns a `saved` flag that flashes true briefly after each write —
 * render a small "Saved ✓" indicator from it, never a toast per keystroke.
 */
export function useAutosave<T>(
  key: string,
  value: T,
  delay = 900
): { saved: boolean; clear: () => void } {
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        setSaved(true);
        if (flashTimer.current) window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setSaved(false), 2200);
      } catch {
        /* storage full / unavailable — stay silent */
      }
    }, delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [key, value, delay]);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  }, [key]);

  return { saved, clear };
}

export function SavedIndicator({ show }: { show: boolean }) {
  if (!show) return <span className="text-xs text-transparent">Saved ✓</span>;
  return (
    <span className="animate-toast-in text-xs font-semibold text-success">
      Saved ✓
    </span>
  );
}
