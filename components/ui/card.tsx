import clsx from "clsx";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "soft" | "accent";
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border shadow-[0_18px_48px_rgba(27,23,43,0.07)]",
        variant === "default" && "border-[#E5E1EE] bg-white",
        variant === "soft" && "border-[#E5E1EE] bg-[#FBFCFF]",
        variant === "accent" && "border-[#D9D0F4] bg-[#F9F6FF]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("px-5 pt-5 md:px-6 md:pt-6", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("px-5 pb-5 md:px-6 md:pb-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={clsx("text-xl font-semibold text-[#1B172B]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx("text-sm leading-6 text-[#676078]", className)}
      {...props}
    />
  );
}
