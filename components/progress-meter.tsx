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

  return (
    <div className="space-y-2">
      <div className="h-3 overflow-hidden rounded-full bg-[#F1EDF8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7B3FE4] to-[#B087F9] transition-[width]"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-[#8B84A1]">
        {value}/{total} {unitLabel ?? dictionary.common.stampsLabel}
      </p>
    </div>
  );
}
