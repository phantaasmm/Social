import { Chess, DEFAULT_POSITION } from "chess.js";
import type { Game } from "../../lib/database.types";

export const STARTING_FEN = DEFAULT_POSITION;

export function createChessFromGame(game: Game) {
  if (game.pgn.trim()) {
    try {
      const chess = new Chess();
      chess.loadPgn(game.pgn);

      if (chess.fen() === game.fen) {
        return chess;
      }
    } catch {
      // Fall back to the canonical board state stored in the game row.
    }
  }

  return new Chess(game.fen);
}

export function getGameResultLabel(game: Game) {
  if (game.status !== "finished") {
    return null;
  }

  if (game.winner_id) {
    return "Checkmate";
  }

  try {
    const chess = createChessFromGame(game);

    if (chess.isStalemate()) {
      return "Draw by stalemate";
    }
    if (chess.isInsufficientMaterial()) {
      return "Draw by insufficient material";
    }
    if (chess.isThreefoldRepetition()) {
      return "Draw by threefold repetition";
    }
    if (chess.isDrawByFiftyMoves()) {
      return "Draw by fifty-move rule";
    }
  } catch {
    return "Draw";
  }

  return "Draw";
}

export function getPlayerColor(game: Game, userId: string) {
  return game.white_player_id === userId ? "white" : "black";
}

export function getOpponentId(game: Game, userId: string) {
  return game.white_player_id === userId
    ? game.black_player_id
    : game.white_player_id;
}
