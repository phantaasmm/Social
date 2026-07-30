import { BadgeCheck, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "../../components/ui";
import type { Profile } from "../../lib/database.types";

interface PersonRowProps {
  profile: Profile;
  action?: ReactNode;
  context?: string;
}

export function PersonRow({ profile, action, context }: PersonRowProps) {
  const name = profile.display_name || profile.username;

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar src={profile.avatar_url} name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-small font-semibold text-foreground">
              {name}
            </h3>
            <BadgeCheck
              size={15}
              className="shrink-0 text-accent"
              aria-label="Verified email"
            />
            {profile.is_private && (
              <LockKeyhole
                size={14}
                className="shrink-0 text-muted"
                aria-label="Private account"
              />
            )}
          </div>
          <p className="truncate text-small text-muted">@{profile.username}</p>
          {context && <p className="mt-0.5 text-xs text-muted">{context}</p>}
        </div>
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2 sm:justify-end">
          {action}
        </div>
      )}
    </article>
  );
}
