import { UserMinus, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button, Modal, useToast } from "../../components/ui";
import type { Friendship } from "../../lib/database.types";
import { PersonRow } from "./PersonRow";
import { useFriendships } from "./use-friendships";

interface FriendsPanelProps {
  onFindPeople: () => void;
}

export function FriendsPanel({ onFindPeople }: FriendsPanelProps) {
  const {
    acceptedFriendships,
    getOtherProfile,
    deleteFriendship,
  } = useFriendships();
  const { toast } = useToast();
  const [selectedFriendship, setSelectedFriendship] =
    useState<Friendship | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const selectedProfile = selectedFriendship
    ? getOtherProfile(selectedFriendship)
    : undefined;

  const handleRemove = async () => {
    if (!selectedFriendship) {
      return;
    }

    setIsRemoving(true);

    try {
      await deleteFriendship(selectedFriendship.id);
      setSelectedFriendship(null);
      toast({
        title: "Friend removed",
        variant: "success",
      });
    } catch (removeError) {
      toast({
        title: "Could not remove friend",
        description:
          removeError instanceof Error
            ? removeError.message
            : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (acceptedFriendships.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UsersRound size={27} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-h3 text-foreground">
          Your friends will appear here
        </h2>
        <p className="mt-1 max-w-sm text-small leading-6 text-muted">
          Find verified people and send your first friend request.
        </p>
        <Button className="mt-5" onClick={onFindPeople}>
          Find people
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pb-1 sm:px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          {acceptedFriendships.length}{" "}
          {acceptedFriendships.length === 1 ? "friend" : "friends"}
        </p>
        <div className="space-y-3">
          {acceptedFriendships.map((friendship) => {
            const profile = getOtherProfile(friendship);

            if (!profile) {
              return null;
            }

            return (
              <PersonRow
                key={friendship.id}
                profile={profile}
                context="Friend"
                action={
                  <Button
                    variant="ghost"
                    leftIcon={<UserMinus size={17} aria-hidden="true" />}
                    onClick={() => setSelectedFriendship(friendship)}
                  >
                    Remove
                  </Button>
                }
              />
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedFriendship)}
        onClose={() => {
          if (!isRemoving) {
            setSelectedFriendship(null);
          }
        }}
        title="Remove friend?"
        description={
          selectedProfile
            ? `You and ${selectedProfile.display_name || selectedProfile.username} will no longer appear in each other’s friends lists.`
            : "This friendship will be removed."
        }
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setSelectedFriendship(null)}
              disabled={isRemoving}
            >
              Keep friend
            </Button>
            <Button
              variant="destructive"
              leftIcon={<UserMinus size={17} aria-hidden="true" />}
              isLoading={isRemoving}
              onClick={() => void handleRemove()}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-small leading-6 text-muted">
          You can send a new friend request later if you change your mind.
        </p>
      </Modal>
    </>
  );
}
