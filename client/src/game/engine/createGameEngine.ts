import { Application, Container, FederatedPointerEvent, Graphics, Text } from "pixi.js";
import { gameCommandBus, gameEventBus } from "@/game/bridge/gameEventBus";

const TILE = 56;
const PLAYER_SPEED = 170; // px/sec, ≈ 3.2 tiles/sec at 56px/tile — docs/GAMEPLAY_MECHANICS.md §1
const INTERACTION_RADIUS = TILE * 1.6;
const SHELF_SIZE = TILE * 0.9;

export interface ShelfConfig {
  productId: string;
  name: string;
  gridX: number;
  gridY: number;
}

export interface ShelfStock {
  productId: string;
  shelfQuantity: number;
  price: number;
}

interface ShelfSprite {
  productId: string;
  container: Container;
  box: Graphics;
  label: Text;
  stockLabel: Text;
  x: number;
  y: number;
}

export interface GameEngineHandle {
  app: Application;
  /** Imperative data sync — React hands the engine a fresh snapshot after
   * every query refetch; the engine never fetches or diffs state itself.
   * See docs/FRONTEND_ARCHITECTURE.md §14. */
  updateShelfStock: (stock: ShelfStock[]) => void;
  destroy: () => void;
}

const STOCK_COLORS = { out: 0x3a1f1f, low: 0x4a3a1a, ok: 0x1f3a28 } as const;
const STOCK_BORDER = { out: 0xef5b5b, low: 0xe8681c, ok: 0x3ec97a } as const;

function stockTier(qty: number): keyof typeof STOCK_COLORS {
  if (qty <= 0) return "out";
  if (qty <= 5) return "low";
  return "ok";
}

/**
 * Owns the Pixi Application and its render loop entirely — nothing here is
 * driven by React props/state on every frame. Player movement and shelf
 * proximity are computed in the ticker; only discrete, meaningful state
 * changes (entering/leaving interaction range, an interact key press) cross
 * the bridge back to React. See docs/FRONTEND_ARCHITECTURE.md §1, §14.
 */
