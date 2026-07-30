import { Check, Clock3, X } from "lucide-react";
import { useState } from "react";
import { Button, useToast } from "../../components/ui";
import type { Friendship } from "../../lib/database.types";
import { PersonRow } from "./PersonRow";
import { useFriendships } from "./use-friendships";

export function RequestsPanel() {
  const {
    incomingRequests,
    outgoingRequests,
    getOtherProfile,
    acceptFriendRequest,
    deleteFriendship,
  } = useFriendships();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const runAction = async (
    friendship: Friendship,
    action: "accept" | "delete",
  ) => {
    setBusyId(friendship.id);

    try {
      if (action === "accept") {
        await acceptFriendRequest(friendship.id);
        toast({
          title: "Friend request accepted",
          variant: "success",
        });
      } else {
        await deleteFriendship(friendship.id);
        toast({
          title:
            friendship.status === "pending" &&
            incomingRequests.some((item) => item.id === friendship.id)
              ? "Request declined"
              : "Request cancelled",
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
      setBusyId(null);
    }
  };

  const renderIncoming = (friendship: Friendship) => {
    const profile = getOtherProfile(friendship);

    if (!profile) {
      return null;
    }

    const isBusy = busyId === friendship.id;

    return (
      <PersonRow
        key={friendship.id}
        profile={profile}
        context="Wants to be your friend"
        action={
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Decline request from ${profile.display_name || profile.username}`}
              title="Decline"
              disabled={isBusy}
              onClick={() => void runAction(friendship, "delete")}
            >
              <X size={18} aria-hidden="true" />
            </Button>
            <Button
              leftIcon={<Check size={17} aria-hidden="true" />}
              isLoading={isBusy}
              onClick={() => void runAction(friendship, "accept")}
            >
              Accept
            </Button>
          </>
        }
      />
    );
  };

  const renderOutgoing = (friendship: Friendship) => {
    const profile = getOtherProfile(friendship);

    if (!profile) {
      return null;
    }

    return (
      <PersonRow
        key={friendship.id}
        profile={profile}
        context="Waiting for a response"
        action={
          <Button
            variant="secondary"
            isLoading={busyId === friendship.id}
            onClick={() => void runAction(friendship, "delete")}
          >
            Cancel request
          </Button>
        }
      />
    );
  };

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Clock3 size={27} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-h3 text-foreground">No pending requests</h2>
        <p className="mt-1 max-w-sm text-small leading-6 text-muted">
          Incoming requests and the ones you send will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7 px-4 pb-1 sm:px-5">
      <section aria-labelledby="incoming-requests-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2
              id="incoming-requests-title"
              className="text-h3 text-foreground"
            >
              Incoming
            </h2>
            <p className="mt-0.5 text-small text-muted">
              Requests waiting for your response
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {incomingRequests.length}
          </span>
        </div>
        {incomingRequests.length > 0 ? (
          <div className="space-y-3">
            {incomingRequests.map(renderIncoming)}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border p-5 text-center text-small text-muted">
            No incoming requests.
          </div>
        )}
      </section>

      <section aria-labelledby="outgoing-requests-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2
              id="outgoing-requests-title"
              className="text-h3 text-foreground"
            >
              Sent
            </h2>
            <p className="mt-0.5 text-small text-muted">
              Requests waiting for the other person
            </p>
          </div>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
            {outgoingRequests.length}
          </span>
        </div>
        {outgoingRequests.length > 0 ? (
          <div className="space-y-3">
            {outgoingRequests.map(renderOutgoing)}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border p-5 text-center text-small text-muted">
            No sent requests.
          </div>
        )}
      </section>
    </div>
  );
}
