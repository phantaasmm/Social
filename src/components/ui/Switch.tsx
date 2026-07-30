import { cn } from "../../lib/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-surface-2 p-4",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-small font-semibold text-foreground">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs leading-5 text-muted">
            {description}
          </span>
        )}
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span
        className="relative h-7 w-12 shrink-0 rounded-full bg-muted/40 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
        aria-hidden="true"
      >
        <span
          className={cn(
            "absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
    </label>
  );
}
