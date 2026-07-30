import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ThemeContext,
  type Theme,
  type ThemeContextValue,
} from "./theme-context";

const STORAGE_KEY = "social-theme";
const mediaQuery = "(prefers-color-scheme: dark)";

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia(mediaQuery).matches ? "dark" : "light";
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((nextTheme: Theme, animate = true) => {
    const root = document.documentElement;

    if (animate) {
      root.classList.add("theme-changing");
      window.setTimeout(() => root.classList.remove("theme-changing"), 220);
    }

    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;

    const themeColor = nextTheme === "dark" ? "#0F172A" : "#F8FAFC";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeColor);
  }, []);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  useEffect(() => {
    applyTheme(theme, false);
  }, [applyTheme, theme]);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    const systemTheme = window.matchMedia(mediaQuery);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setThemeState(event.matches ? "dark" : "light");
    };

    systemTheme.addEventListener("change", handleSystemThemeChange);
    return () =>
      systemTheme.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
