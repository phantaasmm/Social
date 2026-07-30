import { AlertCircle, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { Button, Input } from "../../components/ui";
import { getAuthErrorMessage } from "../../lib/auth-errors";
import { supabase } from "../../lib/supabase";

interface LoginLocationState {
  returnTo?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isVerified = searchParams.get("verified") === "true";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(getAuthErrorMessage(signInError));
      setIsSubmitting(false);
      return;
    }

    const state = location.state as LoginLocationState | null;
    navigate(state?.returnTo || "/", { replace: true });
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in with your verified college or company email."
      footer={
        <>
          New to CommonGround?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:text-primary-hover focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create an account
          </Link>
        </>
      }
    >
      {isVerified && (
        <div className="mb-5 rounded-lg border border-success/30 bg-success/10 p-3 text-small text-success">
          Email verified. You can sign in now.
        </div>
      )}
      {error && (
        <div
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-small text-danger"
          role="alert"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@college.edu"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          leadingIcon={<Mail size={18} aria-hidden="true" />}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
