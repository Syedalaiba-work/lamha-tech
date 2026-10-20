"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky in-page navigation with the current section highlighted while scrolling. */
export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav data-subnav aria-label="On this page" className="dark-section sticky top-0 z-40 border-b border-white/10 bg-deep/95 text-white backdrop-blur">
      <div className="container-x -mx-5 overflow-x-auto px-5 sm:mx-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex gap-6 whitespace-nowrap py-3.5 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className={cn(
                  "relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-[0.95rem] after:h-0.5 after:origin-left after:scale-x-0 after:bg-blue-2 after:transition-transform after:duration-300",
                  active === s.id ? "text-white after:scale-x-100" : "text-slate-300 hover:text-white",
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
