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
  const width = Math.min(100, Math.round((value / safeTotal) * 100));
  const safeValue = Math.min(value, safeTotal);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 break-words text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {unitLabel ?? dictionary.common.stampsLabel}
        </p>
        <p className="shrink-0 rounded-full bg-sun-soft px-2.5 py-1 text-xs font-semibold text-sun-strong tabular-nums">
          {safeValue}/{total}
        </p>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full border border-line-soft bg-panel-soft shadow-inner"
        role="progressbar"
        aria-label={unitLabel ?? dictionary.common.stampsLabel}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeValue}
        aria-valuetext={`${safeValue}/${total}`}
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
