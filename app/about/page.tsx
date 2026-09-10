import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@/components/icons";
import { Card, CardHeader } from "@/components/ui";

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
    <div className="bg-paper pb-16">
      <div className="calm-wash">
        <section className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Our story
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 sm:text-[40px] sm:leading-[1.1]">
              Born in a Lagos hospital corridor
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-mist-500">
              ZEON started in 2021 when our founder — a nurse — got tired of
              boxy, faded imported scrubs that never quite fit. She sketched a
              better scrub top, found two tailors in Ikeja, and sold the first
              50 pieces to colleagues at LUTH.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-mist-500">
              Today we dress over 25,000 healthcare professionals and 120+
              hospitals across Nigeria — still cut and stitched in Lagos, still
              obsessed with fit, fabric and the people who wear them.
            </p>
          </div>
          <div className="card overflow-hidden !p-0">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/about.jpg"
                alt="Inside the ZEON tailoring workroom in Lagos"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-[1200px] px-4">
        <Card>
          <CardHeader
            title="What we stand for"
            sub="Four promises, kept daily"
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(([title, text]) => (
              <div key={title} className="rounded-2xl bg-paper p-5">
                <h3 className="text-[15px] font-semibold text-navy-900">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mist-500">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 rounded-2xl border border-line p-8 text-center sm:grid-cols-3">
            {[
              ["25,000+", "professionals dressed"],
              ["120+", "hospitals & clinics supplied"],
              ["40+", "Lagos tailors employed"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="tnum text-3xl font-bold text-navy-900 sm:text-4xl">{stat}</p>
                <p className="mt-1 text-[13px] text-mist-500">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* The one spotlight on this screen */}
        <div className="spotlight mt-5 px-6 py-12 text-center sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
            The ZEON community
          </p>
          <h2 className="mx-auto mt-2 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Don&apos;t just wear the future — design it
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70">
            Join a Discovery conversation, earn 100 ZEON Points, vote on new
            styles and get first access to fit panels. Your shift stories
            become our next collection.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/discovery"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-navy-950 transition hover:bg-primary-100"
            >
              Join Discovery <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex min-h-[48px] items-center rounded-full border border-white/25 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Shop as an individual
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
