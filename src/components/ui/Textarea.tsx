import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { id, label, hint, error, className, maxLength, value, ...props },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const message = error ?? hint;
    const messageId = message ? `${textareaId}-message` : undefined;
    const valueLength =
      typeof value === "string" || Array.isArray(value) ? value.length : 0;

    return (
      <div className="w-full">
        <div className="mb-1.5 flex items-center justify-between gap-4">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-small font-semibold text-foreground"
            >
              {label}
            </label>
          )}
          {maxLength && (
            <span className="text-xs text-muted" aria-live="polite">
              {valueLength}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-28 w-full resize-y rounded-lg border bg-surface-2 px-3 py-2.5 text-body text-foreground outline-none transition placeholder:text-muted/80 hover:border-muted/60 focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-border",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          maxLength={maxLength}
          value={value}
          {...props}
        />
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
  },
);
