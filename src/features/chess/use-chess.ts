import { useContext } from "react";
import { ChessContext } from "./chess-context";

export function useChess() {
  const context = useContext(ChessContext);

  if (!context) {
    throw new Error("useChess must be used within a ChessProvider.");
  }

  return context;
}
