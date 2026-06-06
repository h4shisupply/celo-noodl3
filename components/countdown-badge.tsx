"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function CountdownBadge({
  expiresAt,
  label,
  expiredLabel
}: {
  expiresAt: number;
  label: string;
  expiredLabel: string;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const remaining = expiresAt - now;
  const expired = remaining <= 0;
  const display = useMemo(() => formatSeconds(remaining), [remaining]);

  useEffect(() => {
    const currentNow = Math.floor(Date.now() / 1000);
    setNow(currentNow);
    if (currentNow >= expiresAt) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextNow = Math.floor(Date.now() / 1000);
      setNow(nextNow);
      if (nextNow >= expiresAt) {
        window.clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [expiresAt]);

  return (
    <span
      role="timer"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
        expired
          ? "border-danger-border bg-danger-soft text-danger"
          : "border-sun-border bg-sun-soft text-sun-strong"
      }`}
    >
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      {expired ? expiredLabel : `${label} ${display}`}
    </span>
  );
}
