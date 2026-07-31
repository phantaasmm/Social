import { Outlet } from "react-router-dom";
import { FeedProvider } from "./FeedProvider";

export function FeedRouteLayout() {
  return (
    <FeedProvider>
      <Outlet />
    </FeedProvider>
  );
}
