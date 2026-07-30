import { Building2, Globe2, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { Post } from "../../../lib/database.types";

interface AudienceOption {
  value: Post["visibility"];
  label: string;
  description: string;
  icon: LucideIcon;
}

interface AudiencePickerProps {
  value: Post["visibility"];
  onChange: (visibility: Post["visibility"]) => void;
  organisationDomain?: string;
  disabled?: boolean;
}

export function AudiencePicker({
  value,
  onChange,
  organisationDomain,
  disabled,
}: AudiencePickerProps) {
  const options: AudienceOption[] = [
    {
      value: "public",
      label: "Public",
      description: "Everyone, unless your account is private",
      icon: Globe2,
    },
    {
      value: "friends",
      label: "Friends",
      description: "Only accepted friends",
      icon: UsersRound,
    },
    {
      value: "organisation",
      label: "Organisation",
      description: organisationDomain
        ? `Verified ${organisationDomain} members`
        : "Your verified email domain",
      icon: Building2,
    },
  ];

  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-small font-semibold text-foreground">
        Audience
      </legend>
      <div className="space-y-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface hover:bg-surface-2",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="audience"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted",
                )}
              >
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-small font-semibold text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {value === "organisation" && (
        <p className="mt-2 rounded-lg bg-accent/10 p-3 text-xs leading-5 text-muted">
          Organisation posts remain visible to verified members of your domain,
          even when your account is private.
        </p>
      )}
    </fieldset>
  );
}
