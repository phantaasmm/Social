import { createContext } from "react";
import type { Profile } from "../../lib/database.types";

export interface ProfileContextValue {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);
