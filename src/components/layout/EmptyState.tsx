import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "../ui";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
        <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={27} aria-hidden="true" />
        </span>
        <h2 className="text-h2 text-foreground">{title}</h2>
        <p className="mt-2 max-w-sm text-small leading-6 text-muted">
          {description}
        </p>
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}
