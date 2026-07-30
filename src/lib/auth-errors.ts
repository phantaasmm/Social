const authErrorMessages: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "The email or password is incorrect."],
  [
    /email not confirmed/i,
    "Verify your email address before signing in.",
  ],
  [
    /user already registered/i,
    "An account with this email already exists. Try signing in.",
  ],
  [
    /password should be at least/i,
    "Use a password with at least 8 characters.",
  ],
  [
    /email rate limit exceeded/i,
    "Too many emails were requested. Please wait before trying again.",
  ],
  [
    /signup is disabled/i,
    "New account registration is currently unavailable.",
  ],
];

export function getAuthErrorMessage(error: unknown) {
  const rawMessage =
    error instanceof Error ? error.message : "Something went wrong.";

  const match = authErrorMessages.find(([pattern]) =>
    pattern.test(rawMessage),
  );

  return match?.[1] ?? rawMessage;
}

export function getEmailRedirectUrl() {
  return `${window.location.origin}/auth/callback`;
}
