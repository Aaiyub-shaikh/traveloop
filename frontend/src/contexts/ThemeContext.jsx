import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const ThemeContext = createContext(null);

const STORAGE_KEY = "traveloop_theme";

function resolveSystemPreference() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Effective class: light | dark (system is resolved for DOM) */
export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem(STORAGE_KEY) || resolveSystemPreference();
  });

  useEffect(() => {
    if (!user?.theme) return;
    if (user.theme === "system") {
      setThemeState(resolveSystemPreference());
    } else if (user.theme === "light" || user.theme === "dark") {
      setThemeState(user.theme);
    }
  }, [user?.id, user?.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t) => setThemeState(t);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggle: () => setThemeState((x) => (x === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
