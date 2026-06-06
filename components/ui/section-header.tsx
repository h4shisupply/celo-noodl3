import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-3">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h1 className="min-w-0 break-words text-3xl font-semibold text-ink md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl break-words text-sm leading-7 text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
