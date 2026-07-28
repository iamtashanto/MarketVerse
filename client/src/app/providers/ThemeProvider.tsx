import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { storage } from "@/services/storage";
import {
  DEFAULT_THEME_PREFERENCE,
  resolveThemeMode,
  type ThemeMode,
  type ThemePreference,
  type ThemeVariant,
} from "@/theme/theme";

interface ThemeContextValue extends ThemePreference {
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme-preference";

/**
 * Low-frequency, broadly-read global state — the textbook case for Context
 * rather than Zustand. See docs/FRONTEND_ARCHITECTURE.md §7, §9.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    storage.get(STORAGE_KEY, DEFAULT_THEME_PREFERENCE),
  );

  useEffect(() => {
    const resolved = resolveThemeMode(preference.mode);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-variant", preference.variant);
    storage.set(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    if (preference.mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => document.documentElement.setAttribute("data-theme", resolveThemeMode("system"));
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [preference.mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...preference,
      setMode: (mode) => setPreference((p) => ({ ...p, mode })),
      setVariant: (variant) => setPreference((p) => ({ ...p, variant })),
    }),
    [preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
