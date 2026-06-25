import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, placeholder, title, "aria-label": ariaLabel, ...props }, ref) {
    const inputTitle = title ?? (typeof ariaLabel === "string" ? ariaLabel : placeholder);

    return (
      <input
        ref={ref}
        aria-label={ariaLabel}
        className={clsx(
          "h-12 w-full min-w-0 rounded-lg border border-line bg-panel px-4 text-sm font-medium text-ink outline-none transition placeholder:text-muted-soft hover:border-accent-border focus:border-accent-border focus:bg-panel focus:ring-4 focus:ring-accent-focus disabled:cursor-not-allowed disabled:bg-panel-soft disabled:opacity-65 disabled:hover:border-line",
          className
        )}
        placeholder={placeholder}
        title={inputTitle}
        {...props}
      />
    );
  }
);
