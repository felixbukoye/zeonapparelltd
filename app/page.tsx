import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import {
  ArrowRightIcon,
  RulerIcon,
  ScissorsIcon,
  SparkleIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { WHATSAPP_NUMBER } from "@/lib/format";

export default async function LandingPage() {
  const products = await getProducts();
  const board = products.slice(0, 6);

  return (
    <div className="bg-navy-950">
      {/* ------------------------- DARK PREMIUM HERO ------------------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Nigerian healthcare professionals wearing ZEON scrubs"
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/55 to-navy-950" />
          <div className="bg-premium-grid absolute inset-0" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 pb-14 pt-16 sm:pb-20 sm:pt-24">
          <div className="animate-fade-up max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
              Made-to-order in Lagos
            </p>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Fitted workwear for Nigeria&apos;s healthcare heroes
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Scrubs, lab coats and theatre wear — cut to your size, stitched
              with your name, delivered to your hospital. Fitted, never boxy.
            </p>
          </div>

          {/* Two entry paths + human escape hatch */}
          <div className="animate-fade-up mt-10 grid gap-4 md:grid-cols-2" style={{ animationDelay: "120ms" }}>
            <Link
              href="/coordinator"
              className="group rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur transition hover:border-gold-500/60 hover:bg-white/[0.09] sm:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                For hospitals &amp; clinics
              </p>
              <p className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">
                Outfit your team
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
                Build a collection, share one invite link, and watch every
                wearer&apos;s measurements roll in — with live tracking from
                deposit to dispatch.
              </p>
              <span className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 transition group-hover:bg-gold-400">
                Start a team order
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/catalogue"
              className="group rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur transition hover:border-white/30 hover:bg-white/[0.09] sm:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                For doctors, nurses &amp; students
              </p>
              <p className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">
                Shop as an individual
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
                Browse the style board, pick your fit with our Fit Assistant,
                add your name — we sew your sets just for you.
              </p>
              <span className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-950 transition group-hover:bg-gold-200">
                Browse the catalogue
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>

          <div className="animate-fade-up mt-5 flex flex-wrap items-center gap-3" style={{ animationDelay: "200ms" }}>
            <p className="text-sm text-white/60">Not sure where to start?</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello ZEON! I'm not sure where to start 🙏")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-whatsapp px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="h-5 w-5" /> Talk to Sales
            </a>
            <Link
              href="/track"
              className="inline-flex min-h-[48px] items-center px-5 py-3 text-sm font-bold text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              Already ordered? Track it →
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------- STYLE BOARD TEASER --------------------------- */}
      <section className="mx-auto max-w-[1200px] px-4 py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
              The catalogue
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
              Styles designed with HCPs, for HCPs
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Every style shows the features you asked for — combat pockets,
              no front chest pocket, longer backs. Pick one and we make it
              yours.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:border-gold-500/60 hover:text-gold-300"
          >
            Open style board <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 columns-2 gap-4 md:columns-3">
          {board.map((p, i) => (
            <Link
              key={p.id}
              href={`/catalogue/${p.slug}`}
              className={`group relative mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-white/10 ${
                i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
              }`}
            >
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-300">
                  {p.category}
                </p>
                <p className="mt-0.5 font-display text-base font-bold leading-snug text-white sm:text-lg">
                  {p.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------ HOW IT WORKS ------------------------------ */}
      <section className="border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:py-20">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
            How ZEON works
          </p>
          <h2 className="mx-auto mt-2 max-w-xl text-center font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
            Nothing off the shelf. Everything made for you.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: SparkleIcon,
                title: "1. Pick your style",
                text: "Browse the catalogue or build a team collection from approved styles and colours.",
              },
              {
                icon: RulerIcon,
                title: "2. Get your fit right",
                text: "Our Fit Assistant guides you — preset chart or manual measurements, fitted or relaxed.",
              },
              {
                icon: ScissorsIcon,
                title: "3. We sew it for you",
                text: "Your name embroidered, your size cut. Watch all 8 production stages live.",
              },
              {
                icon: TruckIcon,
                title: "4. Delivered & loved",
                text: "Per-person labeled packages via GIG Logistics. Free exchanges if the fit isn't perfect.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-400">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display font-bold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/coordinator"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gold-500 px-7 py-3.5 text-sm font-bold text-navy-950 transition hover:bg-gold-400"
            >
              Outfit your team <ArrowRightIcon className="h-4 w-4" />
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
