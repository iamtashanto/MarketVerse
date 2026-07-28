import { useCallback } from "react";
import { gameCommandBus, type GameCommands } from "@/game/bridge/gameEventBus";

/** React tells the engine to do something once — never a state sync. */
export function useGameCommand(): <K extends keyof GameCommands>(
  command: K,
  ...payload: GameCommands[K] extends undefined ? [] : [GameCommands[K]]
) => void {
  return useCallback((command, ...payload) => {
    gameCommandBus.emit(command, payload[0] as never);
  }, []);
}
