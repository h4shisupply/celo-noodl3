import clsx from "clsx";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, placeholder, title, "aria-label": ariaLabel, ...props }, ref) {
  const textareaTitle = title ?? (typeof ariaLabel === "string" ? ariaLabel : placeholder);

  return (
    <textarea
      ref={ref}
      aria-label={ariaLabel}
      className={clsx(
        "min-h-[112px] w-full min-w-0 rounded-lg border border-line bg-panel px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-muted-soft hover:border-accent-border focus:border-accent-border focus:bg-panel focus:ring-4 focus:ring-accent-focus disabled:cursor-not-allowed disabled:bg-panel-soft disabled:opacity-65 disabled:hover:border-line",
        className
      )}
      placeholder={placeholder}
      title={textareaTitle}
      {...props}
    />
  );
});
