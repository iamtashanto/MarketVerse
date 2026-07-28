import { useEffect, useRef } from "react";
import { createGameEngine, type GameEngineHandle } from "@/game/engine/createGameEngine";

/**
 * The ONLY component that touches the Pixi Application. Mounted once by
 * GameLayout; React never re-renders this in response to gameplay state —
 * it hands control to the engine on mount and gets out of the way.
 * See docs/FRONTEND_ARCHITECTURE.md §1, §14.
 */
export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngineHandle | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    void createGameEngine(container).then((engine) => {
      if (cancelled) {
        engine.destroy();
        return;
      }
      engineRef.current = engine;
    });

    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Live view of your store floor — inventory and financial state are also available in the panels around this view."
      className="h-full w-full"
    />
  );
}
