import { createContext } from "react";
import type { Game, Profile } from "../../lib/database.types";

export interface ChessContextValue {
  games: Game[];
  profilesById: Record<string, Profile>;
  incomingChallenges: Game[];
  outgoingChallenges: Game[];
  activeGames: Game[];
  finishedGames: Game[];
  isLoading: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
  challengeFriend: (profileId: string) => Promise<Game>;
  acceptChallenge: (gameId: string) => Promise<Game>;
  getGameWith: (profileId: string) => Game | undefined;
  getOpponentProfile: (game: Game) => Profile | undefined;
}

export const ChessContext = createContext<ChessContextValue | null>(null);
