import { Outlet } from "react-router";
import { GameCanvas } from "@/game/GameCanvas";

/**
 * HUD chrome around the canvas. Every value shown here is real, accessible
 * DOM content — never solely rendered inside the canvas itself, since the
 * canvas is opaque to assistive tech. See docs/FRONTEND_ARCHITECTURE.md §1, §16.
 */
export function GameLayout() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 text-sm">
        <span>MarketVerse</span>
        {/* Cash/level/notifications HUD widgets — features/economy, features/notifications */}
      </header>
      <div className="relative flex-1">
        <GameCanvas />
        <div className="pointer-events-none absolute inset-0">
          <Outlet />
        </div>
      </div>
      <footer className="border-t border-border bg-surface px-4 py-2 text-sm">
        {/* Mission tracker — features/missions */}
      </footer>
    </div>
  );
}
