import { LoaderCircle } from "lucide-react";
import { Brand } from "../../components/layout/Brand";

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({
  message = "Loading your account…",
}: FullPageLoaderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <Brand />
      <div
        className="flex items-center gap-2 text-small text-muted"
        role="status"
      >
        <LoaderCircle
          size={18}
          className="animate-spin text-primary"
          aria-hidden="true"
        />
        <span>{message}</span>
      </div>
    </div>
  );
}
