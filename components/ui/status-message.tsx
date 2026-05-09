import clsx from "clsx";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { HTMLAttributes } from "react";

type StatusTone = "success" | "error" | "warning" | "info";

const toneClasses = {
  success: "border-[#BDE8D8] bg-[#E9FBF7] text-[#146B5E]",
  error: "border-[#F1D9D9] bg-[#FFF6F6] text-[#A23B3B]",
  warning: "border-[#F5DFC1] bg-[#FFF7E8] text-[#8B5B00]",
  info: "border-[#D9D0F4] bg-[#F3EFFF] text-[#7047DF]"
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info
};

export function StatusMessage({
  children,
  className,
  tone = "info",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  tone?: StatusTone;
}) {
  const Icon = icons[tone];

  return (
    <p
      className={clsx(
        "flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-medium leading-6",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
