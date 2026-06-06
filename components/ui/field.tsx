import clsx from "clsx";
import type { ReactNode } from "react";

export function Field({
  label,
  description,
  descriptionId,
  children,
  className
}: {
  label: string;
  description?: ReactNode;
  descriptionId?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("block min-w-0 space-y-2", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
      {description ? (
        <span id={descriptionId} className="block text-xs leading-5 text-muted">
          {description}
        </span>
      ) : null}
    </label>
  );
}
