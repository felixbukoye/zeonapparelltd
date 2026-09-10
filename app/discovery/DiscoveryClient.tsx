"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { DiscoveryMode } from "@/lib/types";
import { loadSaved, useAutosave } from "@/lib/autosave";
import VoiceRecorder from "@/components/VoiceRecorder";
import {
  Button,
  ButtonLink,
  Field,
  InlineBanner,
  SectionProgress,
  inputCls,
} from "@/components/ui";
import { ChatIcon, CheckIcon, MicIcon, PointsIcon } from "@/components/icons";

interface Q {
  section: number;
  text: string;
  deep?: boolean;
}

const SECTIONS = [
  "Warm-up",
  "Apparel experience",
  "Work & community",
  "Technology & shopping",
  "The dream",
];

const FULL_QUESTIONS: Q[] = [
  { section: 1, text: "First things first — what should we call you? 😊" },
  { section: 1, text: "What do you do, and where do you work?" },
  { section: 1, text: "What's one thing you genuinely love about your work?" },
  { section: 2, text: "Walk us through your current workwear — what do you wear on a typical shift?", deep: true },
  { section: 2, text: "What's the single most annoying thing about it?", deep: true },
  { section: 2, text: "Tell us about a time your uniform really let you down.", deep: true },
  { section: 3, text: "Who do you gist with most during a shift?" },
  { section: 3, text: "Is there a community — online or offline — where you talk shop with colleagues?" },
  { section: 4, text: "How do you usually shop for workwear today?" },
  { section: 4, text: "How comfortable are you ordering things on your phone?" },
  { section: 5, text: "If you could design your perfect scrub from scratch, what would it look like?" },
  { section: 5, text: "Last one, and it's fun: give your ideal scrub a name! ✨" },
];

const EMBEDDED_QUESTIONS: Q[] = [
  { section: 1, text: "What should we call you? 😊" },
  { section: 2, text: "What's the single most annoying thing about workwear you've worn?", deep: true },
  { section: 3, text: "Who do you gist with most during a shift?" },
  { section: 4, text: "How do you usually shop for workwear today?" },
  { section: 5, text: "Name your ideal scrub — give it a name! ✨" },
];

const MODE_INFO: Record<DiscoveryMode, { title: string; desc: string; time: string }> = {
  assisted: {
    title: "With an ambassador",
    desc: "A ZEON ambassador guides you on their device — just talk, we'll capture everything.",
    time: "~20 min",
  },
  guided: {
    title: "Chat with us",
    desc: "A relaxed chat here — type or send voice notes, skip anything you like.",
    time: "~10 min",
  },
  embedded: {
    title: "Quick version",
    desc: "Just ordered? Five short questions, pre-filled where we already know you.",
    time: "~3 min",
  },
};

interface Turn {
  q: string;
  section: number;
  answer: string;
  skipped: boolean;
  voiceNote: boolean;
}

