import clsx from "clsx";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "accent" | "mint" | "sun" | "neutral" | "danger";
};

export function Badge({ className, variant = "accent", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        variant === "accent" && "border-[#D9D0F4] bg-[#F3EFFF] text-[#7047DF]",
        variant === "mint" && "border-[#BDE8D8] bg-[#E9FBF7] text-[#146B5E]",
        variant === "sun" && "border-[#F5DFC1] bg-[#FFF7E8] text-[#8B5B00]",
        variant === "neutral" && "border-[#E5E1EE] bg-[#F7F9FF] text-[#676078]",
        variant === "danger" && "border-[#F1D9D9] bg-[#FFF6F6] text-[#A23B3B]",
        className
      )}
      {...props}
    />
  );
}
