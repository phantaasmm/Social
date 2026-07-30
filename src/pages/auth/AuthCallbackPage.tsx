import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FullPageLoader } from "../../features/auth/FullPageLoader";
import { getAuthErrorMessage } from "../../lib/auth-errors";
import { supabase } from "../../lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const completeVerification = async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          if (isMounted) {
            setError(getAuthErrorMessage(exchangeError));
          }
          return;
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        if (isMounted) {
          setError(getAuthErrorMessage(sessionError));
        }
        return;
      }

      if (!isMounted) {
        return;
      }

      navigate(data.session ? "/" : "/login?verified=true", {
        replace: true,
      });
    };

    void completeVerification();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (!error) {
    return <FullPageLoader message="Verifying your email…" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 text-center shadow-card">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-h2 text-foreground">
          Verification link failed
        </h1>
        <p className="mt-2 text-small leading-6 text-muted">{error}</p>
        <Link
          to="/verify-email"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-small font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Request a new link
        </Link>
      </div>
    </div>
  );
}
