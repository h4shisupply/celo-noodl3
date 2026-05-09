import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "h-12 w-full rounded-lg border border-[#DCD6EA] bg-[#FBFCFF] px-4 text-sm font-medium text-[#1B172B] outline-none transition placeholder:text-[#9A95AD] focus:border-[#9F84EB] focus:bg-white focus:ring-4 focus:ring-[#7047DF]/10 disabled:cursor-not-allowed disabled:opacity-65",
          className
        )}
        {...props}
      />
    );
  }
);
