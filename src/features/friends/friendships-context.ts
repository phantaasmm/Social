import { createContext } from "react";
import type { Friendship, Profile } from "../../lib/database.types";

export interface FriendshipsContextValue {
  relationships: Friendship[];
  profilesById: Record<string, Profile>;
  incomingRequests: Friendship[];
  outgoingRequests: Friendship[];
  acceptedFriendships: Friendship[];
  isLoading: boolean;
  error: string | null;
  refreshFriendships: () => Promise<void>;
  getFriendshipWith: (profileId: string) => Friendship | undefined;
  getOtherProfile: (friendship: Friendship) => Profile | undefined;
  sendFriendRequest: (profileId: string) => Promise<void>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  deleteFriendship: (friendshipId: string) => Promise<void>;
}

export const FriendshipsContext =
  createContext<FriendshipsContextValue | null>(null);
