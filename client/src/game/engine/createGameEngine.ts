import { Application, Graphics } from "pixi.js";
import { gameCommandBus } from "@/game/bridge/gameEventBus";

export interface GameEngineHandle {
  app: Application;
  destroy: () => void;
}

/**
 * Owns the Pixi Application and its render loop entirely — nothing here is
 * driven by React props/state. Commands arrive via gameCommandBus (§14);
 * everything else is the engine's own business.
 */
export async function createGameEngine(container: HTMLDivElement): Promise<GameEngineHandle> {
  const app = new Application();
  await app.init({
    background: "#0f1115",
    resizeTo: container,
    antialias: true,
  });
  container.appendChild(app.canvas);

  // Placeholder scene — real store-floor rendering lives in game/engine/scenes/.
  const placeholder = new Graphics().rect(0, 0, 64, 64).fill(0xffb020);
  placeholder.position.set(32, 32);
  app.stage.addChild(placeholder);

  const onFocusCamera = () => {
    // Real implementation pans/zooms the viewport to the requested cell.
  };
  const onPlayCelebration = () => {
    // Real implementation triggers a particle burst — skipped entirely when
    // useReducedMotion() is true (docs/FRONTEND_ARCHITECTURE.md §16).
  };
  gameCommandBus.on("camera:focus", onFocusCamera);
  gameCommandBus.on("fx:play-celebration", onPlayCelebration);

  return {
    app,
    destroy: () => {
      gameCommandBus.off("camera:focus", onFocusCamera);
      gameCommandBus.off("fx:play-celebration", onPlayCelebration);
      app.destroy(true, { children: true });
    },
  };
}
