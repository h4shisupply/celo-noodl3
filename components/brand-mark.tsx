"use client";

import Link from "next/link";

export function BrandMark({ href, ariaLabel }: { href: string; ariaLabel?: string }) {
  const linkTitle = ariaLabel ?? "noodl3";

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      title={linkTitle}
      className="inline-flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon.svg"
        alt=""
        width={40}
        height={40}
        aria-hidden="true"
        decoding="async"
        draggable={false}
        className="h-10 w-10 shrink-0 rounded-lg shadow-card"
      />
      <span className="min-w-0 break-words text-lg font-semibold text-ink">
        noodl3
      </span>
    </Link>
  );
}
