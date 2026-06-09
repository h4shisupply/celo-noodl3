import { useLocale } from "./locale-provider";

export function ProgressMeter({
  value,
  total,
  unitLabel
}: {
  value: number;
  total: number;
  unitLabel?: string;
}) {
  const { dictionary } = useLocale();
  const safeTotal = Math.max(total, 1);
  const safeValue = Math.min(Math.max(value, 0), safeTotal);
  const width = Math.min(100, Math.round((safeValue / safeTotal) * 100));
  const label = unitLabel ?? dictionary.common.stampsLabel;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 break-words text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <p className="shrink-0 rounded-full bg-sun-soft px-2.5 py-1 text-xs font-semibold text-sun-strong tabular-nums">
          {safeValue}/{safeTotal}
        </p>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full border border-line-soft bg-panel-soft shadow-inner"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeValue}
        aria-valuetext={`${safeValue}/${safeTotal} ${label}`}
      >
        <div
          aria-hidden="true"
          className="h-full rounded-full bg-gradient-to-r from-mint via-accent to-sun transition-[width]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
