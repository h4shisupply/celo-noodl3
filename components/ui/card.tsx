import clsx from "clsx";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "soft" | "accent";
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border shadow-card backdrop-blur-sm",
        variant === "default" && "border-line bg-panel",
        variant === "soft" && "border-line bg-panel-soft",
        variant === "accent" && "border-accent-border bg-accent-soft",
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
      className={clsx("min-w-0 break-words text-xl font-semibold leading-tight text-ink", className)}
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
      className={clsx("min-w-0 break-words text-sm leading-6 text-muted", className)}
      {...props}
    />
  );
}
