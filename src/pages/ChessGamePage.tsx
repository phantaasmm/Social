import type { Square } from "chess.js";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock3,
  Crown,
  Radio,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  useToast,
} from "../components/ui";
import { useAuth } from "../features/auth/use-auth";
import {
  createChessFromGame,
  getGameResultLabel,
  getPlayerColor,
} from "../features/chess/chess-utils";
import { useChess } from "../features/chess/use-chess";
import type { Game, Profile } from "../lib/database.types";
import { supabase } from "../lib/supabase";

const GAME_SELECT =
  "id, white_player_id, black_player_id, fen, pgn, turn, status, winner_id, created_at, updated_at";
const PROFILE_SELECT =
  "id, username, display_name, avatar_url, bio, email_domain, is_private, created_at";

interface PlayerStripProps {
  profile?: Profile;
  color: "White" | "Black";
  isCurrentUser: boolean;
  isTurn: boolean;
  isWinner: boolean;
}

function PlayerStrip({
  profile,
  color,
  isCurrentUser,
  isTurn,
  isWinner,
}: PlayerStripProps) {
  const name = profile?.display_name || profile?.username || "Player";

  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 sm:p-4">
      <Avatar src={profile?.avatar_url} name={name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-small font-semibold text-foreground">
            {name}
            {isCurrentUser ? " (You)" : ""}
          </p>
          {isWinner && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              <Trophy size={12} aria-hidden="true" />
              Winner
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {color} · {profile ? `@${profile.username}` : "Loading profile"}
        </p>
      </div>
      {isTurn && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Turn
        </span>
      )}
    </div>
  );
}

function GameSkeleton() {
  return (
    <div className="space-y-3 px-4 sm:px-0" aria-label="Loading chess game">
      <div className="h-16 animate-pulse rounded-card bg-surface-2" />
      <div className="aspect-square animate-pulse rounded-card bg-surface-2" />
      <div className="h-16 animate-pulse rounded-card bg-surface-2" />
    </div>
  );
}

function getMoveHistory(game: Game) {
  try {
    return createChessFromGame(game).history();
  } catch {
    return [];
  }
}

