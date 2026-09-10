import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import {
  ArrowRightIcon,
  BoxIcon,
  CheckIcon,
  ScissorsIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/icons";

const VALUE_PROPS = [
  {
    icon: ScissorsIcon,
    title: "Tailored in Lagos",
    text: "Cut and stitched in our own Ikeja workroom for African fits — no boxy imports.",
  },
  {
    icon: SparkleIcon,
    title: "Free embroidery",
    text: "Your name, role and hospital logo embroidered free on orders of 10+ pieces.",
  },
  {
    icon: TruckIcon,
    title: "Nationwide delivery",
    text: "1–5 business days anywhere in Nigeria, free on orders over ₦200,000.",
  },
  {
    icon: ShieldIcon,
    title: "Shift-tested quality",
    text: "Autoclavable, fade-resistant fabrics guaranteed for 100+ industrial washes.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Our entire ICU switched to Zeon scrubs. The fabric survives industrial washing and the fit is perfect for long shifts.",
    name: "Nurse Funke A.",
    role: "ICU Nurse, Lagos",
  },
  {
    quote:
      "Ordered 200 sets for our hospital staff. Sizing was consistent, embroidery was flawless, delivery was on schedule.",
    name: "Dr. Ibrahim S.",
    role: "Medical Director, Abuja",
  },
  {
    quote:
      "The scrub hijab is a game changer — secure, breathable and cool. Finally, workwear designed with us in mind.",
    name: "Zainab B.",
    role: "Theatre Nurse, Kano",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const categoryCards = [
    { name: "Scrub Sets", image: "/images/products/scrub-set-navy.jpg", blurb: "Matched tops & trousers" },
    { name: "Lab Coats", image: "/images/products/lab-coat.jpg", blurb: "Classic & tailored cuts" },
    { name: "Scrub Tops", image: "/images/products/scrub-top-ceil.jpg", blurb: "Everyday essentials" },
    { name: "Footwear", image: "/images/products/clogs.jpg", blurb: "Shift-proof comfort" },
  ];

  return (
    <div>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Nigerian healthcare professionals wearing Zeon scrubs"
            fill
            priority
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/20" />
          <div className="bg-clinical-grid absolute inset-0" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-32">
          <div className="animate-fade-up max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Made for Nigeria&apos;s healthcare heroes
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Workwear that works{" "}
              <span className="text-brand-300">as hard as you do</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-100 sm:text-lg">
              Premium scrubs, lab coats and theatre wear — designed and tailored
              in Lagos for doctors, nurses, midwives and every healthcare
              professional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-900/40 transition hover:bg-brand-400"
              >
                Shop the collection
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                <BoxIcon className="h-4 w-4" />
                Hospital &amp; clinic bulk orders
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["25k+", "professionals dressed"],
                ["120+", "hospitals supplied"],
                ["4.8★", "average rating"],
              ].map(([stat, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white sm:text-3xl">{stat}</p>
                  <p className="text-xs font-medium uppercase tracking-widest text-ink-300">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- CATEGORIES ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Shop by category
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
              Everything your shift demands
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-bold text-ink-800 transition hover:border-brand-400 hover:text-brand-700 sm:inline-flex"
          >
            View all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categoryCards.map((c) => (
            <Link
              key={c.name}
              href={`/shop?category=${encodeURIComponent(c.name)}`}
              className="group relative overflow-hidden rounded-2xl bg-ink-900"
            >
              <div className="relative aspect-[3/4] sm:aspect-[4/5]">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-lg font-black text-white sm:text-xl">{c.name}</p>
                  <p className="text-xs text-ink-200 sm:text-sm">{c.blurb}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand-300">
                    Shop now
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ----------------------------- FEATURED ----------------------------- */}
      <section className="bg-ink-50/70 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                Most loved
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
                Bestsellers &amp; new arrivals
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 sm:inline-flex"
            >
              Shop all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- VALUE PROPS --------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            The Zeon promise
          </p>
          <h2 className="mx-auto mt-2 max-w-xl text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
            Workwear engineered for Nigerian healthcare
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <v.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-ink-900">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- WHOLESALE CTA -------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900">
          <div className="absolute inset-0 grid sm:grid-cols-2">
            <div className="bg-clinical-grid" />
            <div className="relative hidden sm:block">
              <Image
                src="/images/wholesale.jpg"
                alt="Bulk hospital uniform order"
                fill
                sizes="50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink-900 to-transparent" />
            </div>
          </div>
          <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
                Zeon for institutions
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                Uniform your entire hospital — save up to 25%
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-ink-100">
                {[
                  "Tiered bulk pricing from just 10 pieces",
                  "Free logo & name embroidery",
                  "Dedicated account manager & size sampling",
                  "30-day payment terms for accredited facilities",
                ].map((li) => (
                  <li key={li} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {li}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-brand-100"
                >
                  Get a wholesale quote
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href="tel:+2348012345678"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Call +234 801 234 5678
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- TESTIMONIALS --------------------------- */}
      <section className="bg-brand-950 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
              Worn with pride
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Trusted by 25,000+ healthcare professionals
            </h2>
            <div className="mt-3 flex justify-center">
              <Rating value={4.8} />
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <blockquote className="flex-1 text-sm leading-relaxed text-ink-100">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-white/10 pt-4">
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs text-brand-300">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
