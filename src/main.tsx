import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ToastProvider } from "./components/ui";
import { AuthProvider } from "./features/auth/AuthProvider";
import { ChessProvider } from "./features/chess/ChessProvider";
import { CommunitiesProvider } from "./features/communities/CommunitiesProvider";
import { FeedProvider } from "./features/feed/FeedProvider";
import { FriendshipsProvider } from "./features/friends/FriendshipsProvider";
import { ProfileProvider } from "./features/profile/ProfileProvider";
import "./index.css";
import { ThemeProvider } from "./theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <ProfileProvider>
              <FriendshipsProvider>
                <ChessProvider>
                  <CommunitiesProvider>
                    <FeedProvider>
                      <App />
                    </FeedProvider>
                  </CommunitiesProvider>
                </ChessProvider>
              </FriendshipsProvider>
            </ProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