export function ChessGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { acceptChallenge, refreshGames } = useChess();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [playersById, setPlayersById] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSavingMove, setIsSavingMove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  const loadGame = useCallback(
    async (showLoading = true) => {
      if (!gameId || !user) {
        setError("This chess game is not available.");
        setIsLoading(false);
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const { data, error: gameError } = await supabase
        .from("games")
        .select(GAME_SELECT)
        .eq("id", gameId)
        .single();

      if (gameError) {
        setGame(null);
        setError(`Chess game could not be loaded: ${gameError.message}`);
        setIsLoading(false);
        return;
      }

      if (
        data.white_player_id !== user.id &&
        data.black_player_id !== user.id
      ) {
        setGame(null);
        setError("Only the two players can view this chess game.");
        setIsLoading(false);
        return;
      }

      const { data: profileData, error: profilesError } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .in("id", [data.white_player_id, data.black_player_id]);

      if (profilesError) {
        setGame(data);
        setPlayersById({});
        setError(`Player profiles could not be loaded: ${profilesError.message}`);
        setIsLoading(false);
        return;
      }

      setGame(data);
      setPlayersById(
        Object.fromEntries(
          (profileData ?? []).map((profile) => [profile.id, profile]),
        ),
      );
      setIsLoading(false);
    },
    [gameId, user],
  );

  useEffect(() => {
    void loadGame();
  }, [loadGame]);

  useEffect(() => {
    if (!gameId || !user) {
      return;
    }

    const channel = supabase
      .channel(`chess-game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame(payload.new as Game);
          setMoveError(null);
          setRealtimeError(null);
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeError(
            "Live updates were interrupted. Refresh if the board looks stale.",
          );
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId, user]);

  const playerColor = game && user ? getPlayerColor(game, user.id) : "white";
  const userTurnCode = playerColor === "white" ? "w" : "b";
  const canMove =
    Boolean(game && user) &&
    game?.status === "active" &&
    game.turn === userTurnCode &&
    !isSavingMove;

  const boardOptions = useMemo(
    () => ({
      id: game ? `game-${game.id}` : "chess-game",
      position: game?.fen,
      boardOrientation: playerColor as "white" | "black",
      allowDragging: canMove,
      animationDurationInMs: 220,
      boardStyle: {
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgb(15 23 42 / 0.12)",
      },
      lightSquareStyle: {
        backgroundColor: "#E2E8F0",
      },
      darkSquareStyle: {
        backgroundColor: "#64748B",
      },
      canDragPiece: ({
        piece,
      }: {
        piece: { pieceType: string };
      }) =>
        canMove &&
        piece.pieceType.toLowerCase().startsWith(game?.turn ?? "w"),
      onPieceDrop: (args: PieceDropHandlerArgs) => handlePieceDrop(args),
    }),
    // handlePieceDrop deliberately uses the latest rendered game snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canMove, game, playerColor],
  );

  const handleAccept = async () => {
    if (!game) {
      return;
    }

    setIsAccepting(true);

    try {
      const accepted = await acceptChallenge(game.id);
      setGame(accepted);
      toast({
        title: "Challenge accepted",
        description: "White moves first.",
        variant: "success",
      });
    } catch (acceptError) {
      toast({
        title: "Could not accept challenge",
        description:
          acceptError instanceof Error
            ? acceptError.message
            : "Please try again.",
        variant: "error",
      });
      await loadGame(false);
    } finally {
      setIsAccepting(false);
    }
  };

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
    piece,
  }: PieceDropHandlerArgs) {
    if (!game || !user || !targetSquare || !canMove) {
      return false;
    }

    const chess = createChessFromGame(game);
    const sourcePiece = chess.get(sourceSquare as Square);

    if (
      !sourcePiece ||
      sourcePiece.color !== game.turn ||
      !piece.pieceType.toLowerCase().startsWith(game.turn)
    ) {
      setMoveError("You can only move your own pieces.");
      return false;
    }

    try {
      const move = chess.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });

      if (!move) {
        setMoveError("That move is not legal.");
        return false;
      }
    } catch {
      setMoveError("That move is not legal.");
      return false;
    }

    const isCheckmate = chess.isCheckmate();
    const isFinished = isCheckmate || chess.isStalemate() || chess.isDraw();
    const nextGame: Game = {
      ...game,
      fen: chess.fen(),
      pgn: chess.pgn(),
      turn: chess.turn(),
      status: isFinished ? "finished" : "active",
      winner_id: isCheckmate
        ? chess.turn() === "w"
          ? game.black_player_id
          : game.white_player_id
        : null,
      updated_at: new Date().toISOString(),
    };

    setMoveError(null);
    setGame(nextGame);
    setIsSavingMove(true);

    void (async () => {
      const { data, error: updateError } = await supabase
        .from("games")
        .update({
          fen: nextGame.fen,
          pgn: nextGame.pgn,
          turn: nextGame.turn,
          status: nextGame.status,
          winner_id: nextGame.winner_id,
          updated_at: nextGame.updated_at,
        })
        .eq("id", game.id)
        .eq("status", "active")
        .eq("fen", game.fen)
        .eq("turn", game.turn)
        .select(GAME_SELECT)
        .maybeSingle();

      if (updateError || !data) {
        setMoveError(
          updateError
            ? `Move could not be saved: ${updateError.message}`
            : "The position changed before your move was saved. The board has been refreshed.",
        );
        await loadGame(false);
      } else {
        setGame(data);
        await refreshGames();

        if (data.status === "finished") {
          toast({
            title: data.winner_id ? "Checkmate" : "Game drawn",
            description: getGameResultLabel(data) ?? undefined,
            variant: "success",
          });
        }
      }

      setIsSavingMove(false);
    })();

    return true;
  }

  const moveHistory = game ? getMoveHistory(game) : [];
  const whiteProfile = game
    ? playersById[game.white_player_id]
    : undefined;
  const blackProfile = game
    ? playersById[game.black_player_id]
    : undefined;
  const topPlayer =
    playerColor === "white" ? blackProfile : whiteProfile;
  const bottomPlayer =
    playerColor === "white" ? whiteProfile : blackProfile;
  const topColor = playerColor === "white" ? "Black" : "White";
  const bottomColor = playerColor === "white" ? "White" : "Black";
  const resultLabel = game ? getGameResultLabel(game) : null;
  const winner = game?.winner_id
    ? playersById[game.winner_id]
    : undefined;

  if (isLoading) {
    return (
      <section aria-labelledby="chess-game-title">
        <PageHeader
          id="chess-game-title"
          title="Chess"
          description="Loading the latest position…"
        />
        <GameSkeleton />
      </section>
    );
  }

  if (error || !game || !user) {
    return (
      <section aria-labelledby="chess-game-title">
        <PageHeader
          id="chess-game-title"
          title="Chess"
          description="Realtime games between friends."
        />
        <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
          <CardContent className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={28} className="text-danger" aria-hidden="true" />
            <h2 className="mt-4 text-h2 text-foreground">Game unavailable</h2>
            <p className="mt-2 max-w-md text-small leading-6 text-muted">
              {error ?? "This game could not be found."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft size={17} aria-hidden="true" />}
                onClick={() => navigate("/search")}
              >
                Back to people
              </Button>
              <Button
                variant="secondary"
                leftIcon={<RefreshCw size={17} aria-hidden="true" />}
                onClick={() => void loadGame()}
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const isWhiteTurn = game.turn === "w" && game.status === "active";
  const isBlackTurn = game.turn === "b" && game.status === "active";
  const isOpponentChallenge =
    game.status === "pending" && game.black_player_id === user.id;

  return (
    <section aria-labelledby="chess-game-title">
      <PageHeader
        id="chess-game-title"
        title="Chess"
        description={
          game.status === "pending"
            ? "A friendly challenge waiting to begin."
            : game.status === "finished"
              ? (resultLabel ?? "Game finished")
              : canMove
                ? "Your turn."
                : "Waiting for your opponent."
        }
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to chess games"
            title="Back to chess games"
            onClick={() => navigate("/search")}
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </Button>
        }
      />

      <div className="space-y-4 px-0 sm:px-0">
        {(realtimeError || moveError) && (
          <div
            className="mx-4 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-small text-danger sm:mx-0"
            role="alert"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <span>{moveError ?? realtimeError}</span>
          </div>
        )}

        {game.status === "pending" ? (
          <Card className="rounded-none border-x-0 sm:rounded-card sm:border-x">
            <CardContent className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {isOpponentChallenge ? (
                  <Crown size={32} aria-hidden="true" />
                ) : (
                  <Clock3 size={30} aria-hidden="true" />
                )}
              </span>
              <h2 className="mt-5 text-h2 text-foreground">
                {isOpponentChallenge
                  ? `${whiteProfile?.display_name || whiteProfile?.username || "Your friend"} challenged you`
                  : "Challenge sent"}
              </h2>
              <p className="mt-2 max-w-sm text-small leading-6 text-muted">
                {isOpponentChallenge
                  ? "Accept to begin. Your friend plays White and makes the first move; you play Black."
                  : `${blackProfile?.display_name || blackProfile?.username || "Your friend"} will see this challenge in their Chess tab.`}
              </p>
              {isOpponentChallenge && (
                <Button
                  className="mt-6"
                  leftIcon={<Check size={17} aria-hidden="true" />}
                  isLoading={isAccepting}
                  onClick={() => void handleAccept()}
                >
                  Accept challenge
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="px-4 sm:px-0">
              <PlayerStrip
                profile={topPlayer}
                color={topColor}
                isCurrentUser={topPlayer?.id === user.id}
                isTurn={
                  topColor === "White" ? isWhiteTurn : isBlackTurn
                }
                isWinner={topPlayer?.id === game.winner_id}
              />
            </div>

            <div className="relative mx-auto w-full max-w-[600px] overflow-hidden sm:rounded-card">
              <Chessboard options={boardOptions} />
              {isSavingMove && (
                <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-muted shadow-sm">
                  <Radio size={13} className="animate-pulse" aria-hidden="true" />
                  Saving move
                </div>
              )}
            </div>

            <div className="px-4 sm:px-0">
              <PlayerStrip
                profile={bottomPlayer}
                color={bottomColor}
                isCurrentUser={bottomPlayer?.id === user.id}
                isTurn={
                  bottomColor === "White" ? isWhiteTurn : isBlackTurn
                }
                isWinner={bottomPlayer?.id === game.winner_id}
              />
            </div>

            {game.status === "finished" && (
              <Card className="mx-4 border-success/30 bg-success/5 sm:mx-0">
                <CardContent className="flex items-center gap-4 pt-5 sm:pt-6">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                    <Trophy size={23} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-h3 text-foreground">
                      {winner
                        ? `${winner.display_name || winner.username} won`
                        : (resultLabel ?? "Game drawn")}
                    </h2>
                    <p className="mt-1 text-small text-muted">
                      {resultLabel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mx-4 shadow-none sm:mx-0">
              <CardContent className="pt-5 sm:pt-6">
                <h2 className="text-small font-semibold text-foreground">
                  Move history
                </h2>
                {moveHistory.length > 0 ? (
                  <ol className="mt-3 grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-2 text-small">
                    {Array.from(
                      { length: Math.ceil(moveHistory.length / 2) },
                      (_, index) => (
                        <li key={index} className="contents">
                          <span className="text-muted">{index + 1}.</span>
                          <span className="font-medium text-foreground">
                            {moveHistory[index * 2]}
                          </span>
                          <span className="font-medium text-foreground">
                            {moveHistory[index * 2 + 1] ?? ""}
                          </span>
                        </li>
                      ),
                    )}
                  </ol>
                ) : (
                  <p className="mt-2 text-small text-muted">
                    No moves yet. White moves first.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
