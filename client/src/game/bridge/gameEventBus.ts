import mitt, { type Emitter } from "mitt";

/**
 * Discrete, infrequent events only — NEVER per-frame data (agent positions,
 * animation ticks). The engine's 60 FPS render loop lives entirely inside
 * Pixi's own ticker; this bus is the one deliberately narrow channel between
 * it and React. See docs/FRONTEND_ARCHITECTURE.md §14.
 */
// `type` (not `interface`) deliberately — object type literals pick up an
// implicit string index signature when checked against mitt's
// `Record<EventType, unknown>` constraint; interfaces don't.
export type GameEvents = {
  "customer:checked-out": { orderId: string; total: number };
  "shelf:emptied": { productId: string };
  "store:level-up": { newLevel: number };
  /** Player entered/left interaction range of a shelf — drives the "Press E" prompt and ShelfPanel availability. */
  "shelf:nearby": { productId: string };
  "shelf:cleared": undefined;
  /** Player pressed E or clicked a shelf while in range — opens ShelfPanel. */
  "shelf:selected": { productId: string };
};

/**
 * Commands flow the other direction — React telling the engine to DO
 * something once, never handing it a state object to "sync."
 */
export type GameCommands = {
  "camera:focus": { cellId: string };
  "fx:play-celebration": undefined;
};

export const gameEventBus: Emitter<GameEvents> = mitt<GameEvents>();
export const gameCommandBus: Emitter<GameCommands> = mitt<GameCommands>();
