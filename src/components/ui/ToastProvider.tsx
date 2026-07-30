import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  ToastContext,
  type ToastContextValue,
  type ToastOptions,
  type ToastVariant,
} from "./toast-context";

interface ToastRecord extends Required<Pick<ToastOptions, "title" | "variant">> {
  id: string;
  description?: string;
}

interface ToastProviderProps {
  children: ReactNode;
}

const iconByVariant: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

const iconClasses: Record<ToastVariant, string> = {
  info: "text-accent",
  success: "text-success",
  error: "text-danger",
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = 4500,
    }: ToastOptions) => {
      nextId.current += 1;
      const id = `toast-${nextId.current}`;

      setToasts((current) => [
        ...current.slice(-2),
        { id, title, description, variant },
      ]);

      window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toast, dismiss }),
    [dismiss, toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-end gap-3 lg:bottom-6 lg:left-auto lg:right-6 lg:w-full lg:max-w-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((item) => {
          const Icon = iconByVariant[item.variant];

          return (
            <div
              key={item.id}
              className="toast-enter pointer-events-auto flex w-full items-start gap-3 rounded-card border border-border bg-surface p-4 text-foreground shadow-modal"
              role={item.variant === "error" ? "alert" : "status"}
            >
              <Icon
                size={20}
                className={cn("mt-0.5 shrink-0", iconClasses[item.variant])}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-small font-semibold">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-small text-muted">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
