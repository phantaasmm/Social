import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Friendship, Profile } from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/use-auth";
import {
  FriendshipsContext,
  type FriendshipsContextValue,
} from "./friendships-context";

interface FriendshipsProviderProps {
  children: ReactNode;
}

export function FriendshipsProvider({
  children,
}: FriendshipsProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [relationships, setRelationships] = useState<Friendship[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refreshFriendships = useCallback(async () => {
    if (!user) {
      setRelationships([]);
      setProfilesById({});
      setError(null);
      setIsLoading(false);
      hasLoadedRef.current = false;
      return;
    }

    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }
    setError(null);

    const { data, error: friendshipsError } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status, created_at")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (friendshipsError) {
      setRelationships([]);
      setProfilesById({});
      setError(`Friendships could not be loaded: ${friendshipsError.message}`);
      setIsLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    const nextRelationships = data ?? [];
    const otherProfileIds = Array.from(
      new Set(
        nextRelationships.map((friendship) =>
          friendship.requester_id === user.id
            ? friendship.addressee_id
            : friendship.requester_id,
        ),
      ),
    );

    let nextProfiles: Profile[] = [];

    if (otherProfileIds.length > 0) {
      const { data: profileData, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, bio, email_domain, is_private, created_at",
        )
        .in("id", otherProfileIds);

      if (profilesError) {
        setRelationships(nextRelationships);
        setProfilesById({});
        setError(`Friend profiles could not be loaded: ${profilesError.message}`);
        setIsLoading(false);
        hasLoadedRef.current = true;
        return;
      }

      nextProfiles = profileData ?? [];
    }

    setRelationships(nextRelationships);
    setProfilesById(
      Object.fromEntries(nextProfiles.map((profile) => [profile.id, profile])),
    );
    setIsLoading(false);
    hasLoadedRef.current = true;
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshFriendships();
  }, [isAuthLoading, refreshFriendships]);

  const incomingRequests = useMemo(
    () =>
      relationships.filter(
        (friendship) =>
          friendship.status === "pending" &&
          friendship.addressee_id === user?.id,
      ),
    [relationships, user],
  );

  const outgoingRequests = useMemo(
    () =>
      relationships.filter(
        (friendship) =>
          friendship.status === "pending" &&
          friendship.requester_id === user?.id,
      ),
    [relationships, user],
  );

  const acceptedFriendships = useMemo(
    () =>
      relationships.filter(
        (friendship) => friendship.status === "accepted",
      ),
    [relationships],
  );

  const getFriendshipWith = useCallback(
    (profileId: string) =>
      relationships.find(
        (friendship) =>
          friendship.requester_id === profileId ||
          friendship.addressee_id === profileId,
      ),
    [relationships],
  );

  const getOtherProfile = useCallback(
    (friendship: Friendship) => {
      if (!user) {
        return undefined;
      }

      const otherId =
        friendship.requester_id === user.id
          ? friendship.addressee_id
          : friendship.requester_id;
      return profilesById[otherId];
    },
    [profilesById, user],
  );

  const sendFriendRequest = useCallback(
    async (profileId: string) => {
      if (!user) {
        throw new Error("Sign in before sending a friend request.");
      }

      if (profileId === user.id) {
        throw new Error("You cannot send a friend request to yourself.");
      }

      const existing = relationships.find(
        (friendship) =>
          friendship.requester_id === profileId ||
          friendship.addressee_id === profileId,
      );

      if (existing) {
        throw new Error("A friendship or request already exists.");
      }

      const { error: insertError } = await supabase
        .from("friendships")
        .insert({
          requester_id: user.id,
          addressee_id: profileId,
          status: "pending",
        });

      if (insertError) {
        throw new Error(`Request could not be sent: ${insertError.message}`);
      }

      await refreshFriendships();
    },
    [refreshFriendships, relationships, user],
  );

  const acceptFriendRequest = useCallback(
    async (friendshipId: string) => {
      if (!user) {
        throw new Error("Sign in before accepting a friend request.");
      }

      const request = relationships.find(
        (friendship) => friendship.id === friendshipId,
      );

      if (
        !request ||
        request.status !== "pending" ||
        request.addressee_id !== user.id
      ) {
        throw new Error("This incoming request is no longer available.");
      }

      const { error: updateError } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId)
        .eq("addressee_id", user.id)
        .eq("status", "pending");

      if (updateError) {
        throw new Error(`Request could not be accepted: ${updateError.message}`);
      }

      await refreshFriendships();
    },
    [refreshFriendships, relationships, user],
  );

  const deleteFriendship = useCallback(
    async (friendshipId: string) => {
      if (!user) {
        throw new Error("Sign in before changing a friendship.");
      }

      const relationship = relationships.find(
        (friendship) => friendship.id === friendshipId,
      );

      if (
        !relationship ||
        (relationship.requester_id !== user.id &&
          relationship.addressee_id !== user.id)
      ) {
        throw new Error("This friendship is no longer available.");
      }

      const { error: deleteError } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (deleteError) {
        throw new Error(`Friendship could not be removed: ${deleteError.message}`);
      }

      await refreshFriendships();
    },
    [refreshFriendships, relationships, user],
  );

  const value = useMemo<FriendshipsContextValue>(
    () => ({
      relationships,
      profilesById,
      incomingRequests,
      outgoingRequests,
      acceptedFriendships,
      isLoading,
      error,
      refreshFriendships,
      getFriendshipWith,
      getOtherProfile,
      sendFriendRequest,
      acceptFriendRequest,
      deleteFriendship,
    }),
    [
      acceptFriendRequest,
      acceptedFriendships,
      deleteFriendship,
      error,
      getFriendshipWith,
      getOtherProfile,
      incomingRequests,
      isLoading,
      outgoingRequests,
      profilesById,
      refreshFriendships,
      relationships,
      sendFriendRequest,
    ],
  );

  return (
    <FriendshipsContext.Provider value={value}>
      {children}
    </FriendshipsContext.Provider>
  );
}
