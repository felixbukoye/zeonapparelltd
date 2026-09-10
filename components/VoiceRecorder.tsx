"use client";

import { useEffect, useRef, useState } from "react";
import { AlertIcon, MicIcon, PauseIcon, PlayIcon, RefreshIcon } from "./icons";

type Phase = "idle" | "recording" | "recorded" | "playing" | "denied" | "unsupported";

export default function VoiceRecorder({
  onCapture,
}: {
  onCapture?: (info: { seconds: number }) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);

  useEffect(() => {
    if (typeof MediaRecorder === "undefined") setPhase("unsupported");
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    };
  }, []);

  function tick() {
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  async function start() {
    setSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType });
        if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
        audioUrl.current = URL.createObjectURL(blob);
        setPhase("recorded");
        onCapture?.({ seconds });
      };
      mediaRecorder.current = rec;
      rec.start();
      setPhase("recording");
      tick();
    } catch {
      setPhase("denied");
    }
  }

  function stop() {
    if (timer.current) window.clearInterval(timer.current);
    mediaRecorder.current?.stop();
  }

  function play() {
    if (!audioUrl.current) return;
    if (!audioRef.current) audioRef.current = new Audio(audioUrl.current);
    const a = audioRef.current;
    a.ontimeupdate = () => {
      if (a.duration) setProgress((a.currentTime / a.duration) * 100);
    };
    a.onended = () => {
      setPhase("recorded");
      setProgress(0);
    };
    a.play();
    setPhase("playing");
  }

  function pause() {
    audioRef.current?.pause();
    setPhase("recorded");
  }

  function rerecord() {
    audioRef.current?.pause();
    setProgress(0);
    setSeconds(0);
    setPhase("idle");
  }

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  if (phase === "unsupported") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-paper px-4 py-3 text-xs text-mist-500">
        <AlertIcon className="h-4 w-4" />
        Voice notes aren&apos;t supported on this device — typing works just as well.
      </p>
    );
  }

  if (phase === "denied") {
    return (
      <div className="rounded-xl bg-paper px-4 py-3 text-xs leading-relaxed text-mist-500">
        <p className="flex items-center gap-2 font-bold text-navy-900">
          <AlertIcon className="h-4 w-4 text-amber-600" />
          Microphone blocked
        </p>
        <p className="mt-1">
          Your browser blocked the microphone. Allow access to record — or just
          type your answer instead.{" "}
          <button onClick={() => setPhase("idle")} className="font-bold text-primary-600 underline">
            Try again
          </button>
        </p>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={start}
        className="flex min-h-[52px] w-full select-none items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-mist-300 px-4 text-sm font-bold text-navy-800 transition hover:border-primary-400 hover:bg-primary-50"
      >
        <MicIcon className="h-5 w-5" />
        Tap to record a voice note 🎙️
      </button>
    );
  }

  if (phase === "recording") {
    return (
      <button
        type="button"
        onClick={stop}
        className="flex min-h-[52px] w-full animate-pulse items-center justify-center gap-2.5 rounded-xl bg-red-50 px-4 text-sm font-bold text-error"
      >
        <span className="h-3 w-3 rounded-full bg-error" />
        Recording… {fmt(seconds)} — tap to stop
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-paper px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={phase === "playing" ? pause : play}
          aria-label={phase === "playing" ? "Pause" : "Play recording"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white"
        >
          {phase === "playing" ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-mist-300/50">
            <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs font-semibold text-mist-500">
            Voice note · {fmt(seconds)}
          </p>
        </div>
        <button
          type="button"
          onClick={rerecord}
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-mist-500 hover:bg-white hover:text-navy-900"
        >
          <RefreshIcon className="h-4 w-4" /> Re-record
        </button>
      </div>
    </div>
  );
}
