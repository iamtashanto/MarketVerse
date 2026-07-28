export type ThemeMode = "light" | "dark" | "system";
export type ThemeVariant = "default" | "colorblind-safe";

export interface ThemePreference {
  mode: ThemeMode;
  variant: ThemeVariant;
}

export const DEFAULT_THEME_PREFERENCE: ThemePreference = {
  mode: "system",
  variant: "default",
};

export function resolveThemeMode(mode: ThemeMode): "light" | "dark" {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
