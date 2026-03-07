export const TILE = 16;
export const ATLAS_URL = "./assets/fantasy-atlas.png";
export const NEW_ATLAS_URL = "./assets/new-spritesheet.png";

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

export const TILE_REGIONS = {
  [TILE_TYPES.GRASS]: { x: 1024, y: 0, w: 128, h: 128 },
  [TILE_TYPES.DIRT]: { x: 1280, y: 0, w: 128, h: 128 },
  [TILE_TYPES.STONE]: { x: 1536, y: 0, w: 128, h: 128 },
  [TILE_TYPES.WATER]: { x: 1792, y: 0, w: 128, h: 128 },
  [TILE_TYPES.WOOD]: { x: 1152, y: 512, w: 128, h: 128 },
  [TILE_TYPES.BRICK]: { x: 1920, y: 0, w: 128, h: 128 },
  [TILE_TYPES.BRIDGE]: { x: 1152, y: 512, w: 128, h: 128 },
  [TILE_TYPES.FLOWERS]: { x: 1152, y: 0, w: 128, h: 128 },
};

export const TILE_COLLISION = new Set([TILE_TYPES.WATER, TILE_TYPES.BRICK]);
const processedFrameCache = new Map();

const ASSETS = {
  heroFront: [cell(0, 0, 12)],
  heroSide: [cell(2, 0, 12), cell(3, 0, 12)],
  heroAttack: [cell(6, 0, 12)],
  heroBack: [cell(1, 0, 12)],

  elder: [cell(4, 1, 14)],
  wizard: [cell(0, 1, 14)],
  witch: [cell(6, 1, 14)],
  maiden: [cell(2, 2, 14)],
  villager: [cell(0, 2, 14)],

  slime: [cell(0, 3, 14), cell(1, 3, 14)],
  goblin: [cell(4, 2, 14), cell(2, 3, 14), cell(3, 3, 14)],
  skeleton: [cell(6, 2, 14), cell(6, 3, 14)],
  bat: [cell(7, 2, 12), cell(7, 3, 12)],
  cat: [cell(5, 4, 18)],

  chestClosed: [cell(0, 5, 16)],
  chestOpen: [cell(1, 5, 16)],
  coinGold: [cell(2, 5, 22)],
  coinSilver: [cell(3, 5, 22)],
  potionGold: [cell(5, 5, 22)],
  keyGold: [cell(6, 5, 20)],
  potionRed: [cell(0, 6, 22)],
  potionBlue: [cell(1, 6, 22)],
  potionGreen: [cell(2, 6, 22)],
  heart: [cell(3, 6, 22), cell(4, 6, 22)],
  heartEmpty: [cell(5, 6, 22)],
  sword: [cell(0, 7, 18)],
  shield: [cell(1, 7, 18)],
  keyDark: [cell(2, 7, 20)],
  lantern: [cell(6, 7, 18), cell(7, 7, 18)],
  fire: [cell(3, 7, 18)],
  apple: [cell(0, 8, 18), cell(1, 8, 18)],
  mushroom: [cell(3, 8, 18), cell(4, 8, 18)],
  map: [cell(3, 7, 18), cell(4, 7, 18)],
  compass: [cell(5, 7, 18)],
  gemPurple: [cell(7, 7, 18)],
  gemBlue: [cell(6, 7, 18)],
  door: [cell(7, 7, 12)],

  palmTree: [cell(8, 2, 8)],
  roundTree: [cell(9, 2, 8)],
  pineTree: [cell(10, 2, 8)],
  firTree: [cell(11, 2, 8)],
  hillTree: [cell(12, 2, 8)],
  bush: [cell(10, 3, 18)],
  fence: [cell(14, 3, 10), cell(15, 3, 10)],
  rockSmall: [cell(8, 4, 18)],
  rockMedium: [cell(9, 4, 18)],
  rockLarge: [cell(10, 4, 18)],
  flowers: [cell(11, 4, 16), cell(12, 4, 16)],

  houseA: [cell(8, 5, 0), cell(9, 5, 0)],
  houseB: [cell(10, 5, 0), cell(11, 5, 0)],
  towerA: [cell(12, 5, 0), cell(12, 6, 0)],
  towerB: [cell(13, 5, 0), cell(13, 6, 0)],
  smithy: [cell(14, 5, 0), cell(15, 5, 0)],
  workshop: [cell(14, 6, 0), cell(15, 6, 0)],

  uiBarGreen: [rect(1024, 1024, 256, 128)],
  uiBarRed: [rect(1280, 1024, 256, 128)],
  uiIconHeart: [cell(8, 9, 10)],
  uiIconDrop: [cell(9, 9, 10)],
  uiIconCoin: [cell(10, 9, 10)],
  uiIconSwords: [cell(11, 9, 10)],
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
