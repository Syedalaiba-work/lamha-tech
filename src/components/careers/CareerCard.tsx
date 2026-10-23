import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Job } from "@/data/jobs";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

/** A role as a large editorial row: title, summary, facts; hover/focus sweeps it navy. */
export function CareerCard({ job, className }: { job: Job; className?: string }) {
  return (
    <Link
      href={`/careers/${job.slug}`}
      className={cn(
        "group relative isolate grid gap-x-8 gap-y-3 overflow-hidden px-2 py-8 transition-colors duration-500 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-navy before:transition-transform before:duration-500 before:ease-[var(--ease-out-expo)] hover:before:scale-x-100 focus-visible:before:scale-x-100 sm:px-4 md:grid-cols-12 md:items-baseline",
        className,
      )}
    >
      <div className="md:col-span-5">
        <p className="label-caps text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200">{job.department}</p>
        <h3 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.75rem)] font-bold leading-[1.04] tracking-[-0.045em] text-navy transition-colors group-hover:text-white group-focus-visible:text-white">{job.title}</h3>
        {job.status === "demo" && <Tag accent className="mt-3">Demo listing</Tag>}
      </div>
      <p className="text-[1rem] leading-relaxed text-slate-600 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-span-4">{job.summary}</p>
      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-700 transition-colors group-hover:text-slate-200 group-focus-visible:text-slate-200 md:col-span-2 md:flex-col">
        <div>
          <dt className="sr-only">Location</dt>
          <dd>{job.location}</dd>
        </div>
        <div>
          <dt className="sr-only">Employment type</dt>
          <dd>{job.employmentType}</dd>
        </div>
      </dl>
      <ArrowUpRight aria-hidden="true" className="hidden h-7 w-7 justify-self-end text-slate-500 transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white md:col-span-1 md:block" />
    </Link>
  );
}
