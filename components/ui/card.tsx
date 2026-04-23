import clsx from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-[32px] border border-[#ECEAF4] bg-white shadow-[0_20px_60px_rgba(23,18,42,0.05)]",
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
  return <div className={clsx("px-6 pt-6 md:px-7 md:pt-7", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("px-6 pb-6 md:px-7 md:pb-7", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={clsx("text-xl font-semibold tracking-tight text-[#1B1630]", className)}
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
      className={clsx("text-sm leading-7 text-[#6D6783]", className)}
      {...props}
    />
  );
}
