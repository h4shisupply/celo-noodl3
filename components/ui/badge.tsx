import clsx from "clsx";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "accent" | "mint" | "sun" | "neutral" | "danger";
};

export function Badge({ className, variant = "accent", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex max-w-full items-center rounded-full border px-3 py-1 text-left text-[11px] font-semibold uppercase leading-tight tracking-[0.12em]",
        variant === "accent" && "border-accent-border bg-accent-soft text-accent",
        variant === "mint" && "border-mint-border bg-mint-soft text-mint-strong",
        variant === "sun" && "border-sun-border bg-sun-soft text-sun-strong",
        variant === "neutral" && "border-line bg-panel-soft text-muted",
        variant === "danger" && "border-danger-border bg-danger-soft text-danger",
        className
      )}
      {...props}
    />
  );
}
