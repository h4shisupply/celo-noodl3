import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "h-12 w-full rounded-2xl border border-[#E4DEEF] bg-[#FBFAFD] px-4 text-sm text-[#1B1630] outline-none transition placeholder:text-[#9A95AD] focus:border-[#B59AF2] focus:bg-white",
          className
        )}
        {...props}
      />
    );
  }
);
