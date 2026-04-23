import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-[#E6DDFB] bg-[#F7F3FF] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#7B3FE4]",
        className
      )}
      {...props}
    />
  );
}
