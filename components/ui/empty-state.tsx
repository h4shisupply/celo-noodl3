import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

export function EmptyState({
  title,
  titleId,
  descriptionId,
  description,
  icon,
  actions
}: {
  title: string;
  titleId?: string;
  descriptionId?: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  const emptyStateTitle = `${title}: ${description}`;

  return (
    <Card variant="soft" title={emptyStateTitle} className="overflow-hidden">
      <CardHeader className="space-y-3 bg-panel">
        {icon ? (
          <div
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent-border bg-accent-soft text-accent shadow-[0_8px_24px_rgba(112,71,223,0.12)]"
          >
            {icon}
          </div>
        ) : null}
        <CardTitle id={titleId}>{title}</CardTitle>
        <CardDescription id={descriptionId}>{description}</CardDescription>
      </CardHeader>
      {actions ? <CardContent className="flex flex-wrap gap-3">{actions}</CardContent> : null}
    </Card>
  );
}
