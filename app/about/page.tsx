import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description: "Zeon Apparel Ltd — premium healthcare apparel designed and tailored in Lagos, Nigeria.",
};

const VALUES = [
  ["Crafted, not imported", "Every piece is cut and stitched in our Ikeja workroom, fitted on real Nigerian bodies."],
  ["Built for the shift", "Fabrics tested for 100+ industrial washes, autoclave cycles and 12-hour days."],
  ["Fair & local", "We employ 40+ Lagos tailors and finishers, paying above industry rates."],
  ["For every professional", "From theatre hijabs to tall sizes — inclusive workwear for all."],
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
              Our story
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Born in a Lagos hospital corridor
            </h1>
            <p className="mt-5 leading-relaxed text-ink-100">
              Zeon Apparel Ltd started in 2021 when our founder — a nurse —
              got tired of boxy, faded imported scrubs that never quite fit.
              She sketched a better scrub top, found two tailors in Ikeja, and
              sold the first 50 pieces to colleagues at LUTH.
            </p>
            <p className="mt-4 leading-relaxed text-ink-100">
              Today we dress over 25,000 healthcare professionals and 120+
              hospitals across Nigeria — still cut and stitched in Lagos, still
              obsessed with fit, fabric and the people who wear them.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/images/about.jpg"
              alt="Inside the Zeon tailoring workroom in Lagos"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <h2 className="text-center text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
          What we stand for
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-ink-100 bg-white p-6">
              <h3 className="font-bold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 rounded-3xl bg-brand-950 p-8 text-center text-white sm:grid-cols-3 sm:p-12">
          {[
            ["25,000+", "professionals dressed"],
            ["120+", "hospitals & clinics supplied"],
            ["40+", "Lagos tailors employed"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="text-3xl font-black sm:text-4xl">{stat}</p>
              <p className="mt-1 text-sm text-brand-200">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Shop the collection <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/wholesale"
            className="rounded-full border border-ink-200 px-7 py-3.5 text-sm font-bold text-ink-800 hover:border-ink-400"
          >
            Partner with us
          </Link>
        </div>
      </section>
    </div>
  );
}
