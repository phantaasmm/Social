import { Outlet } from "react-router-dom";
import { CommunitiesProvider } from "./CommunitiesProvider";

export function CommunitiesRouteLayout() {
  return (
    <CommunitiesProvider>
      <Outlet />
    </CommunitiesProvider>
  );
}
