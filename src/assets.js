export const TILE = 16;
export const ATLAS_URL = "./assets/new-spritesheet.png";

// Sprite boxes are measured on new-spritesheet.png (1379 x 752) as left, right, top, bottom.
// The sheet is not a regular grid, so every sprite gets its own box.
function box(x0, x1, y0, y1) {
  const pad = 2;
  const x = Math.max(0, x0 - pad);
  const y = Math.max(0, y0 - pad);
  return { x, y, w: Math.min(1379, x1 + pad) - x, h: Math.min(752, y1 + pad) - y };
}

// Terrain block at the top right: 8 columns by 3 rows. Take the middle of a tile so no border shows.
function terrain(col, row, inset = 8) {
  const size = 80;
  return {
    x: 722 + Math.round(col * 82.85) + inset,
    y: 3 + row * size + inset,
    w: size - inset * 2,
    h: size - inset * 2,
  };
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

export const TILE_REGIONS = {
  [TILE_TYPES.GRASS]: terrain(0, 0),
  [TILE_TYPES.DIRT]: terrain(2, 1, 22),
  [TILE_TYPES.STONE]: terrain(2, 0),
  [TILE_TYPES.WATER]: terrain(6, 1, 24),
  [TILE_TYPES.WOOD]: terrain(3, 2),
  [TILE_TYPES.BRICK]: terrain(7, 1),
  [TILE_TYPES.BRIDGE]: terrain(3, 2),
  [TILE_TYPES.FLOWERS]: terrain(1, 0),
};

export const TILE_COLLISION = new Set([TILE_TYPES.WATER, TILE_TYPES.BRICK]);
const processedFrameCache = new Map();

const ASSETS = {
  heroFront: [box(16, 78, 8, 95)],
  heroSide: [box(374, 435, 8, 95), box(463, 524, 8, 95)],
  heroAttack: [box(548, 606, 8, 95)],
  heroBack: [box(102, 160, 8, 95)],

  elder: [box(379, 435, 105, 194)],
  wizard: [box(18, 71, 105, 194)],
  witch: [box(467, 523, 105, 194)],
  maiden: [box(553, 604, 105, 194)],
  villager: [box(21, 68, 210, 291)],

  slime: [box(14, 74, 308, 384), box(104, 157, 308, 384)],
  goblin: [box(381, 429, 210, 291), box(190, 238, 308, 384), box(274, 340, 308, 384)],
  skeleton: [box(550, 605, 210, 291), box(549, 617, 308, 384)],
  bat: [box(620, 705, 210, 291), box(619, 708, 308, 384)],
  cat: [box(559, 616, 405, 461)],

  chestClosed: [box(75, 133, 472, 537)],
  chestOpen: [box(2, 64, 472, 537)],
  coinGold: [box(148, 197, 472, 537)],
  coinSilver: [box(215, 265, 472, 537)],
  potionGold: [box(288, 328, 472, 537)],
  keyGold: [box(415, 470, 472, 537)],
  potionRed: [box(12, 55, 548, 605)],
  potionBlue: [box(82, 125, 548, 605)],
  potionGreen: [box(152, 195, 548, 605)],
  heart: [box(212, 267, 548, 605), box(281, 335, 548, 605)],
  heartEmpty: [box(348, 403, 548, 605)],
  sword: [box(2, 67, 613, 683)],
  shield: [box(78, 130, 613, 683)],
  keyDark: [box(416, 468, 548, 605)],
  lantern: [box(426, 463, 689, 751)],
  fire: [box(357, 389, 689, 751)],
  apple: [box(8, 60, 689, 751), box(79, 129, 689, 751)],
  mushroom: [box(215, 266, 689, 751), box(284, 333, 689, 751)],
  map: [box(210, 270, 613, 683)],
  compass: [box(282, 335, 613, 683)],
  gemPurple: [box(424, 463, 613, 683)],
  gemBlue: [box(348, 401, 613, 683)],
  door: [box(485, 541, 613, 683)],

  palmTree: [box(721, 801, 245, 395)],
  roundTree: [box(804, 886, 245, 395)],
  pineTree: [box(891, 962, 245, 336)],
  firTree: [box(973, 1047, 245, 336)],
  hillTree: [box(1055, 1137, 245, 395)],
  bush: [box(891, 962, 346, 393)],
  fence: [box(1224, 1297, 345, 392), box(1307, 1378, 344, 392)],
  rockSmall: [box(727, 797, 404, 466)],
  rockMedium: [box(810, 876, 404, 466)],
  rockLarge: [box(889, 961, 404, 466)],
  flowers: [box(979, 1043, 404, 466), box(1062, 1129, 404, 466)],

  houseA: [box(572, 697, 476, 631)],
  houseB: [box(715, 835, 476, 631)],
  towerA: [box(863, 961, 476, 631)],
  towerB: [box(979, 1057, 476, 631)],
  smithy: [box(1076, 1225, 476, 631)],
  workshop: [box(1234, 1378, 476, 631)],

  uiBarGreen: [box(572, 716, 645, 691)],
  uiBarRed: [box(726, 871, 645, 691)],
  uiIconHeart: [box(575, 625, 701, 749)],
  uiIconDrop: [box(642, 677, 701, 749)],
  uiIconCoin: [box(726, 771, 701, 749)],
  uiIconSwords: [box(786, 833, 701, 749)],
};

export const ASSET_GROUPS = {
  tiles: Object.keys(TILE_TYPES),
  characters: [
    "heroFront",
    "heroSide",
    "heroAttack",
    "heroBack",
    "elder",
    "wizard",
    "witch",
    "maiden",
    "villager",
    "slime",
    "goblin",
    "skeleton",
    "bat",
    "cat",
  ],
  items: [
    "chestClosed",
    "chestOpen",
    "coinGold",
    "coinSilver",
    "potionGold",
    "potionRed",
    "potionBlue",
    "potionGreen",
    "keyGold",
    "keyDark",
    "heart",
    "heartEmpty",
    "sword",
    "shield",
    "lantern",
    "fire",
    "apple",
    "mushroom",
    "map",
    "compass",
    "gemPurple",
    "gemBlue",
    "door",
  ],
  decor: [
    "palmTree",
    "roundTree",
    "pineTree",
    "firTree",
    "hillTree",
    "bush",
    "fence",
    "rockSmall",
    "rockMedium",
    "rockLarge",
    "flowers",
    "houseA",
    "houseB",
    "towerA",
    "towerB",
    "smithy",
    "workshop",
  ],
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

function colorDistance(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function backgroundSample(data, width, height) {
  const samples = [];
  for (let x = 0; x < width; x += 1) {
    const top = (x * 4);
    const bottom = ((height - 1) * width + x) * 4;
    samples.push([data[top], data[top + 1], data[top + 2]]);
    samples.push([data[bottom], data[bottom + 1], data[bottom + 2]]);
  }
  for (let y = 1; y < height - 1; y += 1) {
    const left = (y * width) * 4;
    const right = (y * width + (width - 1)) * 4;
    samples.push([data[left], data[left + 1], data[left + 2]]);
    samples.push([data[right], data[right + 1], data[right + 2]]);
  }

  const avg = samples.reduce((acc, value) => {
    acc[0] += value[0];
    acc[1] += value[1];
    acc[2] += value[2];
    return acc;
  }, [0, 0, 0]);

  return avg.map((value) => Math.round(value / samples.length));
}

function removeBackdrop(imageData, width, height) {
  const data = imageData.data;
  const bg = backgroundSample(data, width, height);
  const queue = [];
  const visited = new Uint8Array(width * height);
  const threshold = 72;

  function tryQueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (visited[index]) return;
    visited[index] = 1;
    const offset = index * 4;
    const color = [data[offset], data[offset + 1], data[offset + 2]];
    const brightness = color[0] + color[1] + color[2];
    if (brightness < 320 && colorDistance(color, bg) < threshold) {
      queue.push(index);
    }
  }

  for (let x = 0; x < width; x += 1) {
    tryQueue(x, 0);
    tryQueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryQueue(0, y);
    tryQueue(width - 1, y);
  }

  while (queue.length) {
    const index = queue.pop();
    const offset = index * 4;
    data[offset + 3] = 0;
    const x = index % width;
    const y = Math.floor(index / width);
    tryQueue(x + 1, y);
    tryQueue(x - 1, y);
    tryQueue(x, y + 1);
    tryQueue(x, y - 1);
  }
}

function keepMainComponents(imageData, width, height) {
  const data = imageData.data;
  const visited = new Uint8Array(width * height);
  const components = [];

  for (let index = 0; index < width * height; index += 1) {
    if (visited[index]) continue;
    visited[index] = 1;
    if (data[index * 4 + 3] === 0) continue;

    const stack = [index];
    const pixels = [];
    while (stack.length) {
      const current = stack.pop();
      pixels.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      const neighbors = [current - 1, current + 1, current - width, current + width];

      for (const next of neighbors) {
        if (next < 0 || next >= width * height) continue;
        const nx = next % width;
        const ny = Math.floor(next / width);
        if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
        if (visited[next]) continue;
        visited[next] = 1;
        if (data[next * 4 + 3] === 0) continue;
        stack.push(next);
      }
    }
    components.push(pixels);
  }

  if (!components.length) return;
  const largest = Math.max(...components.map((entry) => entry.length));
  for (const pixels of components) {
    if (pixels.length >= Math.max(40, largest * 0.08)) continue;
    for (const index of pixels) {
      data[index * 4 + 3] = 0;
    }
  }
}

function cropOpaqueBounds(imageData, width, height) {
  const data = imageData.data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, w: width, h: height };
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  };
}

