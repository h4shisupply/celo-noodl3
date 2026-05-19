import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

export function EmptyState({
  title,
  description,
  icon,
  actions
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card variant="soft" className="overflow-hidden">
      <CardHeader className="space-y-3 bg-panel">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent shadow-[0_8px_24px_rgba(112,71,223,0.12)]">
            {icon}
          </div>
        ) : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {actions ? <CardContent className="flex flex-wrap gap-3">{actions}</CardContent> : null}
    </Card>
  );
}
