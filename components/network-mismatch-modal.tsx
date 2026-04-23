"use client";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export function NetworkMismatchModal({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17122A]/48 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-md border-[#E8E1F1] bg-white shadow-[0_28px_90px_rgba(23,18,42,0.18)]">
        <CardContent className="px-6 py-7 text-center sm:px-8 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B84A1]">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#18122A]">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#625B78]">{description}</p>
          <Button size="lg" className="mt-8 min-w-[13rem]" onClick={onAction}>
            {actionLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
