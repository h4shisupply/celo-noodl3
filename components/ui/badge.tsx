import clsx from "clsx";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "accent" | "mint" | "sun" | "neutral" | "danger";
};

export function Badge({ children, className, title, variant = "accent", ...props }: BadgeProps) {
  const badgeTitle =
    title ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined);

  return (
    <span
      title={badgeTitle}
      className={clsx(
        "inline-flex min-w-0 max-w-full items-center break-words rounded-full border px-3 py-1 text-left text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] whitespace-normal",
        variant === "accent" && "border-accent-border bg-accent-soft text-accent",
        variant === "mint" && "border-mint-border bg-mint-soft text-mint-strong",
        variant === "sun" && "border-sun-border bg-sun-soft text-sun-strong",
        variant === "neutral" && "border-line bg-panel-soft text-muted",
        variant === "danger" && "border-danger-border bg-danger-soft text-danger",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
