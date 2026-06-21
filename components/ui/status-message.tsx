import clsx from "clsx";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { HTMLAttributes } from "react";

type StatusTone = "success" | "error" | "warning" | "info";

const toneClasses = {
  success: "border-mint-border bg-mint-soft text-mint-strong",
  error: "border-danger-border bg-danger-soft text-danger",
  warning: "border-sun-border bg-sun-soft text-sun-strong",
  info: "border-accent-border bg-accent-soft text-accent"
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
  role,
  title,
  tone = "info",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  tone?: StatusTone;
}) {
  const Icon = icons[tone];
  const liveRole = role ?? (tone === "error" ? "alert" : "status");
  const messageTitle =
    title ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined);

  return (
    <p
      role={liveRole}
      aria-live={tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      title={messageTitle}
      className={clsx(
        "flex min-w-0 max-w-full items-start gap-2 rounded-lg border px-4 py-3 text-sm font-medium leading-6",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  );
}
