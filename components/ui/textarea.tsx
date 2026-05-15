import clsx from "clsx";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "min-h-[112px] w-full min-w-0 rounded-lg border border-line bg-panel-soft px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-muted-soft focus:border-accent-border focus:bg-panel focus:ring-4 focus:ring-accent-focus disabled:cursor-not-allowed disabled:opacity-65",
        className
      )}
      {...props}
    />
  );
});
