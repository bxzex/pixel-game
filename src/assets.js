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

export const ENEMY_ORDER = ["slime", "goblin", "skeleton", "bat"];

const ASSET_RECTS = {
  heroIdle: [cell(0, 0, 12), cell(1, 0, 12), cell(2, 0, 12), cell(3, 0, 12)],
  elder: [cell(0, 1, 14)],
  wizard: [cell(1, 1, 14)],
  witch: [cell(2, 1, 14)],
  maiden: [cell(3, 1, 14)],
  villager: [cell(4, 1, 14)],

  slime: [cell(0, 2, 14), cell(0, 3, 14)],
  goblin: [cell(1, 2, 14), cell(2, 2, 14), cell(1, 3, 14), cell(2, 3, 14)],
  skeleton: [cell(3, 2, 14), cell(3, 3, 14)],
  bat: [cell(4, 2, 10), cell(4, 3, 10)],
  cat: [cell(3, 4, 20)],

  chestClosed: [cell(16, 0, 16)],
  chestOpen: [cell(15, 0, 16)],
  keyGold: [cell(17, 2, 20)],
  keyDark: [cell(18, 2, 20)],
  coinGold: [cell(17, 0, 22)],
  coinSilver: [cell(18, 0, 22)],
  potionGold: [cell(19, 0, 22)],
  potionRed: [cell(15, 1, 22)],
  potionBlue: [cell(16, 1, 22)],
  potionGreen: [cell(17, 1, 22)],
  heart: [cell(18, 1, 22)],
  lantern: [cell(19, 2, 20), cell(15, 3, 20)],
  fire: [cell(20, 2, 18)],
  apple: [cell(16, 3, 18), cell(17, 3, 18), cell(18, 3, 18)],
  mushroom: [cell(19, 3, 18), cell(20, 3, 18)],
  map: [cell(15, 4, 18), cell(16, 4, 18)],
  compass: [cell(17, 4, 18)],
  gemPurple: [cell(18, 4, 18)],
  gemBlue: [cell(19, 4, 18)],
  exitDoor: [cell(20, 4, 12)],
  sword: [cell(15, 2, 20)],
  shield: [cell(16, 2, 18)],

  palmTree: [cell(8, 2, 8)],
  roundTree: [cell(9, 2, 8)],
  pineTree: [cell(10, 2, 8)],
  firTree: [cell(11, 2, 8)],
  hillTree: [cell(12, 2, 8)],
  bush: [cell(10, 3, 18)],
  fence: [cell(11, 3, 12), cell(12, 3, 12)],
  rockSmall: [cell(8, 4, 18)],
  rockMedium: [cell(9, 4, 18)],
  rockLarge: [cell(10, 4, 18)],
  flowers: [cell(11, 4, 16), cell(12, 4, 16)],

  houseA: [rect(42, 1150, 270, 318)],
  houseB: [rect(318, 1150, 270, 320)],
  towerA: [rect(738, 1128, 232, 332)],
  towerB: [rect(1014, 1128, 232, 332)],
  smithy: [rect(1422, 1164, 322, 284)],
  workshop: [rect(1778, 1150, 356, 300)],
};

const TILE_RECTS = {
  1: [cell(10, 0, 4), cell(10, 1, 4)],
  2: [cell(9, 0, 4), cell(8, 0, 4)],
  3: [cell(8, 1, 4)],
  4: [rect(2390, 1272, 250, 126), rect(2120, 1272, 250, 126)],
  5: [cell(12, 0, 4), cell(10, 1, 4)],
  6: [cell(11, 0, 4), cell(11, 1, 4)],
  7: [rect(1158, 566, 250, 110)],
};

function fallbackColor(name) {
  if (name.startsWith("hero") || name === "wizard" || name === "witch") return "#60a5fa";
  if (name === "slime" || name === "goblin") return "#84cc16";
  if (name === "skeleton") return "#d1d5db";
  if (name === "bat") return "#a78bfa";
  if (name.includes("coin") || name.includes("key")) return "#facc15";
  if (name.includes("gem")) return "#c084fc";
  if (name.includes("potion")) return "#38bdf8";
  return "#94a3b8";
}

function drawFallbackAsset(ctx, name, x, y, width, height) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fallbackColor(name);
  ctx.fillRect(x + 2, y + 2, Math.max(4, width - 4), Math.max(4, height - 4));
}

export function drawAsset(ctx, atlas, name, x, y, options = {}) {
  const rects = ASSET_RECTS[name];
  const width = options.width ?? 32;
  const height = options.height ?? 32;
  const alpha = options.alpha ?? 1;
  const flipX = Boolean(options.flipX);

  if (!rects || !rects.length) {
    drawFallbackAsset(ctx, name, x, y, width, height);
    return;
  }

  const frameIndex = options.frameIndex ?? 0;
  const source = rects[frameIndex % rects.length];

  if (!atlas || !atlas.complete) {
    drawFallbackAsset(ctx, name, x, y, width, height);
    return;
  }

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
  if (type === 2) {
    ctx.fillStyle = "#7ddc6f";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#8d633a";
    ctx.fillRect(x, y + size - 4, size, 4);
    return;
  }
  if (type === 6) {
    const bob = Math.sin(time * 0.01 + x * 0.1) * 1.5;
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#bae6fd";
    ctx.fillRect(x, y + 7 + bob, size, 3);
    return;
  }
  ctx.fillStyle = type === 4 ? "#d1d5db" : type === 5 ? "#b45309" : "#6b7280";
  ctx.fillRect(x, y, size, size);
}

export function drawTile(ctx, atlas, type, x, y, size = TILE, time = 0) {
  const rects = TILE_RECTS[type];
  if (!rects || !rects.length) return;

  if (!atlas || !atlas.complete) {
    drawFallbackTile(ctx, type, x, y, size, time);
    return;
  }

  const frameIndex = type === 6 ? Math.floor(time / 260) % rects.length : (x / size + y / size) % rects.length;
  const source = rects[Math.abs(frameIndex) % rects.length];
  ctx.drawImage(atlas, source.x, source.y, source.w, source.h, x, y, size, size);
}
