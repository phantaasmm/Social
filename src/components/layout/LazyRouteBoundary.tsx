import {
  Component,
  Suspense,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "../ui";
import { RouteFallback } from "./RouteFallback";

interface LazyRouteBoundaryProps {
  children: ReactNode;
}

interface ChunkErrorBoundaryProps extends LazyRouteBoundaryProps {
  routeKey: string;
}

interface ChunkErrorBoundaryState {
  error: Error | null;
}

const RETRY_WINDOW_MS = 15_000;

function isChunkLoadError(error: Error) {
  return (
    error.name === "ChunkLoadError" ||
    /loading chunk|failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i.test(
      error.message,
    )
  );
}

function getRetryStorageKey(routeKey: string) {
  return `social-chunk-retry:${routeKey}`;
}

function reloadPage(routeKey: string) {
  try {
    window.sessionStorage.setItem(
      getRetryStorageKey(routeKey),
      String(Date.now()),
    );
  } catch {
    // Reload recovery still works when storage is unavailable.
  }

  window.location.reload();
}

class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  state: ChunkErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Lazy route failed to load", error, errorInfo);

    if (!isChunkLoadError(error)) {
      return;
    }

    let lastRetry = 0;

    try {
      lastRetry = Number(
        window.sessionStorage.getItem(
          getRetryStorageKey(this.props.routeKey),
        ) ?? 0,
      );
    } catch {
      // Treat unavailable storage as no previous retry.
    }

    if (Date.now() - lastRetry > RETRY_WINDOW_MS) {
      reloadPage(this.props.routeKey);
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const chunkError = isChunkLoadError(this.state.error);

    return (
      <section
        className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center"
        role="alert"
        aria-labelledby="lazy-route-error-title"
      >
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertCircle size={27} aria-hidden="true" />
        </span>
        <h1
          id="lazy-route-error-title"
          className="mt-4 text-h2 text-foreground"
        >
          {chunkError ? "Page update interrupted" : "Page could not be opened"}
        </h1>
        <p className="mt-2 max-w-md text-small leading-6 text-muted">
          {chunkError
            ? "The page file did not finish downloading. Reload to fetch a fresh copy."
            : "An unexpected error occurred while rendering this page."}
        </p>
        <Button
          className="mt-5"
          leftIcon={<RefreshCw size={17} aria-hidden="true" />}
          onClick={() => reloadPage(this.props.routeKey)}
        >
          Reload page
        </Button>
      </section>
    );
  }
}

export function LazyRouteBoundary({ children }: LazyRouteBoundaryProps) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;

  return (
    <ChunkErrorBoundary key={routeKey} routeKey={routeKey}>
      <Suspense fallback={<RouteFallback />}>{children}</Suspense>
    </ChunkErrorBoundary>
  );
}
