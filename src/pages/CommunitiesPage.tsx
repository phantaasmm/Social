import {
  AlertCircle,
  Building2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Button,
  Input,
  Modal,
  useToast,
} from "../components/ui";
import { CommunityCard } from "../features/communities/CommunityCard";
import { useCommunities } from "../features/communities/use-communities";
import { useProfile } from "../features/profile/use-profile";
import type { Community } from "../lib/database.types";

export function CommunitiesPage() {
  const {
    communities,
    isLoading,
    error,
    refreshCommunities,
    getMembership,
    joinCommunity,
    leaveCommunity,
  } = useCommunities();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [busyCommunity, setBusyCommunity] = useState<{
    id: string;
    action: "join" | "leave";
  } | null>(null);
  const [communityToLeave, setCommunityToLeave] =
    useState<Community | null>(null);

  const filteredCommunities = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return communities;
    }

    return communities.filter(
      (community) =>
        community.name.toLowerCase().includes(term) ||
        community.description?.toLowerCase().includes(term) ||
        community.allowed_domain.toLowerCase().includes(term),
    );
  }, [communities, query]);

  const handleJoin = async (community: Community) => {
    setBusyCommunity({ id: community.id, action: "join" });

    try {
      await joinCommunity(community);
      toast({
        title: `Joined ${community.name}`,
        description: "You can now view its member directory.",
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
      setBusyCommunity(null);
    }
  };

  const handleLeave = async () => {
    if (!communityToLeave) {
      return;
    }

    setBusyCommunity({ id: communityToLeave.id, action: "leave" });

    try {
      await leaveCommunity(communityToLeave);
      toast({
        title: `Left ${communityToLeave.name}`,
        variant: "success",
      });
      setCommunityToLeave(null);
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
      setBusyCommunity(null);
    }
  };

  return (
    <section aria-labelledby="communities-title">
      <PageHeader
        id="communities-title"
        title="Communities"
        description="Browse trusted spaces gated by verified organisation domains."
        action={
          <Link
            to="/communities/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-small font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus size={17} aria-hidden="true" />
            <span className="hidden sm:inline">Create</span>
          </Link>
        }
      />

      {error && (
        <div
          className="mx-4 mb-4 flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-small text-danger sm:mx-0 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span className="flex items-start gap-2.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            {error}
          </span>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={16} aria-hidden="true" />}
            onClick={() => void refreshCommunities()}
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && communities.length > 0 && (
        <div className="mb-5 px-4 sm:px-0">
          <Input
            aria-label="Filter communities"
            leadingIcon={<Search size={18} aria-hidden="true" />}
            placeholder="Filter by name or domain"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-0">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-card border border-border bg-surface"
            />
          ))}
        </div>
      ) : communities.length === 0 && !error ? (
        <div className="flex min-h-80 flex-col items-center justify-center border-y border-border bg-surface px-6 py-12 text-center sm:rounded-card sm:border">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 size={27} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-h2 text-foreground">
            Create the first community
          </h2>
          <p className="mt-2 max-w-sm text-small leading-6 text-muted">
            Start a trusted space for people sharing your verified email domain.
          </p>
          <Link
            to="/communities/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus size={17} aria-hidden="true" />
            Create community
          </Link>
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center border-y border-border bg-surface px-6 py-10 text-center sm:rounded-card sm:border">
          <Search size={27} className="text-muted" aria-hidden="true" />
          <h2 className="mt-4 text-h3 text-foreground">No matches</h2>
          <p className="mt-1 text-small text-muted">
            Try a different community name or domain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-0">
          {filteredCommunities.map((community) => {
            const activeBusy =
              busyCommunity?.id === community.id
                ? busyCommunity.action
                : undefined;

            return (
              <CommunityCard
                key={community.id}
                community={community}
                membership={getMembership(community.id)}
                userDomain={profile?.email_domain}
                busyAction={activeBusy}
                onJoin={() => void handleJoin(community)}
                onLeave={() => setCommunityToLeave(community)}
              />
            );
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(communityToLeave)}
        onClose={() => {
          if (!busyCommunity) {
            setCommunityToLeave(null);
          }
        }}
        title="Leave community?"
        description={
          communityToLeave
            ? `You will lose access to the ${communityToLeave.name} member directory.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={Boolean(busyCommunity)}
              onClick={() => setCommunityToLeave(null)}
            >
              Stay
            </Button>
            <Button
              variant="destructive"
              isLoading={busyCommunity?.action === "leave"}
              onClick={() => void handleLeave()}
            >
              Leave community
            </Button>
          </>
        }
      >
        <p className="text-small leading-6 text-muted">
          You can rejoin later as long as your verified email domain still
          matches.
        </p>
      </Modal>
    </section>
  );
}
