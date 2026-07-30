import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { useTheme } from "./use-theme";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-3 rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        showLabel ? "w-full px-3" : "min-w-11 px-2.5",
        className,
      )}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <Sun aria-hidden="true" size={20} />
      ) : (
        <Moon aria-hidden="true" size={20} />
      )}
      {showLabel && (
        <span className="flex-1 text-left text-small font-medium">
          {isDark ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
