"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button, Field, InlineBanner, Stepper, inputCls } from "@/components/ui";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

const STEPS = ["Your account", "Your organisation", "Done"];
const ORG_TYPES = ["Hospital", "Clinic", "Laboratory", "Pharmacy", "Nursing school", "HMO / Corporate", "Other"];

export default function CoordinatorSetup() {
  const router = useRouter();
  const { refreshUser } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    orgName: "",
    orgType: "Hospital",
  });
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function patch(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  function next() {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError("Add your name, email and a password to continue.");
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        setError("That email doesn't look right — Gmail is fine too.");
        return;
      }
      if (form.password.length < 6) {
        setError("Password needs at least 6 characters.");
        return;
      }
    }
    if (step === 1 && !form.orgName.trim()) {
      setError("Tell us your organisation's name.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  }

  async function finish() {
    if (!terms) {
      setError("Please accept the terms so we can get you set up.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "coordinator" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create your account.");
      await refreshUser();
      setStep(2);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
        Outfit your team
      </p>
      <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">
        {step === 2 ? "You're all set! 🎉" : "Create your coordinator account"}
      </h1>

      <Stepper steps={STEPS} current={step} className="mt-5" />

      <div className="mt-5 rounded-2xl border border-line bg-white p-5 sm:p-7">
        {step === 0 && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Your full name">
                <input value={form.name} onChange={(e) => patch("name", e.target.value)} placeholder="e.g. Dr. Emeka Obi" className={inputCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Email" hint="Your institution email — Gmail works too.">
                <input type="email" value={form.email} onChange={(e) => patch("email", e.target.value)} placeholder="you@hospital.com" className={inputCls} />
              </Field>
            </div>
            <Field label="Password">
              <input type="password" value={form.password} onChange={(e) => patch("password", e.target.value)} placeholder="Min. 6 characters" className={inputCls} />
            </Field>
            <Field label="Phone" optional>
              <input value={form.phone} onChange={(e) => patch("phone", e.target.value)} placeholder="0801…" className={inputCls} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3.5">
            <Field label="Organisation name">
              <input value={form.orgName} onChange={(e) => patch("orgName", e.target.value)} placeholder="e.g. Eko Hospital, Ikeja" className={inputCls} />
            </Field>
            <Field label="Organisation type">
              <div className="flex flex-wrap gap-2">
                {ORG_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => patch("orgType", t)}
                    aria-pressed={form.orgType === t}
                    className={`min-h-[44px] rounded-full px-4 text-[13px] font-bold transition ${
                      form.orgType === t
                        ? "bg-navy-900 text-white"
                        : "bg-paper text-navy-800 hover:bg-line"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-paper p-4">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-1 h-5 w-5 accent-blue-700"
              />
              <span className="text-sm text-navy-900">
                I agree to the{" "}
                <Link href="/terms" className="font-bold text-primary-700 underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-bold text-primary-700 underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <span className="animate-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckIcon className="h-8 w-8" />
            </span>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-mist-500">
              Welcome aboard, {form.name.split(" ")[0] || "friend"}! Next up:
              build your first collection, then create a team order in minutes.
            </p>
            <div className="mt-6 grid gap-2.5">
              <Button onClick={() => router.push("/coordinator/collections/new")} fullWidth>
                Build my first collection <ArrowRightIcon className="h-4 w-4" />
              </Button>
              <Button variant="secondary" onClick={() => router.push("/coordinator")} fullWidth>
                Go to my dashboard
              </Button>
            </div>
          </div>
        )}

        {error && step < 2 && (
          <InlineBanner tone="error" className="mt-4 font-semibold">{error}</InlineBanner>
        )}

        {step < 2 && (
          <div className="mt-5 flex gap-2.5">
            {step > 0 && (
              <Button variant="secondary" onClick={() => { setStep((s) => s - 1); setError(""); }}>
                ← Back
              </Button>
            )}
            {step === 0 ? (
              <Button onClick={next} fullWidth>
                Continue <ArrowRightIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={loading} fullWidth>
                {loading ? "Creating…" : "Create my account 🎉"}
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-mist-500">
        Prefer to start on WhatsApp instead?{" "}
        <a
          href="https://wa.me/2348012345678?text=Hello%20ZEON!%20I%27d%20like%20to%20outfit%20my%20team%20🏥"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-primary-700 underline"
        >
          Chat with Sales
        </a>{" "}
        — we&apos;ll set everything up with you.
      </p>
      <p className="mt-2 text-center text-sm text-mist-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary-700 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
