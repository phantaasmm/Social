import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./components/auth/AuthLayout";
import { AppShell } from "./components/layout/AppShell";
import { LazyRouteBoundary } from "./components/layout/LazyRouteBoundary";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./features/auth/PublicOnlyRoute";

const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);
const CreatePage = lazy(() =>
  import("./pages/CreatePage").then((module) => ({
    default: module.CreatePage,
  })),
);
const SearchPage = lazy(() =>
  import("./pages/SearchPage").then((module) => ({
    default: module.SearchPage,
  })),
);
const ChessGamePage = lazy(() =>
  import("./pages/ChessGamePage").then((module) => ({
    default: module.ChessGamePage,
  })),
);
const CommunitiesPage = lazy(() =>
  import("./pages/CommunitiesPage").then((module) => ({
    default: module.CommunitiesPage,
  })),
);
const CommunityDetailPage = lazy(() =>
  import("./pages/CommunityDetailPage").then((module) => ({
    default: module.CommunityDetailPage,
  })),
);
const CreateCommunityPage = lazy(() =>
  import("./pages/CreateCommunityPage").then((module) => ({
    default: module.CreateCommunityPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const LoginPage = lazy(() =>
  import("./pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const SignupPage = lazy(() =>
  import("./pages/auth/SignupPage").then((module) => ({
    default: module.SignupPage,
  })),
);
const VerifyEmailPage = lazy(() =>
  import("./pages/auth/VerifyEmailPage").then((module) => ({
    default: module.VerifyEmailPage,
  })),
);
const AuthCallbackPage = lazy(() =>
  import("./pages/auth/AuthCallbackPage").then((module) => ({
    default: module.AuthCallbackPage,
  })),
);
const FeedRouteLayout = lazy(() =>
  import("./features/feed/FeedRouteLayout").then((module) => ({
    default: module.FeedRouteLayout,
  })),
);
const ChessRouteLayout = lazy(() =>
  import("./features/chess/ChessRouteLayout").then((module) => ({
    default: module.ChessRouteLayout,
  })),
);
const CommunitiesRouteLayout = lazy(() =>
  import("./features/communities/CommunitiesRouteLayout").then((module) => ({
    default: module.CommunitiesRouteLayout,
  })),
);

export function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route
            path="login"
            element={
              <LazyRouteBoundary>
                <LoginPage />
              </LazyRouteBoundary>
            }
          />
          <Route
            path="signup"
            element={
              <LazyRouteBoundary>
                <SignupPage />
              </LazyRouteBoundary>
            }
          />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route
          path="verify-email"
          element={
            <LazyRouteBoundary>
              <VerifyEmailPage />
            </LazyRouteBoundary>
          }
        />
      </Route>
      <Route
        path="auth/callback"
        element={
          <LazyRouteBoundary>
            <AuthCallbackPage />
          </LazyRouteBoundary>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            element={
              <LazyRouteBoundary>
                <FeedRouteLayout />
              </LazyRouteBoundary>
            }
          >
            <Route
              index
              element={
                <LazyRouteBoundary>
                  <HomePage />
                </LazyRouteBoundary>
              }
            />
            <Route
              path="create"
              element={
                <LazyRouteBoundary>
                  <CreatePage />
                </LazyRouteBoundary>
              }
            />
          </Route>
          <Route
            element={
              <LazyRouteBoundary>
                <ChessRouteLayout />
              </LazyRouteBoundary>
            }
          >
            <Route
              path="search"
              element={
                <LazyRouteBoundary>
                  <SearchPage />
                </LazyRouteBoundary>
              }
            />
            <Route
              path="chess/:gameId"
              element={
                <LazyRouteBoundary>
                  <ChessGamePage />
                </LazyRouteBoundary>
              }
            />
          </Route>
          <Route
            element={
              <LazyRouteBoundary>
                <CommunitiesRouteLayout />
              </LazyRouteBoundary>
            }
          >
            <Route
              path="communities"
              element={
                <LazyRouteBoundary>
                  <CommunitiesPage />
                </LazyRouteBoundary>
              }
            />
            <Route
              path="communities/new"
              element={
                <LazyRouteBoundary>
                  <CreateCommunityPage />
                </LazyRouteBoundary>
              }
            />
            <Route
              path="communities/:slug"
              element={
                <LazyRouteBoundary>
                  <CommunityDetailPage />
                </LazyRouteBoundary>
              }
            />
          </Route>
          <Route
            path="profile"
            element={
              <LazyRouteBoundary>
                <ProfilePage />
              </LazyRouteBoundary>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
