"use client";

import { RefreshCw } from "lucide-react";
import { useId } from "react";
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
  const actionTitle = `${actionLabel}: ${title}`;
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-overlay px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <Card className="w-full max-w-md border-line bg-panel shadow-float">
        <CardContent className="px-6 py-7 text-center sm:px-8 sm:py-8">
          <p className="break-words text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
          <h2 id={titleId} className="mt-4 break-words text-3xl font-semibold text-ink">
            {title}
          </h2>
          <p id={descriptionId} className="mt-4 break-words text-sm leading-7 text-muted">
            {description}
          </p>
          <Button
            size="lg"
            className="mt-8 min-w-[13rem]"
            icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
            aria-label={actionTitle}
            title={actionTitle}
            autoFocus
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
