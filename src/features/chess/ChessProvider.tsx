import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Game, Profile } from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/use-auth";
import { useFriendships } from "../friends/use-friendships";
import { ChessContext, type ChessContextValue } from "./chess-context";
import { getOpponentId, STARTING_FEN } from "./chess-utils";

interface ChessProviderProps {
  children: ReactNode;
}

const GAME_SELECT =
  "id, white_player_id, black_player_id, fen, pgn, turn, status, winner_id, created_at, updated_at";
const PROFILE_SELECT =
  "id, username, display_name, avatar_url, bio, email_domain, is_private, created_at";

export function ChessProvider({ children }: ChessProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { acceptedFriendships } = useFriendships();
  const [games, setGames] = useState<Game[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refreshGames = useCallback(async () => {
    if (!user) {
      setGames([]);
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

    const { data, error: gamesError } = await supabase
      .from("games")
      .select(GAME_SELECT)
      .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (gamesError) {
      setGames([]);
      setProfilesById({});
      setError(`Chess games could not be loaded: ${gamesError.message}`);
      setIsLoading(false);
      hasLoadedRef.current = true;
      return;
    }

    const nextGames = data ?? [];
    const opponentIds = Array.from(
      new Set(nextGames.map((game) => getOpponentId(game, user.id))),
    );
    let opponentProfiles: Profile[] = [];

    if (opponentIds.length > 0) {
      const { data: profileData, error: profilesError } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .in("id", opponentIds);

      if (profilesError) {
        setGames(nextGames);
        setProfilesById({});
        setError(`Chess opponents could not be loaded: ${profilesError.message}`);
        setIsLoading(false);
        hasLoadedRef.current = true;
        return;
      }

      opponentProfiles = profileData ?? [];
    }

    setGames(nextGames);
    setProfilesById(
      Object.fromEntries(
        opponentProfiles.map((profile) => [profile.id, profile]),
      ),
    );
    setIsLoading(false);
    hasLoadedRef.current = true;
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshGames();
  }, [isAuthLoading, refreshGames]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const refresh = () => {
      void refreshGames();
    };
    const whiteChannel = supabase
      .channel(`games-as-white-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `white_player_id=eq.${user.id}`,
        },
        refresh,
      )
      .subscribe();
    const blackChannel = supabase
      .channel(`games-as-black-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `black_player_id=eq.${user.id}`,
        },
        refresh,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(whiteChannel);
      void supabase.removeChannel(blackChannel);
    };
  }, [refreshGames, user]);

  const incomingChallenges = useMemo(
    () =>
      games.filter(
        (game) =>
          game.status === "pending" && game.black_player_id === user?.id,
      ),
    [games, user],
  );
  const outgoingChallenges = useMemo(
    () =>
      games.filter(
        (game) =>
          game.status === "pending" && game.white_player_id === user?.id,
      ),
    [games, user],
  );
  const activeGames = useMemo(
    () => games.filter((game) => game.status === "active"),
    [games],
  );
  const finishedGames = useMemo(
    () => games.filter((game) => game.status === "finished"),
    [games],
  );

  const getGameWith = useCallback(
    (profileId: string) =>
      games.find(
        (game) =>
          game.status !== "finished" &&
          (game.white_player_id === profileId ||
            game.black_player_id === profileId),
      ),
    [games],
  );

  const getOpponentProfile = useCallback(
    (game: Game) => {
      if (!user) {
        return undefined;
      }

      return profilesById[getOpponentId(game, user.id)];
    },
    [profilesById, user],
  );

  const challengeFriend = useCallback(
    async (profileId: string) => {
      if (!user) {
        throw new Error("Sign in before starting a chess challenge.");
      }
      if (profileId === user.id) {
        throw new Error("You cannot challenge yourself.");
      }

      const isFriend = acceptedFriendships.some(
        (friendship) =>
          friendship.requester_id === profileId ||
          friendship.addressee_id === profileId,
      );

      if (!isFriend) {
        throw new Error("Chess challenges can only be sent to friends.");
      }

      const existingGame = getGameWith(profileId);

      if (existingGame) {
        throw new Error("You already have a pending or active game together.");
      }

      const now = new Date().toISOString();
      const { data, error: insertError } = await supabase
        .from("games")
        .insert({
          white_player_id: user.id,
          black_player_id: profileId,
          fen: STARTING_FEN,
          pgn: "",
          turn: "w",
          status: "pending",
          winner_id: null,
          updated_at: now,
        })
        .select(GAME_SELECT)
        .single();

      if (insertError) {
        throw new Error(`Challenge could not be sent: ${insertError.message}`);
      }

      await refreshGames();
      return data;
    },
    [
      acceptedFriendships,
      getGameWith,
      refreshGames,
      user,
    ],
  );

  const acceptChallenge = useCallback(
    async (gameId: string) => {
      if (!user) {
        throw new Error("Sign in before accepting a chess challenge.");
      }

      const challenge = games.find((game) => game.id === gameId);

      if (
        !challenge ||
        challenge.status !== "pending" ||
        challenge.black_player_id !== user.id
      ) {
        throw new Error("This incoming challenge is no longer available.");
      }

      const { data, error: updateError } = await supabase
        .from("games")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId)
        .eq("black_player_id", user.id)
        .eq("status", "pending")
        .select(GAME_SELECT)
        .single();

      if (updateError) {
        throw new Error(
          `Challenge could not be accepted: ${updateError.message}`,
        );
      }

      await refreshGames();
      return data;
    },
    [games, refreshGames, user],
  );

  const value = useMemo<ChessContextValue>(
    () => ({
      games,
      profilesById,
      incomingChallenges,
      outgoingChallenges,
      activeGames,
      finishedGames,
      isLoading,
      error,
      refreshGames,
      challengeFriend,
      acceptChallenge,
      getGameWith,
      getOpponentProfile,
    }),
    [
      acceptChallenge,
      activeGames,
      challengeFriend,
      error,
      finishedGames,
      games,
      getGameWith,
      getOpponentProfile,
      incomingChallenges,
      isLoading,
      outgoingChallenges,
      profilesById,
      refreshGames,
    ],
  );

  return (
    <ChessContext.Provider value={value}>{children}</ChessContext.Provider>
  );
}
