import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import { navigationItems } from "./navigation";

export function MobileBottomNav() {
  return (
    <nav
      className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5 px-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    "relative flex h-full min-w-11 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    item.isCreate
                      ? "text-primary"
                      : isActive
                        ? "text-primary"
                        : "text-muted hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full transition-colors",
                        item.isCreate
                          ? "h-11 w-11 -translate-y-2 bg-primary text-primary-foreground shadow-lg"
                          : "h-6 w-8",
                        isActive && !item.isCreate && "bg-primary/10",
                      )}
                    >
                      <Icon
                        size={item.isCreate ? 23 : 21}
                        strokeWidth={item.isCreate ? 2.5 : 2}
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      className={cn(
                        item.isCreate && "absolute bottom-1.5",
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
