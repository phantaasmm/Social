import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Profile } from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/use-auth";
import {
  ProfileContext,
  type ProfileContextValue,
} from "./profile-context";

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, bio, email_domain, is_private, created_at",
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      setProfile(null);
      setError(
        "Your profile could not be loaded. Confirm that the signup trigger created the profile row and that profile RLS allows you to read it.",
      );
      setIsLoading(false);
      return;
    }

    setProfile(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshProfile();
  }, [isAuthLoading, refreshProfile]);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, isLoading, error, refreshProfile }),
    [error, isLoading, profile, refreshProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
