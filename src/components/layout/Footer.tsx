import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
    <footer className="dark-section relative overflow-hidden bg-navy text-slate-300">
      <div className="container-x pb-10 pt-20 sm:pt-28">
        {/* Supporting line at monumental scale. Replaces an outlined "LAMHA" wordmark, which the logo guidelines prohibit (08 — Incorrect usage). */}
        <p className="font-display text-giant font-extrabold text-white">
          {/* One line per sentence (the text is owner-editable); the last sentence takes the accent. */}
          {site.supportingLine.split(/(?<=[.!?])\s+/).map((line, i, all) => (
            <span key={i} className={i === all.length - 1 && all.length > 1 ? "block text-blue-200" : "block"}>
              {line}
            </span>
          ))}
        </p>

        <div className="mt-20 grid gap-14 border-t border-white/15 pt-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <LamhaLogo tone="light" withDescriptor />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-slate-300">{site.positioning}</p>
            <div className="mt-8 space-y-1">
              <a href={`mailto:${site.contact.generalEmail}`} className="link-draw block w-fit break-all font-display text-xl font-bold text-white">
                {site.contact.generalEmail}
              </a>
              {site.contact.phone && (
                <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="link-draw block w-fit text-lg text-slate-200 hover:text-white">
                  {site.contact.phone}
                </a>
              )}
            </div>
            <p className="mt-6 text-sm text-slate-300">
              {site.contact.city}, {site.contact.country} · Remote-first delivery for clients worldwide.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <p className="label-caps text-slate-400">{group.heading}</p>
                <ul className="mt-5 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href + item.label}>
                      <Link href={item.href} className="link-draw text-[0.95rem] text-slate-200 transition-colors hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/15 pt-6 text-[0.8rem] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName} · <LocalTime className="tabular" />
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
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
