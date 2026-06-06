"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type ToggleRowProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
  icon?: ReactNode;
};

export function ToggleRow({
  label,
  description,
  icon,
  className,
  checked,
  ...props
}: ToggleRowProps) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-panel p-3 text-sm shadow-[0_8px_24px_rgba(27,23,43,0.035)] transition hover:border-accent-border hover:bg-accent-soft focus-within:ring-2 focus-within:ring-accent-focus",
        checked && "border-mint-border bg-mint-soft shadow-[0_8px_24px_rgba(15,159,143,0.1)]",
        props.disabled && "cursor-not-allowed opacity-65",
        className
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} {...props} />
      <span
        className={clsx(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
          checked
            ? "border-mint bg-mint text-white"
            : "border-accent-border bg-panel text-transparent"
        )}
        aria-hidden="true"
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      {icon ? (
        <span className="mt-0.5 text-accent" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 space-y-1">
        <span className="block break-words font-semibold text-ink-soft">{label}</span>
        {description ? (
          <span className="block break-words leading-6 text-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
