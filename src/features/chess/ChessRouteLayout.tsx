import { Outlet } from "react-router-dom";
import { FriendshipsProvider } from "../friends/FriendshipsProvider";
import { ChessProvider } from "./ChessProvider";

export function ChessRouteLayout() {
  return (
    <FriendshipsProvider>
      <ChessProvider>
        <Outlet />
      </ChessProvider>
    </FriendshipsProvider>
  );
}
