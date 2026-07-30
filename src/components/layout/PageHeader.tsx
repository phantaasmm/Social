import type { ReactNode } from "react";

interface PageHeaderProps {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({
  id,
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 px-4 pb-5 pt-6 sm:px-0 sm:pt-1">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 id={id} className="text-h1 text-foreground">
          {title}
        </h1>
        <p className="mt-1 max-w-lg text-small leading-6 text-muted">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}