export async function createGameEngine(
  container: HTMLDivElement,
  shelves: ShelfConfig[],
): Promise<GameEngineHandle> {
  const app = new Application();
  await app.init({ background: "#0f1115", resizeTo: container, antialias: true });
  container.appendChild(app.canvas);

  const floor = new Container();
  app.stage.addChild(floor);

  const originX = 120;
  const originY = 120;

  const shelfSprites: ShelfSprite[] = shelves.map((shelf) => {
    const x = originX + shelf.gridX * TILE * 2.2;
    const y = originY + shelf.gridY * TILE * 2.2;

    const shelfContainer = new Container();
    shelfContainer.position.set(x, y);

    const box = new Graphics()
      .rect(-SHELF_SIZE / 2, -SHELF_SIZE / 2, SHELF_SIZE, SHELF_SIZE)
      .fill(STOCK_COLORS.out)
      .stroke({ width: 2, color: STOCK_BORDER.out });

    const label = new Text({
      text: shelf.name,
      style: { fontFamily: "sans-serif", fontSize: 12, fill: 0xf5f6f8, align: "center", wordWrap: true, wordWrapWidth: SHELF_SIZE + 20 },
    });
    label.anchor.set(0.5);
    label.position.set(0, -SHELF_SIZE / 2 - 16);

    const stockLabel = new Text({
      text: "0 on shelf",
      style: { fontFamily: "monospace", fontSize: 11, fill: 0x9ca0ab, align: "center" },
    });
    stockLabel.anchor.set(0.5);
    stockLabel.position.set(0, SHELF_SIZE / 2 + 14);

    shelfContainer.addChild(box, label, stockLabel);
    floor.addChild(shelfContainer);

    return { productId: shelf.productId, container: shelfContainer, box, label, stockLabel, x, y };
  });

  // --- Player ---
  const player = new Graphics().circle(0, 0, TILE * 0.28).fill(0xffb020);
  player.position.set(originX - TILE * 1.5, originY);
  app.stage.addChild(player);

  const promptText = new Text({
    text: "Press E to interact",
    style: { fontFamily: "sans-serif", fontSize: 12, fill: 0xffb020, align: "center" },
  });
  promptText.anchor.set(0.5);
  promptText.visible = false;
  app.stage.addChild(promptText);

  // --- Input ---
  const pressed = new Set<string>();
  function onKeyDown(e: KeyboardEvent): void {
    pressed.add(e.key.toLowerCase());
  }
  function onKeyUp(e: KeyboardEvent): void {
    pressed.delete(e.key.toLowerCase());
  }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  let nearestShelf: ShelfSprite | null = null;

  function findNearestShelfInRange(): ShelfSprite | null {
    let nearest: ShelfSprite | null = null;
    let nearestDist = Infinity;
    for (const shelf of shelfSprites) {
      const dx = shelf.x - player.x;
      const dy = shelf.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= INTERACTION_RADIUS && dist < nearestDist) {
        nearest = shelf;
        nearestDist = dist;
      }
    }
    return nearest;
  }

  const onTick = (): void => {
    const dt = app.ticker.deltaMS / 1000;

    let dx = 0;
    let dy = 0;
    if (pressed.has("w") || pressed.has("arrowup")) dy -= 1;
    if (pressed.has("s") || pressed.has("arrowdown")) dy += 1;
    if (pressed.has("a") || pressed.has("arrowleft")) dx -= 1;
    if (pressed.has("d") || pressed.has("arrowright")) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      player.x += (dx / len) * PLAYER_SPEED * dt;
      player.y += (dy / len) * PLAYER_SPEED * dt;
    }

    const inRange = findNearestShelfInRange();
    if (inRange?.productId !== nearestShelf?.productId) {
      if (nearestShelf) gameEventBus.emit("shelf:cleared", undefined);
      if (inRange) gameEventBus.emit("shelf:nearby", { productId: inRange.productId });
      nearestShelf = inRange;
    }

    promptText.visible = !!nearestShelf;
    if (nearestShelf) {
      promptText.position.set(nearestShelf.x, nearestShelf.y + SHELF_SIZE / 2 + 32);
    }

    if (pressed.has("e") && nearestShelf) {
      pressed.delete("e"); // treat as a single press, not held-repeat
      gameEventBus.emit("shelf:selected", { productId: nearestShelf.productId });
    }
  };
  app.ticker.add(onTick);

  // Click-to-select is a legitimate alternate input alongside keyboard,
  // per docs/UI_UX_DESIGN.md §9.1 input parity.
  function onShelfClick(shelf: ShelfSprite) {
    return (event: FederatedPointerEvent) => {
      event.stopPropagation();
      gameEventBus.emit("shelf:selected", { productId: shelf.productId });
    };
  }
  for (const shelf of shelfSprites) {
    shelf.box.eventMode = "static";
    shelf.box.cursor = "pointer";
    shelf.box.on("pointertap", onShelfClick(shelf));
  }

  function updateShelfStock(stock: ShelfStock[]): void {
    for (const entry of stock) {
      const sprite = shelfSprites.find((s) => s.productId === entry.productId);
      if (!sprite) continue;
      const tier = stockTier(entry.shelfQuantity);
      sprite.box.clear().rect(-SHELF_SIZE / 2, -SHELF_SIZE / 2, SHELF_SIZE, SHELF_SIZE).fill(STOCK_COLORS[tier]).stroke({ width: 2, color: STOCK_BORDER[tier] });
      sprite.stockLabel.text = `${entry.shelfQuantity} on shelf · $${entry.price.toFixed(2)}`;
    }
  }

  gameCommandBus.on("camera:focus", () => {
    // Reserved for future camera-pan behavior — see docs/FRONTEND_ARCHITECTURE.md §14.
  });

  return {
    app,
    updateShelfStock,
    destroy: () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      app.ticker.remove(onTick);
      app.destroy(true, { children: true });
    },
  };
}
