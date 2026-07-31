import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Modal,
  useToast,
} from "../components/ui";
import { useCommunities } from "../features/communities/use-communities";
import { useProfile } from "../features/profile/use-profile";
import type {
  CommunityMember,
  Profile,
} from "../lib/database.types";
import { supabase } from "../lib/supabase";

interface MemberRecord {
  membership: CommunityMember;
  profile: Profile;
}

export function CommunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    communities,
    isLoading,
    error: communitiesError,
    refreshCommunities,
    getMembership,
    joinCommunity,
    leaveCommunity,
  } = useCommunities();
  const { profile: currentProfile } = useProfile();
  const { toast } = useToast();
  const community = communities.find((item) => item.slug === slug);
  const membership = community
    ? getMembership(community.id)
    : undefined;
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [areMembersLoading, setAreMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [action, setAction] = useState<"join" | "leave" | null>(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      if (!community || !membership) {
        setMembers([]);
        setMembersError(null);
        setAreMembersLoading(false);
        return;
      }

      setAreMembersLoading(true);
      setMembersError(null);

      const { data: memberRows, error: membershipError } = await supabase
        .from("community_members")
        .select("community_id, user_id, role, joined_at")
        .eq("community_id", community.id)
        .order("joined_at", { ascending: true });

      if (membershipError) {
        if (isMounted) {
          setMembers([]);
          setMembersError(
            `Members could not be loaded: ${membershipError.message}`,
          );
          setAreMembersLoading(false);
        }
        return;
      }

      const profileIds = (memberRows ?? []).map((item) => item.user_id);

      if (profileIds.length === 0) {
        if (isMounted) {
          setMembers([]);
          setAreMembersLoading(false);
        }
        return;
      }

      const { data: profileRows, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, bio, email_domain, is_private, created_at",
        )
        .in("id", profileIds);

      if (profilesError) {
        if (isMounted) {
          setMembers([]);
          setMembersError(
            `Member profiles could not be loaded: ${profilesError.message}`,
          );
          setAreMembersLoading(false);
        }
        return;
      }

      const profilesById = Object.fromEntries(
        (profileRows ?? []).map((profile) => [profile.id, profile]),
      );
      const records = (memberRows ?? [])
        .map((member) => {
          const memberProfile = profilesById[member.user_id];
          return memberProfile
            ? { membership: member, profile: memberProfile }
            : null;
        })
        .filter((record): record is MemberRecord => Boolean(record));

      if (isMounted) {
        setMembers(records);
        setAreMembersLoading(false);
      }
    };

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, [community, membership]);

  const domainMatches =
    currentProfile?.email_domain.toLowerCase() ===
    community?.allowed_domain.toLowerCase();

  const handleJoin = async () => {
    if (!community) {
      return;
    }

    setAction("join");

    try {
      await joinCommunity(community);
      toast({
        title: `Joined ${community.name}`,
        variant: "success",
      });
    } catch (joinError) {
      toast({
        title: "Could not join community",
        description:
          joinError instanceof Error ? joinError.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setAction(null);
    }
  };

  const handleLeave = async () => {
    if (!community) {
      return;
    }

    setAction("leave");

    try {
      await leaveCommunity(community);
      setIsLeaveOpen(false);
      toast({
        title: `Left ${community.name}`,
        variant: "success",
      });
    } catch (leaveError) {
      toast({
        title: "Could not leave community",
        description:
          leaveError instanceof Error
            ? leaveError.message
            : "Please try again.",
        variant: "error",
      });
    } finally {
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-6 sm:px-0 sm:pt-0">
        <div className="h-24 animate-pulse rounded-card bg-surface" />
        <div className="h-64 animate-pulse rounded-card bg-surface" />
      </div>
    );
  }

  if (communitiesError) {
    return (
      <section aria-labelledby="community-error-title">
        <PageHeader
          id="community-error-title"
          title="Community unavailable"
          description="This community could not be loaded right now."
        />
        <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
          <CardContent className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={30} className="text-danger" aria-hidden="true" />
            <p className="mt-4 max-w-md text-small leading-6 text-muted">
              {communitiesError}
            </p>
            <Button
              className="mt-5"
              variant="secondary"
              leftIcon={<RefreshCw size={17} aria-hidden="true" />}
              onClick={() => void refreshCommunities()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!community) {
    return (
      <section aria-labelledby="community-not-found-title">
        <PageHeader
          id="community-not-found-title"
          title="Community not found"
          description="This community may have been removed or the link is incorrect."
        />
        <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
          <CardContent className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
            <Building2 size={30} className="text-muted" aria-hidden="true" />
            <Link
              to="/communities"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-small font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Browse communities
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  const isOwner = membership?.role === "owner";

  return (
    <section aria-labelledby="community-title">
      <PageHeader
        id="community-title"
        title={community.name}
        description={community.description || "A verified community space."}
        action={
          <Link
            to="/communities"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to communities"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        }
      />

      <div className="space-y-4">
        <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
          <CardContent className="pt-5 sm:p-7 sm:pt-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 size={29} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
                    <LockKeyhole size={13} aria-hidden="true" />
                    {community.allowed_domain}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
                    <UsersRound size={13} aria-hidden="true" />
                    {community.member_count}{" "}
                    {community.member_count === 1 ? "member" : "members"}
                  </span>
                  {membership && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                      <BadgeCheck size={13} aria-hidden="true" />
                      {isOwner ? "Owner" : "Joined"}
                    </span>
                  )}
                </div>
                {!membership && !domainMatches && (
                  <p className="mt-3 flex items-start gap-2 text-small text-muted">
                    <LockKeyhole
                      size={16}
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    Only members of {community.allowed_domain} can join this
                    community.
                  </p>
                )}
              </div>
              <div className="shrink-0">
                {isOwner ? (
                  <Button
                    variant="secondary"
                    leftIcon={<ShieldCheck size={17} aria-hidden="true" />}
                    disabled
                  >
                    Owner
                  </Button>
                ) : membership ? (
                  <Button
                    variant="secondary"
                    leftIcon={<LogOut size={17} aria-hidden="true" />}
                    onClick={() => setIsLeaveOpen(true)}
                  >
                    Leave
                  </Button>
                ) : domainMatches ? (
                  <Button
                    leftIcon={<UserPlus size={17} aria-hidden="true" />}
                    isLoading={action === "join"}
                    onClick={() => void handleJoin()}
                  >
                    Join community
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    leftIcon={<LockKeyhole size={17} aria-hidden="true" />}
                    disabled
                  >
                    Domain locked
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
          <CardHeader className="border-b border-border">
            <h2 className="text-h2 text-foreground">Members</h2>
            <p className="mt-1 text-small text-muted">
              Verified people in this community
            </p>
          </CardHeader>
          <CardContent className="pt-5 sm:pt-6">
            {!membership ? (
              <div className="flex min-h-52 flex-col items-center justify-center text-center">
                <LockKeyhole
                  size={27}
                  className="text-muted"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-h3 text-foreground">
                  Member directory is private
                </h3>
                <p className="mt-1 max-w-sm text-small leading-6 text-muted">
                  Join this community to see its verified members.
                </p>
              </div>
            ) : areMembersLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-lg bg-surface-2"
                  />
                ))}
              </div>
            ) : membersError ? (
              <div
                className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-4 text-small text-danger"
                role="alert"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {membersError}
              </div>
            ) : members.length === 0 ? (
              <div className="py-10 text-center text-small text-muted">
                No member profiles are visible yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {members.map(({ membership: member, profile }) => {
                  const name = profile.display_name || profile.username;

                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <Avatar
                        src={profile.avatar_url}
                        name={name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-small font-semibold text-foreground">
                          {name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          @{profile.username}
                        </p>
                      </div>
                      <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold capitalize text-muted">
                        {member.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isLeaveOpen}
        onClose={() => {
          if (!action) {
            setIsLeaveOpen(false);
          }
        }}
        title="Leave community?"
        description={`You will lose access to the ${community.name} member directory.`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={Boolean(action)}
              onClick={() => setIsLeaveOpen(false)}
            >
              Stay
            </Button>
            <Button
              variant="destructive"
              isLoading={action === "leave"}
              onClick={() => void handleLeave()}
            >
              Leave community
            </Button>
          </>
        }
      >
        <p className="text-small leading-6 text-muted">
          You can rejoin later if your verified email domain still matches.
        </p>
      </Modal>
    </section>
  );
}
