"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Button, Field, InlineBanner, inputCls } from "@/components/ui";
import { LogoutIcon } from "@/components/icons";

export default function CoordinatorAccount() {
  const { user, refreshUser, logout } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", orgName: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        orgName: user.orgName ?? "",
      });
    }
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Could not save.");
      await refreshUser();
      setMsg("Saved ✓ — looking good.");
    } catch {
      setMsg("Could not save — try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-black tracking-tight text-navy-900">
        Account
      </h1>
      <p className="mt-1 text-sm text-mist-500">{user?.email}</p>

      <form onSubmit={save} className="mt-5 space-y-3.5 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-black text-navy-900">
          Contact &amp; organisation
        </h2>
        <Field label="Your name">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Organisation">
          <input value={form.orgName} onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))} className={inputCls} />
        </Field>
        {msg && <InlineBanner tone="success" className="font-semibold">{msg}</InlineBanner>}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <div className="mt-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-base font-black text-navy-900">Security</h2>
        <p className="mt-1 text-sm text-mist-500">
          Need to change your password or email? Message us on WhatsApp and
          we&apos;ll verify and update it with you — usually within the hour.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          <LogoutIcon className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}
