import {
  AlertCircle,
  Check,
  Clock3,
  Search,
  UserCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Button, Input, useToast } from "../../components/ui";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../lib/database.types";
import { useAuth } from "../auth/use-auth";
import { useFriendships } from "./use-friendships";
import { PersonRow } from "./PersonRow";

function escapePostgrestValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function PeopleSearchPanel() {
  const { user } = useAuth();
  const {
    getFriendshipWith,
    sendFriendRequest,
    acceptFriendRequest,
    isLoading: areFriendshipsLoading,
    error: friendshipsError,
  } = useFriendships();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [busyProfileId, setBusyProfileId] = useState<string | null>(null);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const term = query.trim();

    if (term.length < 2) {
      setSearchError("Enter at least 2 characters to search.");
      setResults([]);
      setSearchedTerm("");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchedTerm(term);

    const escapedTerm = escapePostgrestValue(term);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, bio, email_domain, is_private, created_at",
      )
      .neq("id", user.id)
      .or(
        `username.ilike."*${escapedTerm}*",display_name.ilike."*${escapedTerm}*"`,
      )
      .order("display_name", { ascending: true })
      .limit(30);

    if (error) {
      setResults([]);
      setSearchError(`Search failed: ${error.message}`);
      setIsSearching(false);
      return;
    }

    setResults(data ?? []);
    setIsSearching(false);
  };

  const handleRelationshipAction = async (profile: Profile) => {
    const friendship = getFriendshipWith(profile.id);
    setBusyProfileId(profile.id);

    try {
      if (
        friendship?.status === "pending" &&
        friendship.addressee_id === user?.id
      ) {
        await acceptFriendRequest(friendship.id);
        toast({
          title: `You and ${profile.display_name || profile.username} are now friends`,
          variant: "success",
        });
      } else if (!friendship) {
        await sendFriendRequest(profile.id);
        toast({
          title: "Friend request sent",
          description: `Your request to ${profile.display_name || profile.username} is pending.`,
          variant: "success",
        });
      }
    } catch (actionError) {
      toast({
        title: "Action failed",
        description:
          actionError instanceof Error
            ? actionError.message
            : "Please try again.",
        variant: "error",
      });
    } finally {
      setBusyProfileId(null);
    }
  };

  const renderAction = (profile: Profile) => {
    const friendship = getFriendshipWith(profile.id);
    const isBusy = busyProfileId === profile.id;

    if (areFriendshipsLoading) {
      return (
        <Button variant="secondary" disabled>
          Checking…
        </Button>
      );
    }

    if (friendshipsError) {
      return (
        <Button variant="secondary" disabled>
          Unavailable
        </Button>
      );
    }

    if (friendship?.status === "accepted") {
      return (
        <Button
          variant="secondary"
          leftIcon={<UserCheck size={17} aria-hidden="true" />}
          disabled
        >
          Friends
        </Button>
      );
    }

    if (
      friendship?.status === "pending" &&
      friendship.requester_id === user?.id
    ) {
      return (
        <Button
          variant="secondary"
          leftIcon={<Clock3 size={17} aria-hidden="true" />}
          disabled
        >
          Requested
        </Button>
      );
    }

    if (
      friendship?.status === "pending" &&
      friendship.addressee_id === user?.id
    ) {
      return (
        <Button
          leftIcon={<Check size={17} aria-hidden="true" />}
          isLoading={isBusy}
          onClick={() => void handleRelationshipAction(profile)}
        >
          Accept
        </Button>
      );
    }

    return (
      <Button
        leftIcon={<UserPlus size={17} aria-hidden="true" />}
        isLoading={isBusy}
        onClick={() => void handleRelationshipAction(profile)}
      >
        Add friend
      </Button>
    );
  };

  return (
    <div className="px-4 pb-1 sm:px-5">
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
        onSubmit={handleSearch}
      >
        <Input
          aria-label="Search people"
          leadingIcon={<Search size={19} aria-hidden="true" />}
          placeholder="Search by name or username"
          hint="Search is case-insensitive. Enter at least 2 characters."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
          type="submit"
          className="w-full sm:w-auto"
          isLoading={isSearching}
        >
          Search
        </Button>
      </form>

      {searchError && (
        <div
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-small text-danger"
          role="alert"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          {searchError}
        </div>
      )}

      {isSearching ? (
        <div className="mt-5 space-y-3" aria-label="Loading search results">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-3 rounded-card border border-border p-4"
            >
              <div className="h-12 w-12 rounded-full bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-surface-2" />
                <div className="h-3 w-24 rounded bg-surface-2" />
              </div>
              <div className="h-11 w-28 rounded-lg bg-surface-2" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            {results.length} {results.length === 1 ? "person" : "people"} found
          </p>
          <div className="space-y-3">
            {results.map((profile) => (
              <PersonRow
                key={profile.id}
                profile={profile}
                action={renderAction(profile)}
              />
            ))}
          </div>
        </div>
      ) : searchedTerm ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-4 py-10 text-center">
          <UsersRound size={30} className="text-muted" aria-hidden="true" />
          <h2 className="mt-4 text-h3 text-foreground">No people found</h2>
          <p className="mt-1 max-w-sm text-small text-muted">
            No username or display name matched “{searchedTerm}”.
          </p>
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center px-4 py-10 text-center">
          <Search size={30} className="text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-h3 text-foreground">
            Find verified people
          </h2>
          <p className="mt-1 max-w-sm text-small leading-6 text-muted">
            Search by username or display name to grow your trusted network.
          </p>
        </div>
      )}
    </div>
  );
}
