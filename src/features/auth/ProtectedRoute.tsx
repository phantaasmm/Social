import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./use-auth";
import { FullPageLoader } from "./FullPageLoader";

export function ProtectedRoute() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ returnTo }} />;
  }

  return <Outlet />;
}
