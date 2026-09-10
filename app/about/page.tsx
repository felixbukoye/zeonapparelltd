import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About / Community",
  description:
    "ZEON Healthcare Apparels — fitted, made-to-order workwear designed with Nigerian HCPs. Join the community shaping what we sew next.",
};

const VALUES = [
  ["Fitted, not boxy", "Every piece is cut to real Nigerian bodies — preset XS–6XL or your exact measurements."],
  ["Dignity in every stitch", "Your name embroidered, your size respected. You run the hospital; you should look it."],
  ["Made with you, not just for you", "Discovery conversations and fit panels feed straight into our design room."],
  ["Human first, app second", "WhatsApp a real person anytime. The app assists — it never replaces the human."],
];

export default function AboutPage() {
  return (
    <div className="bg-navy-950">
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
            Our story
          </p>
          <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
            Born in a Lagos hospital corridor
          </h1>
          <p className="mt-5 leading-relaxed text-white/70">
            ZEON started in 2021 when our founder — a nurse — got tired of
            boxy, faded imported scrubs that never quite fit. She sketched a
            better scrub top, found two tailors in Ikeja, and sold the first
            50 pieces to colleagues at LUTH.
          </p>
          <p className="mt-4 leading-relaxed text-white/70">
            Today we dress over 25,000 healthcare professionals and 120+
            hospitals across Nigeria — still cut and stitched in Lagos, still
            obsessed with fit, fabric and the people who wear them.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src="/images/about.jpg"
            alt="Inside the ZEON tailoring workroom in Lagos"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pb-14 sm:pb-20">
        <h2 className="text-center font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
          What we stand for
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="font-display font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-gold-500/30 bg-white/[0.03] p-8 text-center sm:grid-cols-3 sm:p-10">
          {[
            ["25,000+", "professionals dressed"],
            ["120+", "hospitals & clinics supplied"],
            ["40+", "Lagos tailors employed"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-display text-3xl font-black text-gold-300 sm:text-4xl">{stat}</p>
              <p className="mt-1 text-sm text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-[1200px] px-4 py-14 text-center sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
            The ZEON community
          </p>
          <h2 className="mx-auto mt-2 max-w-xl font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
            Don&apos;t just wear the future — design it
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">
            Join a Discovery conversation, earn 100 ZEON Points, vote on new
            styles and get first access to fit panels. Your shift stories
            become our next collection.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/discovery"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gold-500 px-7 py-3.5 text-sm font-bold text-navy-950 transition hover:bg-gold-400"
            >
              Join Discovery <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex min-h-[48px] items-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition hover:border-gold-500/60"
            >
              Shop as an individual
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
