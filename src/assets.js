export const TILE = 16;
export const ATLAS_URL = "./assets/fantasy-atlas.png";

export const ENEMY_ORDER = ["slime", "goblin", "skeleton", "bat"];

// Coordinates for the uploaded 2816x1536 atlas.
const RECTS = {
  hero: { x: 608, y: 130, w: 96, h: 122 },
  slime: { x: 90, y: 520, w: 88, h: 90 },
  goblin: { x: 262, y: 500, w: 92, h: 126 },
  skeleton: { x: 612, y: 502, w: 90, h: 126 },
  bat: { x: 780, y: 516, w: 114, h: 100 },

  coin: { x: 2190, y: 134, w: 88, h: 90 },
  relic: { x: 2462, y: 808, w: 88, h: 96 },
  key: { x: 2625, y: 126, w: 88, h: 96 },
  chestClosed: { x: 2008, y: 130, w: 122, h: 102 },
  chestOpen: { x: 1847, y: 130, w: 122, h: 102 },
  portalLocked: { x: 2630, y: 806, w: 116, h: 126 },
  portalOpen: { x: 2462, y: 806, w: 88, h: 96 },
  heart: { x: 2466, y: 318, w: 84, h: 86 },

  tileStone: { x: 1306, y: 122, w: 156, h: 156 },
  tileGround: { x: 970, y: 122, w: 156, h: 156 },
  tileWood: { x: 969, y: 290, w: 156, h: 156 },
  tileSpikes: { x: 1298, y: 801, w: 156, h: 122 },
  tileBounce: { x: 1468, y: 804, w: 156, h: 122 },
  tileWater: { x: 1468, y: 122, w: 156, h: 156 },
  tileWaterAlt: { x: 1128, y: 291, w: 156, h: 156 },
};

function drawFallbackSprite(ctx, name, x, y, scale = 2) {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x, y, 8 * scale, 8 * scale);

  const color =
    name === "hero"
      ? "#60a5fa"
      : name === "slime"
        ? "#22c55e"
        : name === "goblin"
          ? "#84cc16"
          : name === "skeleton"
            ? "#e5e7eb"
            : name === "bat"
              ? "#a855f7"
              : name === "coin"
                ? "#facc15"
                : name === "relic"
                  ? "#c084fc"
                  : name === "heart"
                    ? "#ef4444"
                    : "#38bdf8";

  ctx.fillStyle = color;
  ctx.fillRect(x + scale, y + scale, 6 * scale, 6 * scale);
}

function drawFallbackTile(ctx, type, x, y, size = TILE, time = 0) {
  if (type === 1) {
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(x, y, size, size);
    return;
  }
  if (type === 2) {
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(x, y, size, 5);
    return;
  }
  if (type === 3) {
    ctx.fillStyle = "#a16207";
    ctx.fillRect(x, y, size, size);
    return;
  }
  if (type === 4) {
    ctx.fillStyle = "#d1d5db";
    ctx.fillRect(x, y + 8, size, 8);
    return;
  }
  if (type === 5) {
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(x, y, size, size);
    return;
  }
  if (type === 6) {
    const phase = Math.sin(time * 0.01 + x * 0.05);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(x, y + 6 + phase, size, 3);
  }
}

export function drawSprite(ctx, atlas, name, x, y, options = {}) {
  const scale = options.scale ?? 2;
  const flipX = Boolean(options.flipX);
  const alpha = options.alpha ?? 1;
  const rect = RECTS[name];

  if (!atlas || !atlas.complete || !rect) {
    drawFallbackSprite(ctx, name, x, y, scale);
    return;
  }

  const width = 8 * scale;
  const height = 8 * scale;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (flipX) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }

  ctx.drawImage(atlas, rect.x, rect.y, rect.w, rect.h, x, y, width, height);
  ctx.restore();
}

export function drawTile(ctx, atlas, type, x, y, size = TILE, time = 0) {
  if (!atlas || !atlas.complete) {
    drawFallbackTile(ctx, type, x, y, size, time);
    return;
  }

  let rect = null;
  if (type === 1) rect = RECTS.tileStone;
  else if (type === 2) rect = RECTS.tileGround;
  else if (type === 3) rect = RECTS.tileWood;
  else if (type === 4) rect = RECTS.tileSpikes;
  else if (type === 5) rect = RECTS.tileBounce;
  else if (type === 6) {
    const waterAlt = Math.floor(time / 260) % 2 === 0;
    rect = waterAlt ? RECTS.tileWater : RECTS.tileWaterAlt;
  }

  if (!rect) return;
  ctx.drawImage(atlas, rect.x, rect.y, rect.w, rect.h, x, y, size, size);
}
