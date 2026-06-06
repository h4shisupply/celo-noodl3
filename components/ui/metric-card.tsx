import clsx from "clsx";
import type { ReactNode } from "react";
import { Card, CardContent } from "./card";

type MetricTone = "accent" | "mint" | "sun" | "neutral";

const toneClasses: Record<MetricTone, string> = {
  accent: "border-accent-border bg-accent-soft text-accent",
  mint: "border-mint-border bg-mint-soft text-mint-strong",
  sun: "border-sun-border bg-sun-soft text-sun-strong",
  neutral: "border-line bg-panel text-muted"
};

export function MetricCard({
  icon,
  label,
  value,
  tone = "mint",
  className
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  tone?: MetricTone;
  className?: string;
}) {
  return (
    <Card variant="soft" className={clsx("h-full overflow-hidden", className)}>
      <CardContent className="relative flex min-h-[7.25rem] items-center justify-between gap-4 pt-5">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mint via-accent to-sun" />
        <div className="min-w-0 space-y-2">
          <p className="break-words text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {label}
          </p>
          <p className="break-words text-3xl font-semibold text-ink tabular-nums">{value}</p>
        </div>
        <div
          aria-hidden="true"
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
            toneClasses[tone]
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
