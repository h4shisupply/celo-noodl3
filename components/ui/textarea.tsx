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
        "min-h-[112px] w-full rounded-lg border border-[#DCD6EA] bg-[#FBFCFF] px-4 py-3 text-sm font-medium text-[#1B172B] outline-none transition placeholder:text-[#9A95AD] focus:border-[#9F84EB] focus:bg-white focus:ring-4 focus:ring-[#7047DF]/10 disabled:cursor-not-allowed disabled:opacity-65",
        className
      )}
      {...props}
    />
  );
});
