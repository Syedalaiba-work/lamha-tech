import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { footerNav } from "@/data/navigation";
import { getContent } from "@/lib/server/content";
import { LamhaLogo } from "@/components/ui/Logo";
import { LocalTime } from "@/components/motion/LocalTime";
import { SocialIcon, hasSocialIcon } from "@/components/ui/SocialIcon";

export async function Footer() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  const year = new Date().getFullYear();
  const socials = site.social.filter((s) => s.href);
  return (
    <footer className="dark-section relative overflow-hidden bg-abyss text-slate-300">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-2/60 to-transparent" />
      <div className="container-x py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <LamhaLogo tone="light" withDescriptor />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-slate-400">{site.positioning}</p>
            <p className="mt-4 text-sm font-medium text-slate-200">{site.supportingLine}</p>
            <Link
              href={site.cta.primary.href}
              className="group mt-8 inline-flex items-center gap-2 rounded-md bg-blue px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {site.cta.primary.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <p className="label-caps text-slate-500">{group.heading}</p>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.href + item.label}>
                      <Link href={item.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="label-caps text-slate-500">Email</p>
            <a href={`mailto:${site.contact.generalEmail}`} className="mt-3 inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white">
              <Mail className="h-4 w-4 text-blue-2" aria-hidden="true" />
              {site.contact.generalEmail}
            </a>
          </div>
          {site.contact.phone && (
            <div>
              <p className="label-caps text-slate-500">Phone</p>
              <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="mt-3 inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white">
                <Phone className="h-4 w-4 text-blue-2" aria-hidden="true" />
                {site.contact.phone}
              </a>
            </div>
          )}
          <div>
            <p className="label-caps text-slate-500">Company</p>
            <p className="mt-3 text-sm text-slate-300">{site.legalName}</p>
            <p className="mt-1 text-sm text-slate-400">{site.contact.city}, {site.contact.country}</p>
            <p className="mt-1 text-sm text-slate-500">Remote-first delivery for clients worldwide.</p>
          </div>
        </div>

        {/* Oversized supporting line. Replaces an outlined "LAMHA" wordmark, which the logo guidelines prohibit (08 — Incorrect usage). */}
        <p aria-hidden="true" className="mt-16 select-none font-display text-[clamp(2.25rem,7.4vw,7rem)] font-bold leading-[0.95] tracking-[-0.045em]">
          {/* One line per sentence (the text is owner-editable); the last sentence takes the accent. */}
          {site.supportingLine.split(/(?<=[.!?])\s+/).map((line, i, all) => (
            <span key={i} className={i === all.length - 1 && all.length > 1 ? "block text-blue-2" : "block text-white"}>
              {line}
            </span>
          ))}
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName} · <LocalTime />
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Use
            </Link>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${site.name} on ${s.label} (opens in a new tab)`}
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                {hasSocialIcon(s.label) && <SocialIcon platform={s.label} className="h-3.5 w-3.5" />}
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
