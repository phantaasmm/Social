import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar } from "../ui";
import { useToast } from "../ui";
import { useAuth } from "../../features/auth/use-auth";
import { useProfile } from "../../features/profile/use-profile";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { Brand } from "./Brand";
import { navigationItems } from "./navigation";
import { cn } from "../../lib/cn";

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const name =
    profile?.display_name || profile?.username || user?.email || "Your profile";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast({
        title: "Could not sign out",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="px-5 pb-6 pt-7">
        <Brand />
      </div>

      <nav className="flex-1 px-3" aria-label="Primary navigation">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    cn(
                      "group flex min-h-11 items-center gap-3 rounded-lg px-3 text-small font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted hover:bg-surface-2 hover:text-foreground",
                    )
                  }
                >
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-border p-3">
        <ThemeToggle showLabel />
        <div className="flex items-center gap-1 rounded-lg">
          <NavLink
            to="/profile"
            className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open your profile"
          >
            <Avatar src={profile?.avatar_url} name={name} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-small font-semibold text-foreground">
                {name}
              </span>
              <span className="block truncate text-xs text-muted">
                {user?.email}
              </span>
            </span>
          </NavLink>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => void handleSignOut()}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
