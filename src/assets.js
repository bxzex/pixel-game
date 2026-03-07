export const TILE = 16;
export const ATLAS_URL = "./assets/fantasy-atlas.png";

const CELL = 128;

function cell(col, row, inset = 10) {
  return {
    x: col * CELL + inset,
    y: row * CELL + inset,
    w: CELL - inset * 2,
    h: CELL - inset * 2,
  };
}

function rect(x, y, w, h) {
  return { x, y, w, h };
}

export const TILE_TYPES = {
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WATER: 4,
  WOOD: 5,
  BRICK: 6,
  BRIDGE: 7,
  FLOWERS: 8,
};

export const TILE_COLLISION = new Set([TILE_TYPES.WATER, TILE_TYPES.BRICK]);

const ASSETS = {
  heroFront: [cell(3, 0, 12)],
  heroSide: [cell(0, 0, 12), cell(1, 0, 12)],
  heroAttack: [cell(2, 0, 12)],
  heroBack: [cell(4, 0, 12)],

  elder: [cell(0, 1, 14)],
  wizard: [cell(1, 1, 14)],
  witch: [cell(2, 1, 14)],
  maiden: [cell(3, 1, 14)],
  villager: [cell(4, 1, 14)],

  slime: [cell(0, 2, 14), cell(0, 3, 14)],
  goblin: [cell(1, 2, 14), cell(2, 2, 14), cell(1, 3, 14), cell(2, 3, 14)],
  skeleton: [cell(3, 2, 14), cell(3, 3, 14)],
  bat: [cell(4, 2, 12), cell(4, 3, 12)],
  cat: [cell(3, 4, 18)],

  chestClosed: [cell(15, 0, 16)],
  chestOpen: [cell(16, 0, 16)],
  coinGold: [cell(17, 0, 22)],
  coinSilver: [cell(18, 0, 22)],
  potionGold: [cell(19, 0, 22)],
  keyGold: [cell(20, 0, 20)],
  potionRed: [cell(15, 1, 22)],
  potionBlue: [cell(16, 1, 22)],
  potionGreen: [cell(17, 1, 22)],
  heart: [cell(18, 1, 22), cell(19, 1, 22)],
  heartEmpty: [cell(20, 1, 22)],
  sword: [cell(15, 2, 18)],
  shield: [cell(16, 2, 18)],
  keyDark: [cell(18, 2, 20)],
  lantern: [cell(19, 2, 18), cell(15, 3, 18)],
  fire: [cell(20, 2, 18)],
  apple: [cell(16, 3, 18), cell(17, 3, 18), cell(18, 3, 18)],
  mushroom: [cell(19, 3, 18), cell(20, 3, 18)],
  map: [cell(15, 4, 18), cell(16, 4, 18)],
  compass: [cell(17, 4, 18)],
  gemPurple: [cell(18, 4, 18)],
  gemBlue: [cell(19, 4, 18)],
  door: [cell(20, 4, 12)],

  palmTree: [cell(8, 2, 8)],
  roundTree: [cell(9, 2, 8)],
  pineTree: [cell(10, 2, 8)],
  firTree: [cell(11, 2, 8)],
  hillTree: [cell(12, 2, 8)],
  bush: [cell(10, 3, 18)],
  fence: [cell(11, 3, 10), cell(12, 3, 10)],
  rockSmall: [cell(8, 4, 18)],
  rockMedium: [cell(9, 4, 18)],
  rockLarge: [cell(10, 4, 18)],
  flowers: [cell(11, 4, 16), cell(12, 4, 16)],

  houseA: [rect(30, 1140, 280, 330)],
  houseB: [rect(306, 1140, 280, 330)],
  towerA: [rect(726, 1118, 250, 344)],
  towerB: [rect(1004, 1118, 250, 344)],
  smithy: [rect(1410, 1150, 336, 300)],
  workshop: [rect(1760, 1142, 378, 312)],
};

const TILE_RECTS = {
  [TILE_TYPES.GRASS]: [cell(9, 0, 4), cell(8, 0, 4)],
  [TILE_TYPES.DIRT]: [cell(8, 0, 4), cell(8, 1, 4)],
  [TILE_TYPES.STONE]: [cell(10, 0, 4), cell(9, 1, 4)],
  [TILE_TYPES.WATER]: [cell(11, 0, 4), cell(11, 1, 4)],
  [TILE_TYPES.WOOD]: [cell(8, 1, 4)],
  [TILE_TYPES.BRICK]: [cell(12, 0, 4), cell(10, 1, 4)],
  [TILE_TYPES.BRIDGE]: [rect(1024, 520, 256, 116)],
  [TILE_TYPES.FLOWERS]: [cell(12, 4, 16), cell(11, 4, 16)],
};

function fallbackColor(name) {
  if (name.startsWith("hero")) return "#93c5fd";
  if (name === "slime" || name === "goblin") return "#84cc16";
  if (name === "skeleton") return "#e5e7eb";
  if (name === "bat") return "#c084fc";
  if (name.includes("coin") || name.includes("key")) return "#facc15";
  if (name.includes("potion")) return "#38bdf8";
  if (name.includes("gem")) return "#a78bfa";
  return "#94a3b8";
}

function drawFallback(ctx, name, x, y, width, height) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fallbackColor(name);
  ctx.fillRect(x + 2, y + 2, Math.max(4, width - 4), Math.max(4, height - 4));
}

export function drawAsset(ctx, atlas, name, x, y, options = {}) {
  const frames = ASSETS[name];
  const width = options.width ?? 32;
  const height = options.height ?? 32;
  const alpha = options.alpha ?? 1;
  const flipX = Boolean(options.flipX);

  if (!frames || !frames.length || !atlas || !atlas.complete) {
    drawFallback(ctx, name, x, y, width, height);
    return;
  }

  const frameIndex = options.frameIndex ?? 0;
  const source = frames[Math.abs(frameIndex) % frames.length];

  ctx.save();
  ctx.globalAlpha = alpha;

  if (flipX) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }

  ctx.drawImage(atlas, source.x, source.y, source.w, source.h, x, y, width, height);
  ctx.restore();
}

function drawFallbackTile(ctx, type, x, y, size, time) {
  if (type === TILE_TYPES.GRASS) {
    ctx.fillStyle = "#6fce73";
    ctx.fillRect(x, y, size, size);
    return;
  }
  if (type === TILE_TYPES.DIRT) {
    ctx.fillStyle = "#9b6a43";
    ctx.fillRect(x, y, size, size);
    return;
  }
  if (type === TILE_TYPES.WATER) {
    const wave = Math.sin(time * 0.01 + x * 0.08) * 1.5;
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#bae6fd";
    ctx.fillRect(x, y + 7 + wave, size, 3);
    return;
  }
  ctx.fillStyle = type === TILE_TYPES.FLOWERS ? "#fb7185" : "#6b7280";
  ctx.fillRect(x, y, size, size);
}

export function drawTile(ctx, atlas, type, x, y, size = TILE, time = 0) {
  const frames = TILE_RECTS[type];
  if (!frames || !frames.length || !atlas || !atlas.complete) {
    drawFallbackTile(ctx, type, x, y, size, time);
    return;
  }

  const frameIndex = type === TILE_TYPES.WATER ? Math.floor(time / 260) : Math.floor((x + y) / size);
  const source = frames[Math.abs(frameIndex) % frames.length];
  ctx.drawImage(atlas, source.x, source.y, source.w, source.h, x, y, size, size);
}
