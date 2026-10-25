import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footerNav } from "@/data/navigation";
import { getContent } from "@/lib/server/content";
import { LamhaLogo } from "@/components/ui/Logo";
import { LocalTime } from "@/components/motion/LocalTime";
import { SocialIcon, hasSocialIcon } from "@/components/ui/SocialIcon";
import { RegMarks } from "@/components/ui/RegMarks";

/**
 * Footer, revealed: on wide, tall screens it is pinned beneath the page (sticky, behind <main>) so the page
 * lifts off it at the end; on phones and short windows it is ordinary flow. Sized to fit one desktop viewport.
 */
export async function Footer() {
  // Owner-editable values (portal → Website content); falls back to the src/data defaults.
  const { site } = await getContent();
  const year = new Date().getFullYear();
  const socials = site.social.filter((s) => s.href);
  // One line per sentence (the text is owner-editable); the last sentence takes the heavier weight.
  const lines = site.supportingLine.split(/(?<=[.!?])\s+/);
  return (
    <footer className="dark-section relative z-0 overflow-hidden bg-navy text-slate-300 lg:[@media(min-height:780px)]:sticky lg:[@media(min-height:780px)]:bottom-0">
      <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-x relative flex flex-col pb-8 pt-20 lg:min-h-[100svh] lg:pt-[calc(var(--header-h)+3rem)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <p className="font-display text-display text-white lg:col-span-8">
            {lines.map((line, i) => (
              <span key={i} className={i === lines.length - 1 && lines.length > 1 ? "kinetic block text-blue-200 [--wght:760]" : "kinetic block [--wght:300]"}>
                {line}
              </span>
            ))}
          </p>
          <div className="lg:col-span-4">
            <p className="label-caps text-slate-400">Have a problem worth solving?</p>
            <Link
              href={site.cta.primary.href}
              className="chamfer group mt-4 inline-flex h-16 items-center gap-4 bg-blue px-8 font-display text-xl font-medium text-white transition-colors hover:bg-white hover:text-navy"
            >
              {site.cta.primary.label}
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a href={`mailto:${site.contact.generalEmail}`} className="link-draw mt-5 block w-fit break-all text-lg font-medium text-white">
              {site.contact.generalEmail}
            </a>
            {site.contact.phone && (
              <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="link-draw mt-1 block w-fit text-slate-200 hover:text-white">
                {site.contact.phone}
              </a>
            )}
          </div>
        </div>

        <div className="relative mt-16 grid gap-12 border-t border-white/15 pt-10 lg:mt-auto lg:grid-cols-12">
          <div className="lg:col-span-4">
            <LamhaLogo tone="light" withDescriptor />
            <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-slate-300">{site.positioning}</p>
            <p className="label-tech mt-5 text-slate-400">
              {site.contact.city}, {site.contact.country} · 33.6844° N, 73.0479° E
            </p>
            <LocalTime className="label-tech mt-1 block text-slate-300" />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <p className="label-caps text-slate-400">{group.heading}</p>
                <ul className="mt-4 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.href + item.label}>
                      <Link href={item.href} className="link-draw text-[0.92rem] text-slate-200 transition-colors hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-[0.8rem] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}
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
        <RegMarks className="text-white" inset={12} />
      </div>
    </footer>
  );
}
