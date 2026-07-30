import {
  ArrowRight,
  BadgeCheck,
  Building2,
  LockKeyhole,
  LogOut,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent } from "../../components/ui";
import type {
  Community,
  CommunityMember,
} from "../../lib/database.types";

interface CommunityCardProps {
  community: Community & { member_count: number };
  membership?: CommunityMember;
  userDomain?: string;
  busyAction?: "join" | "leave";
  onJoin: () => void;
  onLeave: () => void;
}

export function CommunityCard({
  community,
  membership,
  userDomain,
  busyAction,
  onJoin,
  onLeave,
}: CommunityCardProps) {
  const domainMatches =
    userDomain?.toLowerCase() === community.allowed_domain.toLowerCase();
  const isOwner = membership?.role === "owner";

  return (
    <Card className="flex h-full flex-col shadow-none">
      <CardContent className="flex flex-1 flex-col pt-5 sm:pt-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 size={21} aria-hidden="true" />
          </span>
          {isOwner ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <BadgeCheck size={13} aria-hidden="true" />
              Owner
            </span>
          ) : membership ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <BadgeCheck size={13} aria-hidden="true" />
              Joined
            </span>
          ) : !domainMatches ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
              <LockKeyhole size={13} aria-hidden="true" />
              Domain locked
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 line-clamp-2 text-h3 text-foreground">
          {community.name}
        </h2>
        <p className="mt-2 line-clamp-3 min-h-[63px] text-small leading-5 text-muted">
          {community.description || "A verified community space."}
        </p>

        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-xs text-muted">
            <LockKeyhole size={14} aria-hidden="true" />
            <span className="truncate">{community.allowed_domain}</span>
          </p>
          <p className="flex items-center gap-2 text-xs text-muted">
            <UsersRound size={14} aria-hidden="true" />
            {community.member_count}{" "}
            {community.member_count === 1 ? "member" : "members"}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            to={`/communities/${community.slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-small font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          {isOwner ? null : membership ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Leave ${community.name}`}
              title="Leave community"
              leftIcon={<LogOut size={18} aria-hidden="true" />}
              isLoading={busyAction === "leave"}
              onClick={onLeave}
            />
          ) : domainMatches ? (
            <Button
              className="flex-1"
              leftIcon={<UserPlus size={17} aria-hidden="true" />}
              isLoading={busyAction === "join"}
              onClick={onJoin}
            >
              Join
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="flex-1"
              leftIcon={<LockKeyhole size={17} aria-hidden="true" />}
              disabled
            >
              Locked
            </Button>
          )}
        </div>

        {!membership && !domainMatches && (
          <p className="mt-2 text-xs leading-5 text-muted">
            Only members of {community.allowed_domain} can join.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