export default function DiscoveryClient() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"entry" | "chat" | "thanks">("entry");
  const [mode, setMode] = useState<DiscoveryMode>(
    (searchParams.get("mode") as DiscoveryMode) || "guided"
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [ambassador, setAmbassador] = useState("");
  const [orderCode, setOrderCode] = useState(searchParams.get("order") ?? "");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>(() => loadSaved<Turn[]>("zeon_discovery_turns") ?? []);
  const [queue, setQueue] = useState<Q[]>([]);
  const [answer, setAnswer] = useState("");
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [probed, setProbed] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [optIn, setOptIn] = useState(true);
  const { clear } = useAutosave("zeon_discovery_turns", turns);

  const questions = useMemo(
    () => (mode === "embedded" ? EMBEDDED_QUESTIONS : FULL_QUESTIONS),
    [mode]
  );

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "assisted" || m === "guided" || m === "embedded") setMode(m);
    const o = searchParams.get("order");
    if (o) setOrderCode(o);
  }, [searchParams]);

  const current = queue[0];
  const answeredSections = new Set(turns.map((t) => t.section));

  async function start() {
    setError("");
    if (mode === "assisted" && !ambassador.trim()) {
      setError("Ambassadors — add your name so we credit your interviews.");
      return;
    }
    setStarting(true);
    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, name, contact, ambassador, orderCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSessionId(data.session.id);
      setQueue(questions);
      setTurns([]);
      setPhase("chat");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start.");
    } finally {
      setStarting(false);
    }
  }

  async function persist(
    newTurns: Turn[],
    section: number,
    complete = false
  ) {
    if (!sessionId) return;
    await fetch(`/api/discovery/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: newTurns.slice(turns.length).map((t) => ({
          section: t.section,
          question: t.q,
          answer: t.answer,
          skipped: t.skipped,
          voiceNote: t.voiceNote,
        })),
        currentSection: Math.min(5, section),
        communityOptIn: complete ? optIn : undefined,
        complete,
      }),
    }).catch(() => undefined);
  }

  async function respond(skipped: boolean) {
    if (!current) return;
    if (!skipped && !answer.trim() && !voiceUsed) {
      setError("Type a little something — or tap Skip, no pressure at all.");
      return;
    }
    setError("");
    const turn: Turn = {
      q: current.text,
      section: current.section,
      answer: skipped ? "" : answer.trim() || "(voice note)",
      skipped,
      voiceNote: !skipped && voiceUsed,
    };
    const newTurns = [...turns, turn];
    const rest = queue.slice(1);
    setTurns(newTurns);
    setQueue(rest);
    setAnswer("");
    setVoiceUsed(false);
    setShowVoice(false);
    setProbed(false);
    if (rest.length === 0) {
      await persist(newTurns, 5);
      setPhase("thanks");
      setFinishing(true);
      await persist(newTurns, 5, true);
      setFinishing(false);
      clear();
      window.scrollTo({ top: 0 });
    } else {
      persist(newTurns, rest[0].section);
    }
  }

  function probe() {
    if (!current || probed) return;
    setProbed(true);
    setQueue([
      { section: current.section, text: "Tell me more about that 👇 — paint us the full picture.", deep: true },
      ...queue,
    ]);
  }

  /* --------------------------------- entry --------------------------------- */
  if (phase === "entry") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
          Discovery · Earn 100 ZEON Points
        </p>
        <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-900 sm:text-3xl">
          Let&apos;s talk workwear 🤍
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-500">
          Your answers shape what we sew next — real stories from real shifts.
          Every question is skippable, voice notes welcome, and it never feels
          like a form.
        </p>

        <div className="mt-6 grid gap-2.5" role="radiogroup" aria-label="Discovery mode">
          {(Object.keys(MODE_INFO) as DiscoveryMode[]).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setMode(m)}
                className={`rounded-2xl border-2 p-4 text-left transition sm:p-5 ${
                  on ? "border-primary-600 bg-primary-50/60" : "border-line bg-white hover:border-mist-300"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-display text-base font-black text-navy-900">
                    {on && <CheckIcon className="h-4.5 w-4.5 text-primary-600" />}
                    {MODE_INFO[m].title}
                  </span>
                  <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-bold text-mist-500">
                    {MODE_INFO[m].time}
                  </span>
                </span>
                <span className="mt-1 block text-sm text-mist-500">{MODE_INFO[m].desc}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-line bg-white p-5">
          {mode === "assisted" && (
            <Field label="Ambassador name">
              <input value={ambassador} onChange={(e) => setAmbassador(e.target.value)} placeholder="e.g. Kamsi (Lagos)" className={inputCls} />
            </Field>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name" optional>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" className={inputCls} />
            </Field>
            <Field label="Phone or email" optional hint="So we can credit your ZEON Points.">
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0801…" className={inputCls} />
            </Field>
          </div>
          {mode === "embedded" && (
            <Field label="Order code" optional hint="We pre-fill what we already know about your order.">
              <input value={orderCode} onChange={(e) => setOrderCode(e.target.value)} placeholder="ZND-…" className={inputCls} />
            </Field>
          )}
        </div>

        {error && (
          <InlineBanner tone="error" className="mt-4 font-semibold">{error}</InlineBanner>
        )}
        <Button onClick={start} disabled={starting} fullWidth className="mt-4 min-h-[52px]">
          {starting ? "Starting…" : "Start the conversation"}
        </Button>
        <p className="mt-3 text-center text-xs text-mist-400">
          5 easy sections · skip anything · ~{mode === "embedded" ? "3" : mode === "guided" ? "10" : "20"} minutes
        </p>
      </div>
    );
  }

  /* --------------------------------- thanks -------------------------------- */
  if (phase === "thanks") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
          <span className="animate-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
            <PointsIcon className="h-8 w-8" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-black text-navy-900">
            Thank you — that was gold 🙏
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mist-500">
            {finishing
              ? "Saving your last answers…"
              : `We've credited 100 ZEON Points to ${contact || name || "your profile"}. Your stories go straight into our design room.`}
          </p>
          <label className="mx-auto mt-5 flex max-w-sm cursor-pointer items-start gap-3 rounded-2xl bg-paper p-4 text-left">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-1 h-5 w-5 accent-blue-700"
            />
            <span className="text-sm text-navy-900">
              <strong>Join the ZEON community</strong>
              <span className="block text-[13px] text-mist-500">
                Early styles, fit panels and gist with HCPs across Nigeria.
              </span>
            </span>
          </label>
          <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
            <ButtonLink href="/catalogue">See what we&apos;re sewing</ButtonLink>
            <ButtonLink href="/" variant="secondary">Back home</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------- chat ---------------------------------- */
  const sectionLabel = current ? SECTIONS[current.section - 1] : "Done";
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <SectionProgress
        current={Math.max(1, current?.section ?? 5)}
        total={5}
        label={sectionLabel}
      />
      {mode === "assisted" && (
        <p className="mt-2 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-semibold text-gold-300">
          Ambassador mode{ambassador ? ` · ${ambassador}` : ""} — read each
          question aloud, capture the answer by text or voice.
        </p>
      )}

      <div className="mt-5 space-y-4">
        {turns.slice(-3).map((t, i) => (
          <div key={i} className="space-y-2 opacity-70">
            <div className="chat-bubble-in max-w-[85%] bg-white px-4 py-3 text-sm text-navy-900 shadow-sm">
              {t.q}
            </div>
            <div className="chat-bubble-out ml-auto max-w-[85%] bg-primary-600 px-4 py-3 text-sm text-white">
              {t.skipped ? <em>Skipped ⏭️</em> : t.answer}
              {!t.skipped && t.voiceNote && (
                <span className="mt-1 block text-xs opacity-80">🎙️ + voice note</span>
              )}
            </div>
          </div>
        ))}

        {current && (
          <div className="animate-fade-up space-y-2" key={`${current.section}-${current.text}`}>
            <div className="chat-bubble-in max-w-[92%] bg-white px-4 py-3.5 text-[15px] font-medium leading-relaxed text-navy-900 shadow-sm">
              {current.text}
            </div>
            {current.deep && !probed && (
              <button
                onClick={probe}
                className="min-h-[40px] rounded-full border border-primary-200 bg-primary-50 px-4 text-[13px] font-bold text-primary-700 hover:bg-primary-100"
              >
                💬 Tell me more
              </button>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 mt-6 rounded-2xl border border-line bg-white p-3.5 shadow-xl">
        {showVoice ? (
          <div className="space-y-2.5">
            <VoiceRecorder onCapture={() => setVoiceUsed(true)} />
            <button
              onClick={() => setShowVoice(false)}
              className="min-h-[40px] w-full text-[13px] font-bold text-mist-500 hover:text-navy-900"
            >
              Back to typing
            </button>
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            placeholder={voiceUsed ? "Voice note attached — add a few words if you like…" : "Type here… anything goes."}
            className="w-full resize-none rounded-xl bg-paper px-4 py-3 text-[15px] outline-none placeholder:text-mist-400 focus:ring-2 focus:ring-primary-100"
          />
        )}
        {error && <p className="mt-1.5 text-xs font-semibold text-error">{error}</p>}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={() => setShowVoice((v) => !v)}
            aria-label="Record a voice note"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              voiceUsed ? "bg-success text-white" : "bg-paper text-navy-800 hover:bg-line"
            }`}
          >
            <MicIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => respond(true)}
            className="min-h-[44px] shrink-0 rounded-xl px-4 text-sm font-bold text-mist-500 hover:bg-paper hover:text-navy-900"
          >
            Skip ⏭️
          </button>
          <Button onClick={() => respond(false)} fullWidth className="min-h-[48px]">
            Send
          </Button>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-mist-400">
        <ChatIcon className="h-3.5 w-3.5" />
        {answeredSections.size} of 5 sections touched · everything autosaves
      </p>
    </div>
  );
}
