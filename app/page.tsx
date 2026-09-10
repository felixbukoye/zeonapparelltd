import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import { formatNaira, WHATSAPP_NUMBER } from "@/lib/format";
import {
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  CheckIcon,
  RulerIcon,
  ScissorsIcon,
  SparkleIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/icons";
import {
  BarChart,
  Card,
  CardHeader,
  CardLink,
  Delta,
  Legend,
  LineChart,
  ProgressBar,
  StatusBadge,
} from "@/components/ui";

export default async function LandingPage() {
  const products = await getProducts();
  const board = products.slice(0, 6);

  return (
    <div className="bg-paper">
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="calm-wash">
        <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-10 sm:pt-14">
          <div className="animate-fade-up max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Today&apos;s info · Made-to-order in Lagos
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-navy-900 sm:text-[44px]">
              Fitted workwear for Nigeria&apos;s healthcare heroes
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-mist-500">
              Scrubs, lab coats and theatre wear — cut to your size, stitched
              with your name, delivered to your hospital. Fitted, never boxy.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/coordinator"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgb(59_110_246/0.35)] transition hover:bg-primary-600"
              >
                + Outfit your team
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-line bg-white px-7 py-3 text-sm font-bold text-navy-800 shadow-card transition hover:border-primary-200 hover:text-primary-700"
              >
                Browse the catalogue
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello ZEON! I'm not sure where to start 🙏")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 px-2 py-3 text-sm font-bold text-primary-600 hover:underline"
              >
                <WhatsAppIcon className="h-5 w-5" /> Talk to Sales
              </a>
            </div>
          </div>

          {/* Two entry paths: ONE navy spotlight + one calm white card */}
          <div
            className="animate-fade-up mt-8 grid gap-5 md:grid-cols-5"
            style={{ animationDelay: "120ms" }}
          >
            <Link
              href="/coordinator"
              className="spotlight group relative overflow-hidden p-6 sm:p-7 md:col-span-3"
            >
              <div className="calm-dots absolute inset-0 opacity-[0.12] invert" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">
                    <BellIcon className="h-3.5 w-3.5" /> For hospitals &amp; clinics
                  </p>
                  <StatusBadge tone="success" label="+5.75% this month" />
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                  News from the workroom: team orders, minus the chaos
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                  Build a collection, share one invite link, and watch every
                  wearer&apos;s measurements roll in — with live tracking from
                  deposit to dispatch.
                </p>
                <span className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-navy-950 transition group-hover:bg-primary-100">
                  Start a team order
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            <div className="card card-hover p-6 sm:p-7 md:col-span-2">
              <CardHeader
                title="Shop as an individual"
                sub="For doctors, nurses & students"
                action={<CardLink href="/catalogue">See details</CardLink>}
              />
              <p className="tnum mt-3 text-[32px] font-bold leading-none tracking-tight text-navy-900">
                {products.length}+
                <span className="ml-2 align-middle text-[13px] font-semibold text-mist-500">
                  styles on the board
                </span>
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-mist-500">
                Pick your fit with our Fit Assistant, add your name — we sew
                your sets just for you.
              </p>
              <Link
                href="/catalogue"
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_20px_rgb(59_110_246/0.35)] transition hover:bg-primary-600"
              >
                + Check now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- STAT BAND --------------------------- */}
      <section className="mx-auto max-w-[1200px] px-4 pt-2">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[
            { label: "Professionals dressed", value: "25,000+", delta: 5.75, note: "vs last quarter" },
            { label: "Hospitals supplied", value: "120+", delta: 8.2, note: "and counting" },
            { label: "Perfect-fit rate", value: "96%", delta: 1.4, note: "first delivery" },
            { label: "Avg. door-to-door", value: "14 days", delta: -12, note: "faster YoY", invert: true },
          ].map((s, i) => (
            <Card
              key={s.label}
              className="animate-fade-up"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-mist-500">{s.label}</p>
                <Delta value={s.delta} suffix="%" />
              </div>
              <p className="tnum mt-2 text-[28px] font-bold leading-none tracking-tight text-navy-900 sm:text-[32px]">
                {s.value}
              </p>
              <p className="mt-1.5 text-[11px] text-mist-400">
                {i === 3 ? "↓ " : ""}{s.note}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* --------------------- CHART + PROGRESS ROW --------------------- */}
      <section className="mx-auto grid max-w-[1200px] gap-5 px-4 pt-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Orders this week"
            sub="Sets cut & stitched · updates daily"
            action={<CardLink href="/track">Report</CardLink>}
          />
          <div className="mt-2 flex justify-end">
            <Legend
              items={[
                { color: "#3B6EF6", label: "Cutting" },
                { color: "#8A93A6", label: "Stitching" },
              ]}
            />
          </div>
          <div className="mt-2">
            <LineChart
              series={[12, 19, 15, 26, 22, 34, 31]}
              secondSeries={[8, 12, 11, 18, 16, 24, 26]}
              labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
              focusIndex={5}
              focusLabel="Sat · 34 sets"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Workroom progress"
            sub="Live from Ikeja"
            action={<CardLink href="/track">See details</CardLink>}
          />
          <div className="mt-4 space-y-4">
            <ProgressBar value={85} label="LUTH · 40 scrub sets" hint="Due Fri" />
            <ProgressBar value={62} label="Reddington · 25 lab coats" hint="Due Mon" />
            <ProgressBar value={38} label="Evercare · 60 theatre sets" hint="Due 24 Sep" />
            <div className="rounded-2xl bg-paper p-3.5">
              <BarChart
                values={[4, 7, 5, 9, 6, 11, 8]}
                labels={["M", "T", "W", "T", "F", "S", "S"]}
                height={110}
                activeIndex={5}
              />
              <p className="mt-1 text-center text-[11px] font-semibold text-mist-500">
                Dispatches per day
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ------------------------- STYLE BOARD TEASER ------------------------- */}
      <section className="mx-auto max-w-[1200px] px-4 pt-10">
        <Card>
          <CardHeader
            title="Styles designed with HCPs, for HCPs"
            sub="Combat pockets · no front chest pocket · longer backs"
            action={<CardLink href="/catalogue">Open style board →</CardLink>}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {board.map((p) => (
              <Link
                key={p.id}
                href={`/catalogue/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-line transition hover:border-primary-200 hover:shadow-card-hover"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-paper">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {p.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-navy-950 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      {p.badge}
                    </span>
                  )}
                </span>
                <span className="block p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-primary-600">
                    {p.category}
                  </span>
                  <span className="mt-0.5 block truncate text-[15px] font-semibold text-navy-900">
                    {p.name}
                  </span>
                  <span className="tnum mt-1 flex items-center justify-between text-sm">
                    <span className="font-bold text-navy-900">{formatNaira(p.price)}</span>
                    <span className="text-xs font-medium text-mist-400">
                      {p.colors.length} colours
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* ---------------------------- HOW IT WORKS ---------------------------- */}
      <section className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-600">
              <CalendarIcon className="h-4 w-4" /> How ZEON works
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy-900">
              Nothing off the shelf. Everything made for you.
            </h2>
          </div>
          <Link
            href="/fit-assistant"
            className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-bold text-primary-600 hover:underline"
          >
            <RulerIcon className="h-4 w-4" /> Try the Fit Assistant →
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <Card key={s.title} hover>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <s.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-navy-900">{s.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-mist-500">{s.text}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-5 flex flex-col items-center px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy-900">
            Ready when you are
          </h2>
          <p className="mt-1 max-w-md text-sm text-mist-500">
            Most coordinators finish setup in under 15 minutes. Individuals
            can order tonight and track every stitch.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/coordinator"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgb(59_110_246/0.35)] transition hover:bg-primary-600"
            >
              + Outfit your team
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex min-h-[48px] items-center rounded-full border border-line bg-white px-7 py-3 text-sm font-bold text-navy-800 transition hover:border-primary-200 hover:text-primary-700"
            >
              Shop as an individual
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
