import { useContext } from "react";
import { CommunitiesContext } from "./communities-context";

export function useCommunities() {
  const context = useContext(CommunitiesContext);

  if (!context) {
    throw new Error(
      "useCommunities must be used within CommunitiesProvider.",
    );
  }

  return context;
}
