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
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#676078]">
          {unitLabel ?? dictionary.common.stampsLabel}
        </p>
        <p className="rounded-full bg-[#FFF7E8] px-2.5 py-1 text-xs font-semibold text-[#8B5B00]">
          {safeValue}/{total}
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#EDF1F8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0F9F8F] via-[#7047DF] to-[#F5A623] transition-[width]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
