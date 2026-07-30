import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./components/auth/AuthLayout";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./features/auth/PublicOnlyRoute";
import { CommunitiesPage } from "./pages/CommunitiesPage";
import { CommunityDetailPage } from "./pages/CommunityDetailPage";
import { CreateCommunityPage } from "./pages/CreateCommunityPage";
import { CreatePage } from "./pages/CreatePage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SearchPage } from "./pages/SearchPage";
import { AuthCallbackPage } from "./pages/auth/AuthCallbackPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";

export function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="verify-email" element={<VerifyEmailPage />} />
      </Route>
      <Route path="auth/callback" element={<AuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/new" element={<CreateCommunityPage />} />
          <Route
            path="communities/:slug"
            element={<CommunityDetailPage />}
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
