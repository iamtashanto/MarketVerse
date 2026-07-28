import { useEffect } from "react";
import { gameEventBus, type GameEvents } from "@/game/bridge/gameEventBus";

/**
 * React subscribes to discrete engine events here — this is what lets a HUD
 * component react to "a customer checked out" without the engine handing
 * React continuous state. See docs/FRONTEND_ARCHITECTURE.md §14.
 */
export function useGameEvent<K extends keyof GameEvents>(
  event: K,
  handler: (payload: GameEvents[K]) => void,
): void {
  useEffect(() => {
    gameEventBus.on(event, handler);
    return () => gameEventBus.off(event, handler);
  }, [event, handler]);
}
