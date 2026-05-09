"use client";

import Link from "next/link";

export function BrandMark({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="noodl3" className="h-10 w-10 rounded-lg" />
      <span className="text-lg font-semibold text-[#1B172B]">
        noodl3
      </span>
    </Link>
  );
}
