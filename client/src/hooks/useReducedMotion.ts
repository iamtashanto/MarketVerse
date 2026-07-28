import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * CSS handles its own reduced-motion behavior automatically (tokens.css).
 * This hook exists for the one case CSS can't reach: telling the game
 * engine (game/bridge) to skip camera-shake/particle-heavy effects.
 * See docs/FRONTEND_ARCHITECTURE.md §16.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
