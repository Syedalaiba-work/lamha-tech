"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { films, filmSrc, type FilmId } from "@/data/films";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A studio film loop, built to degrade gracefully:
 * - The poster is part of the server HTML (also the whole experience without JavaScript or if the video fails).
 * - Nothing downloads until the film is near the viewport (`preload="none"` + IntersectionObserver), and it
 *   only plays while visible, so off-screen films cost nothing.
 * - Reduced motion: the poster stays; a play button starts the film on request.
 * - Moving content longer than five seconds gets a visible pause control (WCAG 2.2.2).
 */
export function Film({
  id,
  className,
  videoClassName,
  controls = true,
  priority = false,
  rounded = false,
  label,
  size = "full",
}: {
  id: FilmId;
  className?: string;
  videoClassName?: string;
  /** Show the pause / play control (bottom right). */
  controls?: boolean;
  /** Start loading as soon as the page loads (the first visible film on a page). */
  priority?: boolean;
  rounded?: boolean;
  /** Accessible description; films are otherwise decorative. */
  label?: string;
  /** "compact": the film is shown at ~600 px or less, so the 480p encode is used at every screen size. */
  size?: "full" | "compact";
}) {
  const film = films[id];
  const src = filmSrc(id);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);

  // Reduced motion: paused unless the visitor asks for it. Otherwise: playing unless the visitor paused it.
  const wantPlay = userPaused === null ? !reduced : !userPaused;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e!.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (visible && wantPlay) {
      if (v.preload !== "auto") v.preload = "auto";
      v.play().catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  }, [visible, wantPlay]);

  return (
    <div
      ref={box}
      // cn() concatenates (no conflict resolution): only add `relative` when the caller does not position the film.
      className={cn("group/film overflow-hidden", !/(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? "") && "relative", rounded && "rounded-[min(2vw,1.25rem)]", className)}
      style={{ backgroundColor: film.tone }}
    >
      <video
        ref={video}
        className={cn("absolute inset-0 h-full w-full object-cover", videoClassName)}
        poster={src.poster}
        muted
        loop
        playsInline
        preload={priority ? "auto" : "none"}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        width={film.width}
        height={film.height}
      >
        {size === "compact" ? (
          <>
            <source src={src.webmSmall} type="video/webm" />
            <source src={src.mp4Small} type="video/mp4" />
          </>
        ) : (
          <>
            <source src={src.webmSmall} type="video/webm" media="(max-width: 767px)" />
            <source src={src.mp4Small} type="video/mp4" media="(max-width: 767px)" />
            <source src={src.webm} type="video/webm" />
            <source src={src.mp4} type="video/mp4" />
          </>
        )}
      </video>
      {controls && (
        <button
          type="button"
          data-js-only
          onClick={() => setUserPaused(playing)}
          aria-label={playing ? `Pause film: ${film.title}` : `Play film: ${film.title}`}
          className={cn(
            "js-only absolute bottom-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-[opacity,background-color] duration-300",
            film.dark ? "bg-white/15 text-white hover:bg-white/30" : "bg-navy/10 text-navy hover:bg-navy/20",
            // Visible when paused (it is the way to start the film), on hover/focus while playing, and always on touch screens.
            playing ? "opacity-0 group-hover/film:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-80" : "opacity-100",
          )}
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 translate-x-px" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
