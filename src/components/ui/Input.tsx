import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    hint,
    error,
    leadingIcon,
    trailingElement,
    className,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const message = error ?? hint;
  const messageId = message ? `${inputId}-message` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-small font-semibold text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-11 w-full rounded-lg border bg-surface-2 px-3 text-body text-foreground outline-none transition placeholder:text-muted/80 hover:border-muted/60 focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60",
            Boolean(leadingIcon) && "pl-10",
            Boolean(trailingElement) && "pr-11",
            error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          {...props}
        />
        {trailingElement && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            {trailingElement}
          </span>
        )}
      </div>
      {message && (
        <p
          id={messageId}
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-danger" : "text-muted",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
});
