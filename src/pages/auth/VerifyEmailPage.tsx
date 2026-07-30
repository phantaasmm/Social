import { CheckCircle2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { Button, Input, useToast } from "../../components/ui";
import {
  getAuthErrorMessage,
  getEmailRedirectUrl,
} from "../../lib/auth-errors";
import { supabase } from "../../lib/supabase";

interface VerifyLocationState {
  email?: string;
}

export function VerifyEmailPage() {
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as VerifyLocationState | null;
  const [email, setEmail] = useState(state?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter the email address you used to sign up.");
      return;
    }

    setError(null);
    setIsResending(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: getEmailRedirectUrl(),
      },
    });

    if (resendError) {
      setError(getAuthErrorMessage(resendError));
      setIsResending(false);
      return;
    }

    setIsResending(false);
    toast({
      title: "Verification email sent",
      description: "Check your inbox and spam folder for the new link.",
      variant: "success",
    });
  };

  return (
    <AuthCard
      title="Check your inbox"
      description="Open the verification link we sent before signing in."
      footer={
        <Link
          to="/login"
          className="font-semibold text-primary hover:text-primary-hover focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Return to sign in
        </Link>
      }
    >
      <div className="mb-6 flex justify-center">
        <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail size={29} aria-hidden="true" />
          <CheckCircle2
            size={19}
            className="absolute -bottom-1 -right-1 rounded-full bg-surface text-success"
            aria-hidden="true"
          />
        </span>
      </div>

      {state?.email && (
        <p className="mb-5 text-center text-small text-muted">
          Sent to{" "}
          <span className="font-semibold text-foreground">{state.email}</span>
        </p>
      )}

      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error ?? undefined}
          leadingIcon={<Mail size={18} aria-hidden="true" />}
        />
        <Button
          variant="secondary"
          className="w-full"
          leftIcon={<Send size={17} aria-hidden="true" />}
          isLoading={isResending}
          onClick={handleResend}
        >
          Resend verification email
        </Button>
      </div>
    </AuthCard>
  );
}
