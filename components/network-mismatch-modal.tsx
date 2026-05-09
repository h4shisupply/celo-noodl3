"use client";

import { RefreshCw } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B172B]/48 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-md border-[#E8E1F1] bg-white shadow-[0_28px_90px_rgba(27,23,43,0.18)]">
        <CardContent className="px-6 py-7 text-center sm:px-8 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7047DF]">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[#1B172B]">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#676078]">{description}</p>
          <Button
            size="lg"
            className="mt-8 min-w-[13rem]"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
