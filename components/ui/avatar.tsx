import clsx from "clsx";
import { getInitials, normalizeImageUrl } from "../../lib/format";

export function Avatar({
  name,
  imageUrl,
  size = "md"
}: {
  name: string;
  imageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    xs: "h-9 w-9 text-xs",
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-base",
    lg: "h-20 w-20 text-xl",
    xl: "h-24 w-24 text-2xl"
  };

  const safeImageUrl = normalizeImageUrl(imageUrl || "");
  const safeBackgroundImage = safeImageUrl
    ? `linear-gradient(rgba(9, 9, 11, 0.2), rgba(9, 9, 11, 0.2)), url(${JSON.stringify(
        safeImageUrl
      )})`
    : undefined;

  return (
    <div
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-900 font-medium text-white",
        sizes[size]
      )}
      style={
        safeImageUrl
          ? {
              backgroundImage: safeBackgroundImage,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }
          : undefined
      }
    >
      {!safeImageUrl ? getInitials(name) : null}
    </div>
  );
}
