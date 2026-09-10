"use client";

import { useState } from "react";
import Link from "next/link";
import FitAssistant, {
  EMPTY_FIT,
  fitComplete,
  fitSummary,
  type FitValue,
} from "@/components/FitAssistant";
import { Button, ButtonLink, Field, InlineBanner, inputCls } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export default function FitAssistantPage() {
  const [fit, setFit] = useState<FitValue>(EMPTY_FIT);
  const [identity, setIdentity] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error" | "loading">("idle");
  const [message, setMessage] = useState("");

  async function loadProfile() {
    if (!identity.trim()) {
      setStatus("error");
      setMessage("Enter the email or phone number you used before.");
      return;
    }
    setStatus("loading");
    setMessage("");
    const res = await fetch(`/api/size-profiles?identity=${encodeURIComponent(identity.trim())}`);
    const data = await res.json();
    if (data.profile) {
      setFit({
        sizeMode: data.profile.sizeMode,
        size: data.profile.size,
        fit: data.profile.fit,
        measurements: data.profile.measurements ?? {},
        helper: data.profile.helper ?? {},
      });
      setStatus("done");
      setMessage(`Welcome back${data.profile.name ? `, ${data.profile.name.split(" ")[0]}` : ""}! We loaded your Size Profile — update anything that's changed.`);
    } else {
      setStatus("error");
      setMessage("We couldn't find a profile for that — no wahala, let's create one now.");
    }
  }

  async function save() {
    if (!fitComplete(fit)) {
      setStatus("error");
      setMessage("Finish your sizing above first — then we'll save it.");
      return;
    }
    if (!identity.trim()) {
      setStatus("error");
      setMessage("Add your email or phone number so we can find your profile next time.");
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/size-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, name, ...fit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setMessage(`Saved! Your Size Profile (${fitSummary(fit)}) is ready — use it in any order without re-measuring.`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
        Fit Assistant
      </p>
      <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">
        Your size, saved forever
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-mist-500">
        Build your reusable Size Profile once — preset chart or manual
        measurements, fitted or relaxed — and skip sizing in every future
        order. One day this same screen becomes AR try-on; your profile carries
        over.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-7">
        <FitAssistant
          value={fit}
          onChange={setFit}
          identityNote="Add your email or phone below and we'll tie this profile to you."
        />

        <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
          <Field label="Your name" optional>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Adaeze" className={inputCls} />
          </Field>
          <Field label="Email or phone" hint="This is how we find your profile next time.">
            <input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </Field>
        </div>

        {message && (
          <InlineBanner tone={status === "done" ? "success" : "error"} className="mt-4 font-semibold">
            {message}
          </InlineBanner>
        )}

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <Button variant="secondary" onClick={loadProfile} disabled={status === "loading"}>
            {status === "loading" ? "Looking…" : "Load my saved profile"}
          </Button>
          <Button onClick={save} disabled={status === "saving"}>
            {status === "saving" ? (
              "Saving…"
            ) : (
              <>
                <CheckIcon className="h-4 w-4" /> Save my Size Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        <ButtonLink href="/order/individual" variant="secondary">
          Use it in an order →
        </ButtonLink>
        <Link href="/catalogue" className="inline-flex min-h-[44px] items-center px-4 text-sm font-bold text-primary-700 hover:underline">
          Browse styles
        </Link>
      </div>
    </div>
  );
}
