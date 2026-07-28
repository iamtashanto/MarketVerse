import { useEffect, useRef } from "react";
import { createGameEngine, type GameEngineHandle, type ShelfConfig, type ShelfStock } from "@/game/engine/createGameEngine";

export interface GameCanvasProps {
  shelves: ShelfConfig[];
  stock: ShelfStock[];
}

/**
 * The ONLY component that touches the Pixi Application. Mounted once;
 * React never re-renders this in response to gameplay state — it hands
 * control to the engine on mount and syncs fresh server data into it
 * imperatively via `updateShelfStock`, rather than re-creating the scene.
 * See docs/FRONTEND_ARCHITECTURE.md §1, §14.
 */
export function GameCanvas({ shelves, stock }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngineHandle | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    void createGameEngine(container, shelves).then((engine) => {
      if (cancelled) {
        engine.destroy();
        return;
      }
      engineRef.current = engine;
      engine.updateShelfStock(stock);
    });

    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
    // shelves is the store's fixed floor layout for this session — the
    // engine is intentionally not torn down and rebuilt when stock changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.updateShelfStock(stock);
  }, [stock]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Live view of your store floor — inventory and financial state are also available in the panels around this view."
      className="h-full w-full"
    />
  );
}
