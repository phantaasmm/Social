import { BadgeCheck } from "lucide-react";
import { cn } from "../../lib/cn";

interface BrandProps {
  compact?: boolean;
  className?: string;
}

export function Brand({ compact = false, className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <span className="text-h3 font-bold" aria-hidden="true">
          C
        </span>
        <BadgeCheck
          size={15}
          className="absolute -bottom-1 -right-1 rounded-full bg-surface text-accent"
          aria-hidden="true"
        />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-h3 font-bold tracking-tight text-foreground">
            CommonGround
          </span>
          <span className="block text-xs text-muted">Verified circles</span>
        </span>
      )}
    </div>
  );
}
