"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { getInitials, normalizeImageUrl } from "../lib/format";

const SIZE_CLASS = {
  sm: "h-11 w-11 rounded-[16px] text-sm",
  md: "h-14 w-14 rounded-[20px] text-base",
  lg: "h-16 w-16 rounded-[24px] text-lg"
} as const;

export function StoreLogo({
  name,
  imageUrl,
  size = "md",
  className
}: {
  name: string;
  imageUrl?: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  const [didFail, setDidFail] = useState(false);
  const safeImageUrl = useMemo(() => normalizeImageUrl(imageUrl || ""), [imageUrl]);
  const showImage = Boolean(safeImageUrl) && !didFail;

  return (
    <div
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-[#ECEAF4] bg-[#F7F4FC] font-semibold tracking-[0.08em] text-[#6D6783]",
        SIZE_CLASS[size],
        className
      )}
      aria-label={`${name} logo`}
    >
      {showImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={safeImageUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setDidFail(true)}
          />
        </>
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
