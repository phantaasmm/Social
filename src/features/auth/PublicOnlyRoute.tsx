import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./use-auth";
import { FullPageLoader } from "./FullPageLoader";

export function PublicOnlyRoute() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  return session ? <Navigate to="/" replace /> : <Outlet />;
}
