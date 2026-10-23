import Image from "next/image";
import Link from "next/link";
import { leaderPath, type Leader } from "@/data/leadership";
import { cn } from "@/lib/utils";

/** Portrait or initials placeholder. Only approved portraits are rendered. */
export function Portrait({ leader, className, size = "md" }: { leader: Leader; className?: string; size?: "md" | "lg" }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-navy",
        size === "lg" ? "aspect-[4/5]" : "aspect-square",
        className,
      )}
    >
      {leader.portrait ? (
        <Image
          src={leader.portrait}
          alt={`Portrait of ${leader.name}, ${leader.role} at LAMHA Technologies`}
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 90vw"
          quality={78}
          className="object-cover grayscale-[0.35] transition-[transform,filter] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:grayscale-0"
          style={{ objectPosition: leader.portraitPosition ?? "50% 25%" }}
          priority={size === "lg"}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label={`Placeholder portrait for ${leader.name}`}>
          <span className={cn("font-semibold tracking-tight text-white/90", size === "lg" ? "text-6xl" : "text-4xl")}>{leader.initials}</span>
          <span className="mt-3 label-caps text-slate-400">Portrait pending</span>
        </div>
      )}
    </div>
  );
}

export function LeadershipCard({ leader, tone = "light", className }: { leader: Leader; tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <article id={leader.slug} className={cn("group flex h-full flex-col scroll-mt-28", className)}>
      <Portrait leader={leader} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1" />
      <div className="mt-5">
        <h3 className={cn("font-display text-xl font-bold tracking-tight", dark ? "text-white" : "text-navy")}>
          <Link href={leaderPath(leader)} className="rounded-sm hover:underline">
            {leader.name}
          </Link>
        </h3>
        <p className={cn("mt-1 text-sm font-medium", dark ? "text-blue-200" : "text-blue")}>{leader.role}</p>
        <p className={cn("mt-3 text-sm leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>
          {leader.bio ?? "Leadership biography coming soon."}
        </p>
        <div className={cn("mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium", dark ? "text-blue-200" : "text-blue")}>
          <Link href={leaderPath(leader)} className="inline-flex items-center gap-1.5 hover:underline">
            Full profile
            <span aria-hidden="true">→</span>
          </Link>
          {leader.profileUrl && (
            <a href={leader.profileUrl} rel="me noopener noreferrer" target="_blank" className="inline-flex items-center gap-1.5 hover:underline">
              LinkedIn profile
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
