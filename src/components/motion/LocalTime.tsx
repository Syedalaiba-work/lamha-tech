"use client";

import { useEffect, useState } from "react";

/** Live local time for LAMHA's base (Asia/Karachi). Renders nothing until mounted to avoid hydration drift. */
export function LocalTime({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Karachi" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={className} suppressHydrationWarning>
      <span className="opacity-70">Islamabad</span> <span className="tabular-nums">{time ?? "--:--:--"}</span> <span className="opacity-70">PKT</span>
    </span>
  );
}
