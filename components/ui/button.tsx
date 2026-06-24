"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "warm" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: ReactNode;
  iconPosition?: "start" | "end";
};

export function Button({
  className,
  children,
  icon,
  iconPosition = "start",
  title,
  variant = "primary",
  size = "md",
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  const buttonTitle =
    title ??
    (typeof ariaLabel === "string"
      ? ariaLabel
      : typeof children === "string" || typeof children === "number"
        ? String(children)
        : undefined);

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      title={buttonTitle}
      className={clsx(
        "inline-flex max-w-full shrink-0 select-none items-center justify-center gap-2 rounded-lg border font-semibold transition duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50",
        size === "sm" && "min-h-9 px-3.5 py-2 text-sm",
        size === "md" && "min-h-11 px-4 py-2.5 text-sm",
        size === "lg" && "min-h-12 px-5 py-3 text-base",
        size === "icon" && "h-10 w-10 p-0",
        variant === "primary" &&
          "border-transparent bg-ink text-white shadow-[0_12px_28px_rgba(27,23,43,0.18)] hover:bg-ink-hover hover:shadow-[0_16px_34px_rgba(27,23,43,0.22)]",
        variant === "secondary" &&
          "border-line bg-panel-soft text-ink-soft shadow-[0_8px_24px_rgba(27,23,43,0.045)] hover:border-accent-border hover:bg-accent-soft",
        variant === "outline" &&
          "border-line bg-panel text-ink-soft shadow-[0_8px_24px_rgba(27,23,43,0.045)] hover:border-accent-border hover:bg-accent-soft",
        variant === "ghost" &&
          "border-transparent bg-transparent text-muted hover:bg-accent-soft hover:text-ink",
        variant === "warm" &&
          "border-sun-border bg-sun-soft text-sun-strong shadow-[0_8px_24px_rgba(245,166,35,0.12)] hover:bg-sun-hover",
        variant === "success" &&
          "border-mint-border bg-mint-soft text-mint-strong shadow-[0_8px_24px_rgba(15,159,143,0.12)] hover:bg-mint-hover",
        className
      )}
      {...props}
    >
      {icon && iconPosition === "start" ? (
        <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children ? (
        <span className="min-w-0 whitespace-normal text-center leading-tight">
          {children}
        </span>
      ) : null}
      {icon && iconPosition === "end" ? (
        <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </button>
  );
}
