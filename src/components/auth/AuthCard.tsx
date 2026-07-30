import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "../ui";

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Card>
      <CardHeader className="pb-5 text-center sm:p-7 sm:pb-5">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-h1 text-foreground">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-small leading-6 text-muted">
          {description}
        </p>
      </CardHeader>
      <CardContent className="pt-0 sm:p-7 sm:pt-0">
        {children}
        {footer && (
          <div className="mt-6 border-t border-border pt-5 text-center text-small text-muted">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
