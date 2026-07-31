import {
  Check,
  Clock3,
  Gamepad2,
  History,
  Play,
  Swords,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, useToast } from "../../components/ui";
import type { Game } from "../../lib/database.types";
import { useAuth } from "../auth/use-auth";
import { PersonRow } from "../friends/PersonRow";
import { getGameResultLabel, getPlayerColor } from "./chess-utils";
import { useChess } from "./use-chess";

interface GameSectionProps {
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function GameSection({
  title,
  description,
  count,
  icon,
  children,
}: GameSectionProps) {
  return (
    <section aria-labelledby={`chess-${title.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 text-primary" aria-hidden="true">
            {icon}
          </span>
          <div>
            <h2
              id={`chess-${title.toLowerCase().replaceAll(" ", "-")}`}
              className="text-h3 text-foreground"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-small text-muted">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function ChessPanel() {
  const { user } = useAuth();
  const {
    incomingChallenges,
    outgoingChallenges,
    activeGames,
    finishedGames,
    getOpponentProfile,
    acceptChallenge,
  } = useChess();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const openGame = (game: Game) => {
    navigate(`/chess/${game.id}`);
  };

  const handleAccept = async (game: Game) => {
    setBusyId(game.id);

    try {
      const acceptedGame = await acceptChallenge(game.id);
      toast({
        title: "Challenge accepted",
        description: "The board is ready. You play Black.",
        variant: "success",
      });
      openGame(acceptedGame);
    } catch (acceptError) {
      toast({
        title: "Could not accept challenge",
        description:
          acceptError instanceof Error
            ? acceptError.message
            : "Please try again.",
        variant: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const renderGame = (
    game: Game,
    context: string,
    actionLabel: string,
    actionIcon: React.ReactNode,
  ) => {
    const profile = getOpponentProfile(game);

    if (!profile) {
      return null;
    }

    return (
      <PersonRow
        key={game.id}
        profile={profile}
        context={context}
        action={
          <Button
            variant="secondary"
            leftIcon={actionIcon}
            onClick={() => openGame(game)}
          >
            {actionLabel}
          </Button>
        }
      />
    );
  };

  const hasGames =
    incomingChallenges.length > 0 ||
    outgoingChallenges.length > 0 ||
    activeGames.length > 0 ||
    finishedGames.length > 0;

  if (!hasGames) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Gamepad2 size={28} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-h3 text-foreground">No chess games yet</h2>
        <p className="mt-1 max-w-sm text-small leading-6 text-muted">
          Open the Friends tab and challenge someone to a realtime game.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-1 sm:px-5">
      {incomingChallenges.length > 0 && (
        <GameSection
          title="Incoming challenges"
          description="Friends waiting for your response"
          count={incomingChallenges.length}
          icon={<Swords size={19} />}
        >
          {incomingChallenges.map((game) => {
            const profile = getOpponentProfile(game);

            if (!profile) {
              return null;
            }

            return (
              <PersonRow
                key={game.id}
                profile={profile}
                context="Challenged you · You play Black"
                action={
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => openGame(game)}
                      disabled={busyId === game.id}
                    >
                      View
                    </Button>
                    <Button
                      leftIcon={<Check size={17} aria-hidden="true" />}
                      isLoading={busyId === game.id}
                      onClick={() => void handleAccept(game)}
                    >
                      Accept
                    </Button>
                  </>
                }
              />
            );
          })}
        </GameSection>
      )}

      {activeGames.length > 0 && (
        <GameSection
          title="Active games"
          description="Games currently in progress"
          count={activeGames.length}
          icon={<Play size={19} />}
        >
          {activeGames.map((game) => {
            const playerColor = user
              ? getPlayerColor(game, user.id)
              : "white";
            const isYourTurn =
              game.turn === (playerColor === "white" ? "w" : "b");

            return renderGame(
              game,
              `${isYourTurn ? "Your turn" : "Their turn"} · You play ${playerColor}`,
              "Open game",
              <Play size={17} aria-hidden="true" />,
            );
          })}
        </GameSection>
      )}

      {outgoingChallenges.length > 0 && (
        <GameSection
          title="Waiting"
          description="Challenges waiting to be accepted"
          count={outgoingChallenges.length}
          icon={<Clock3 size={19} />}
        >
          {outgoingChallenges.map((game) =>
            renderGame(
              game,
              "Challenge sent · You play White",
              "View",
              <Clock3 size={17} aria-hidden="true" />,
            ),
          )}
        </GameSection>
      )}

      {finishedGames.length > 0 && (
        <GameSection
          title="Recent results"
          description="Your completed chess games"
          count={finishedGames.length}
          icon={<History size={19} />}
        >
          {finishedGames.slice(0, 5).map((game) => {
            const result =
              game.winner_id === user?.id
                ? "You won"
                : game.winner_id
                  ? "You lost"
                  : (getGameResultLabel(game) ?? "Draw");

            return renderGame(
              game,
              result,
              "Review",
              <History size={17} aria-hidden="true" />,
            );
          })}
        </GameSection>
      )}
    </div>
  );
}
