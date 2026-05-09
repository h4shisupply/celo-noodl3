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
    <Card variant="soft">
      <CardHeader className="space-y-3">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#D9D0F4] bg-[#F3EFFF] text-[#7047DF]">
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
