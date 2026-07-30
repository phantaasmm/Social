import { AlertCircle, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { Button, Input } from "../../components/ui";
import {
  getAuthErrorMessage,
  getEmailRedirectUrl,
} from "../../lib/auth-errors";
import { supabase } from "../../lib/supabase";

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: getEmailRedirectUrl(),
      },
    });

    if (signUpError) {
      setError(getAuthErrorMessage(signUpError));
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      navigate("/", { replace: true });
      return;
    }

    navigate("/verify-email", {
      replace: true,
      state: { email: normalizedEmail },
    });
  };

  return (
    <AuthCard
      eyebrow="Verified access"
      title="Create your account"
      description="Use your official organisation email. We’ll send a link to verify it belongs to you."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-hover focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
          </Link>
        </>
      }
    >
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
          label="Official email address"
          type="email"
          autoComplete="email"
          placeholder="you@college.edu"
          hint="Your email domain determines which organisation spaces you can join."
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          leadingIcon={<Mail size={18} aria-hidden="true" />}
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Enter the same password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-xs leading-5 text-muted">
        Your profile and verified email domain are created automatically after
        signup.
      </p>
    </AuthCard>
  );
}