function processedFrame(atlas, key, source) {
  const cacheKey = `${key}:${source.x}:${source.y}:${source.w}:${source.h}`;
  if (processedFrameCache.has(cacheKey)) {
    return processedFrameCache.get(cacheKey);
  }

  const canvas = document.createElement("canvas");
  canvas.width = source.w;
  canvas.height = source.h;
  const frameCtx = canvas.getContext("2d", { willReadFrequently: true });
  frameCtx.drawImage(atlas, source.x, source.y, source.w, source.h, 0, 0, source.w, source.h);

  const imageData = frameCtx.getImageData(0, 0, source.w, source.h);
  removeBackdrop(imageData, source.w, source.h);
  keepMainComponents(imageData, source.w, source.h);
  frameCtx.putImageData(imageData, 0, 0);

  const bounds = cropOpaqueBounds(imageData, source.w, source.h);
  const trimmed = document.createElement("canvas");
  trimmed.width = bounds.w;
  trimmed.height = bounds.h;
  const trimmedCtx = trimmed.getContext("2d");
  trimmedCtx.drawImage(canvas, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);

  processedFrameCache.set(cacheKey, trimmed);
  return trimmed;
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
  const frame = processedFrame(atlas, name, source);

  ctx.save();
  ctx.globalAlpha = alpha;

  if (flipX) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }

  ctx.drawImage(frame, x, y, width, height);
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
  const region = TILE_REGIONS[type];
  if (region && atlas && atlas.complete) {
    ctx.drawImage(atlas, region.x, region.y, region.w, region.h, x, y, size, size);
    return;
  }
  drawFallbackTile(ctx, type, x, y, size, time);
}
