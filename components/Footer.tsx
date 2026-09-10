import Link from "next/link";
import { Logo } from "./Header";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";
import { WHATSAPP_NUMBER } from "@/lib/format";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="mx-auto max-w-[1200px] px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Fitted, made-to-order healthcare apparels — designed with
              Nigerian HCPs, sewn in Lagos, worn with dignity.
            </p>
            <p className="mt-4 font-display text-sm font-bold text-gold-400">
              Fitted, not boxy. Dignity in every stitch.
            </p>
            <div className="mt-5 space-y-2.5 text-sm">
              <p className="flex items-start gap-2.5">
                <PinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-500" />
                14 Ogudu Road, Ikeja, Lagos, Nigeria
              </p>
              <p className="flex items-center gap-2.5">
                <PhoneIcon className="h-4.5 w-4.5 shrink-0 text-gold-500" />
                +234 801 234 5678
              </p>
              <p className="flex items-center gap-2.5">
                <MailIcon className="h-4.5 w-4.5 shrink-0 text-gold-500" />
                hello@zeonapparels.com
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              For individuals
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/catalogue" className="hover:text-white">Catalogue style board</Link></li>
              <li><Link href="/order/individual" className="hover:text-white">Build your own order</Link></li>
              <li><Link href="/fit-assistant" className="hover:text-white">Fit Assistant</Link></li>
              <li><Link href="/track" className="hover:text-white">Track your order</Link></li>
              <li><Link href="/discovery" className="hover:text-white">Discovery conversation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              For institutions
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/coordinator" className="hover:text-white">Outfit your team</Link></li>
              <li><Link href="/coordinator/collections" className="hover:text-white">Collections</Link></li>
              <li><Link href="/coordinator/orders" className="hover:text-white">Team orders</Link></li>
              <li><Link href="/login" className="hover:text-white">Coordinator sign in</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Talk to a human
            </h3>
            <p className="mt-4 text-sm leading-relaxed">
              Our team replies on WhatsApp within minutes, 8am–8pm daily.
              The app assists — it never replaces the human.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello ZEON! 👋")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-whatsapp px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
            </a>
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <Link href="/about" className="hover:text-white">About / Community</Link>
              <span className="text-white/30">·</span>
              <Link href="/faq" className="hover:text-white">FAQ</Link>
              <span className="text-white/30">·</span>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <span className="text-white/30">·</span>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} ZEON Healthcare Apparels. All rights reserved.</p>
          <p className="text-gold-500">Designed &amp; sewn in Lagos, Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
