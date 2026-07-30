import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import type { InputProps } from "../ui";
import { Input } from "../ui";

type PasswordInputProps = Omit<
  InputProps,
  "type" | "leadingIcon" | "trailingElement"
>;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const label = isVisible ? "Hide password" : "Show password";

  return (
    <Input
      {...props}
      type={isVisible ? "text" : "password"}
      leadingIcon={<LockKeyhole size={18} aria-hidden="true" />}
      trailingElement={
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={label}
          title={label}
        >
          {isVisible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
