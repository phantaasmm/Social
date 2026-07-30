import { Link } from "react-router-dom";
import { ThemeToggle } from "../../theme/ThemeToggle";
import { Avatar } from "../ui";
import { Brand } from "./Brand";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur lg:hidden">
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <Link
          to="/"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="CommonGround home"
        >
          <Brand compact />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            to="/profile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open your profile"
          >
            <Avatar name="Your profile" size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}
