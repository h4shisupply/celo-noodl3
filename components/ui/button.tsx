"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center rounded-full border font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FE4]/25 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" &&
          "border-transparent bg-[#17122A] text-white hover:bg-[#0E0A1C]",
        variant === "secondary" &&
          "border-[#ECEAF4] bg-[#F5F3FA] text-[#1D1830] hover:bg-[#EEEAF8]",
        variant === "outline" &&
          "border-[#DED9F0] bg-white text-[#241B3C] hover:bg-[#F7F5FF]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-[#6B6482] hover:bg-[#F5F4FA] hover:text-[#1E1832]",
        className
      )}
      {...props}
    />
  );
}
