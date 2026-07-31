import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, Tabs } from "../components/ui";
import { ChessPanel } from "../features/chess/ChessPanel";
import { useChess } from "../features/chess/use-chess";
import { FriendsPanel } from "../features/friends/FriendsPanel";
import { PeopleSearchPanel } from "../features/friends/PeopleSearchPanel";
import { RequestsPanel } from "../features/friends/RequestsPanel";
import { useFriendships } from "../features/friends/use-friendships";

export function SearchPage() {
  const {
    incomingRequests,
    outgoingRequests,
    acceptedFriendships,
    isLoading,
    error,
    refreshFriendships,
  } = useFriendships();
  const { incomingChallenges } = useChess();
  const [activeTab, setActiveTab] = useState("discover");
  const requestCount = incomingRequests.length + outgoingRequests.length;

  const tabs = [
    {
      id: "discover",
      label: "Discover",
      content: <PeopleSearchPanel />,
    },
    {
      id: "requests",
      label: requestCount > 0 ? `Requests (${requestCount})` : "Requests",
      content: <RequestsPanel />,
    },
    {
      id: "friends",
      label:
        acceptedFriendships.length > 0
          ? `Friends (${acceptedFriendships.length})`
          : "Friends",
      content: <FriendsPanel onFindPeople={() => setActiveTab("discover")} />,
    },
    {
      id: "chess",
      label:
        incomingChallenges.length > 0
          ? `Chess (${incomingChallenges.length})`
          : "Chess",
      content: <ChessPanel />,
    },
  ];

  return (
    <section aria-labelledby="search-title">
      <PageHeader
        id="search-title"
        title="People"
        description="Find verified people, manage requests, and keep your friends list current."
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
            onClick={() => void refreshFriendships()}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="border-y border-border bg-surface sm:rounded-card sm:border">
        {isLoading ? (
          <div
            className="flex min-h-80 flex-col gap-4 p-5"
            aria-label="Loading friends"
          >
            <div className="h-11 animate-pulse rounded-lg bg-surface-2" />
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-card bg-surface-2"
              />
            ))}
          </div>
        ) : (
          <Tabs
            items={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="[&_[role=tablist]]:px-2 sm:[&_[role=tablist]]:px-3"
          />
        )}
      </div>
    </section>
  );
}
