import { useContext } from "react";
import { FriendshipsContext } from "./friendships-context";

export function useFriendships() {
  const context = useContext(FriendshipsContext);

  if (!context) {
    throw new Error(
      "useFriendships must be used within FriendshipsProvider.",
    );
  }

  return context;
}
