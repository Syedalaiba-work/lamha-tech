import { Plus } from "lucide-react";
import type { FAQ as FAQItem } from "@/data/services";
import { cn } from "@/lib/utils";

/**
 * Accessible accordion using native <details>/<summary>: keyboard operable,
 * screen-reader friendly and works without JavaScript.
 */
export function FAQ({ items, className }: { items: FAQItem[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-ink/15 border-y border-ink/15", className)}>
      {items.map((item, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left font-display text-lg font-bold tracking-tight text-navy marker:content-none [&::-webkit-details-marker]:hidden sm:text-xl">
            <span>{item.question}</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/20 text-navy transition-[transform,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-blue group-open:bg-blue group-open:text-white">
              <Plus aria-hidden="true" className="h-4 w-4" />
            </span>
          </summary>
          <div className="max-w-3xl pb-7 pr-14 text-[1.02rem] leading-relaxed text-slate-600">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
