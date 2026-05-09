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
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7047DF]/20 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "min-h-9 px-3.5 py-2 text-sm",
        size === "md" && "min-h-11 px-4 py-2.5 text-sm",
        size === "lg" && "min-h-12 px-5 py-3 text-base",
        size === "icon" && "h-10 w-10 p-0",
        variant === "primary" &&
          "border-transparent bg-[#1B172B] text-white shadow-[0_12px_28px_rgba(27,23,43,0.16)] hover:bg-[#100C1E]",
        variant === "secondary" &&
          "border-[#E5E1EE] bg-[#F7F9FF] text-[#241B3C] hover:bg-[#EFF4FF]",
        variant === "outline" &&
          "border-[#DCD6EA] bg-white text-[#241B3C] hover:border-[#CFC6E4] hover:bg-[#F9F7FF]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-[#676078] hover:bg-[#F3EFFD] hover:text-[#1B172B]",
        variant === "warm" &&
          "border-[#F5DFC1] bg-[#FFF7E8] text-[#8B5B00] hover:bg-[#FFEECF]",
        variant === "success" &&
          "border-[#BDE8D8] bg-[#E9FBF7] text-[#146B5E] hover:bg-[#DDF7F0]",
        className
      )}
      {...props}
    >
      {icon && iconPosition === "start" ? (
        <span className="grid h-4 w-4 place-items-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children ? <span className="min-w-0 truncate">{children}</span> : null}
      {icon && iconPosition === "end" ? (
        <span className="grid h-4 w-4 place-items-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </button>
  );
}
