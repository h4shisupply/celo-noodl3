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
        "flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E1EE] bg-[#FBFCFF] p-3 text-sm transition hover:border-[#D9D0F4] hover:bg-[#F9F6FF]",
        checked && "border-[#BDE8D8] bg-[#E9FBF7]",
        props.disabled && "cursor-not-allowed opacity-65",
        className
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} {...props} />
      <span
        className={clsx(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
          checked
            ? "border-[#0F9F8F] bg-[#0F9F8F] text-white"
            : "border-[#CFC6E4] bg-white text-transparent"
        )}
        aria-hidden="true"
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      {icon ? (
        <span className="mt-0.5 text-[#7047DF]" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 space-y-1">
        <span className="block font-semibold text-[#241B3C]">{label}</span>
        {description ? (
          <span className="block leading-6 text-[#676078]">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
