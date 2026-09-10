import Link from "next/link";
import { Logo } from "./Header";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";
import { WHATSAPP_NUMBER } from "@/lib/format";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-500">
              Fitted, made-to-order healthcare apparels — designed with
              Nigerian HCPs, sewn in Lagos, worn with dignity.
            </p>
            <p className="mt-4 font-display text-sm font-bold text-primary-600">
              Fitted, not boxy. Dignity in every stitch.
            </p>
            <div className="mt-5 space-y-2.5 text-sm text-mist-500">
              <p className="flex items-start gap-2.5">
                <PinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                14 Ogudu Road, Ikeja, Lagos, Nigeria
              </p>
              <p className="flex items-center gap-2.5">
                <PhoneIcon className="h-4.5 w-4.5 shrink-0 text-primary" />
                +234 801 234 5678
              </p>
              <p className="flex items-center gap-2.5">
                <MailIcon className="h-4.5 w-4.5 shrink-0 text-primary" />
                hello@zeonapparels.com
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-navy-900">
              For individuals
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-mist-500">
              <li><Link href="/catalogue" className="hover:text-primary-600">Catalogue style board</Link></li>
              <li><Link href="/order/individual" className="hover:text-primary-600">Build your own order</Link></li>
              <li><Link href="/fit-assistant" className="hover:text-primary-600">Fit Assistant</Link></li>
              <li><Link href="/track" className="hover:text-primary-600">Track your order</Link></li>
              <li><Link href="/discovery" className="hover:text-primary-600">Discovery conversation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-navy-900">
              For institutions
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-mist-500">
              <li><Link href="/coordinator" className="hover:text-primary-600">Outfit your team</Link></li>
              <li><Link href="/coordinator/collections" className="hover:text-primary-600">Collections</Link></li>
              <li><Link href="/coordinator/orders" className="hover:text-primary-600">Team orders</Link></li>
              <li><Link href="/login" className="hover:text-primary-600">Coordinator sign in</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-navy-900">
              Talk to a human
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-mist-500">
              Our team replies on WhatsApp within minutes, 8am–8pm daily.
              The app assists — it never replaces the human.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello ZEON! 👋")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
            </a>
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-mist-500">
              <Link href="/about" className="hover:text-primary-600">About / Community</Link>
              <span className="text-line">·</span>
              <Link href="/faq" className="hover:text-primary-600">FAQ</Link>
              <span className="text-line">·</span>
              <Link href="/terms" className="hover:text-primary-600">Terms</Link>
              <span className="text-line">·</span>
              <Link href="/privacy" className="hover:text-primary-600">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-mist-500 sm:flex-row">
          <p>© {new Date().getFullYear()} ZEON Healthcare Apparels. All rights reserved.</p>
          <p className="font-semibold text-primary-600">Designed &amp; sewn in Lagos, Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
