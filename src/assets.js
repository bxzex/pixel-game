export const TILE = 16;

function spriteFromRows(rows) {
  return rows.map((row) => row.split(""));
}

export const ENEMY_ORDER = ["slime", "goblin", "skeleton", "bat"];

export const PALETTE = {
  ".": null,
  "A": "#0f172a",
  "B": "#1e293b",
  "C": "#334155",
  "D": "#64748b",
  "E": "#94a3b8",
  "F": "#f8fafc",
  "G": "#14532d",
  "H": "#166534",
  "I": "#22c55e",
  "J": "#bbf7d0",
  "K": "#7c2d12",
  "L": "#b45309",
  "M": "#f59e0b",
  "N": "#fcd34d",
  "O": "#7f1d1d",
  "P": "#dc2626",
  "Q": "#fca5a5",
  "R": "#1d4ed8",
  "S": "#60a5fa",
  "T": "#bfdbfe",
  "U": "#4c1d95",
  "V": "#8b5cf6",
  "W": "#c4b5fd",
  "X": "#78350f",
  "Y": "#ca8a04",
  "Z": "#fde047",
};

export const SPRITES = {
  hero: spriteFromRows([
    "..FF....",
    ".FQQF...",
    ".FRRF...",
    "FRRRRF..",
    "FRFFRF..",
    "KFHHRFK.",
    "KXK..KX.",
    ".X....X.",
  ]),
  slime: spriteFromRows([
    "........",
    "..IIII..",
    ".IJJJJI.",
    "IJIIIIJI",
    "IJIAAIJI",
    "IIJIIJII",
    ".IIIIII.",
    "........",
  ]),
  goblin: spriteFromRows([
    "..HH....",
    ".HJJH...",
    ".HIIH...",
    "HIHHIH..",
    "HIFFIH..",
    "KHIIHK..",
    "KXK..XK.",
    ".X....X.",
  ]),
  skeleton: spriteFromRows([
    "..FF....",
    ".FDD F..",
    ".FFFF...",
    "FDFFDF..",
    "FDFFDF..",
    "XFFFFX..",
    "X.X..X..",
    ".X....X.",
  ].map((row) => row.replace(/ /g, "."))),
  bat: spriteFromRows([
    "V......V",
    ".VV..VV.",
    "..VFFV..",
    ".VVVVVV.",
    "V.VVVV.V",
    "..V..V..",
    "........",
    "........",
  ]),
  coin: spriteFromRows([
    "..YYYY..",
    ".YZZZZY.",
    "YZYYYYZY",
    "YZYZZYZY",
    "YZYZZYZY",
    "YZYYYYZY",
    ".YZZZZY.",
    "..YYYY..",
  ]),
  relic: spriteFromRows([
    "...V....",
    "..VVV...",
    ".VVWVV..",
    "VVWWWVV.",
    ".VVWVV..",
    "..VVV...",
    "...V....",
    "........",
  ]),
  key: spriteFromRows([
    "..YYYY..",
    ".Y....Y.",
    ".Y....Y.",
    "..YYYY..",
    "....Y...",
    "..YYY...",
    "..Y.....",
    "........",
  ]),
  chestClosed: spriteFromRows([
    "XXXXXXXX",
    "XNNNNNNX",
    "XLLLLLLX",
    "XLYYYYLX",
    "XLYFFYLX",
    "XLLLLLLX",
    "XKKKKKKX",
    "........",
  ]),
  chestOpen: spriteFromRows([
    "XXXXXXXX",
    "XNNNNNNX",
    "X......X",
    "XLLLLLLX",
    "XLYYYYLX",
    "XLLLLLLX",
    "XKKKKKKX",
    "........",
  ]),
  portalLocked: spriteFromRows([
    "..UUUU..",
    ".UAAAAU.",
    "UAUAAUAU",
    "UAUAAUAU",
    "UAUAAUAU",
    "UAUAAUAU",
    ".UAAAAU.",
    "..UUUU..",
  ]),
  portalOpen: spriteFromRows([
    "..UUUU..",
    ".UVVVVU.",
    "UVWWWWVU",
    "UVWVVWVU",
    "UVWVVWVU",
    "UVWWWWVU",
    ".UVVVVU.",
    "..UUUU..",
  ]),
  heart: spriteFromRows([
    "PP..PP..",
    "PPPPPP..",
    "PPPPPP..",
    ".PPPP...",
    "..PP....",
    "........",
    "........",
    "........",
  ]),
};

export function drawSprite(ctx, sprite, x, y, options = {}) {
  const scale = options.scale ?? 2;
  const flipX = Boolean(options.flipX);
  const alpha = options.alpha ?? 1;
  const width = sprite[0].length * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (flipX) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }

  for (let sy = 0; sy < sprite.length; sy += 1) {
    for (let sx = 0; sx < sprite[sy].length; sx += 1) {
      const pixel = sprite[sy][sx];
      const color = PALETTE[pixel];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + sx * scale, y + sy * scale, scale, scale);
    }
  }

  ctx.restore();
}

export function drawTile(ctx, type, x, y, size = TILE, time = 0) {
  if (type === 1) {
    ctx.fillStyle = "#5f6876";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#7b8799";
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = "#4a5568";
    ctx.fillRect(x + 2, y + 3, size - 6, 3);
    ctx.fillRect(x + 4, y + 9, size - 8, 3);
    return;
  }

  if (type === 2) {
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#6f4522";
    ctx.fillRect(x + 2, y + 6, size - 4, size - 8);
    ctx.fillStyle = "#5cb85c";
    ctx.fillRect(x, y, size, 5);
    ctx.fillStyle = "#7ad67a";
    ctx.fillRect(x + 2, y + 1, size - 6, 2);
    return;
  }

  if (type === 3) {
    ctx.fillStyle = "#8c5a34";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#a36a3e";
    ctx.fillRect(x, y + 2, size, 3);
    ctx.fillRect(x, y + 8, size, 3);
    ctx.fillStyle = "#5f3c22";
    ctx.fillRect(x + 4, y, 2, size);
    ctx.fillRect(x + 10, y, 2, size);
    return;
  }

  if (type === 4) {
    ctx.fillStyle = "#5f6876";
    ctx.fillRect(x, y + 8, size, 8);
    ctx.fillStyle = "#d0d7e2";
    for (let i = 0; i < 4; i += 1) {
      const px = x + i * 4;
      ctx.beginPath();
      ctx.moveTo(px, y + 16);
      ctx.lineTo(px + 2, y + 6);
      ctx.lineTo(px + 4, y + 16);
      ctx.fill();
    }
    return;
  }

  if (type === 5) {
    ctx.fillStyle = "#374151";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(x + 2, y + 3, size - 4, 5);
    ctx.fillStyle = "#0891b2";
    ctx.fillRect(x + 3, y + 9, size - 6, 4);
    return;
  }

  if (type === 6) {
    const phase = Math.sin(time * 0.01 + x * 0.05);
    ctx.fillStyle = "#1d4ed8";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(x, y + 5 + phase, size, 4);
    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(x, y + 10 + phase, size, 3);
  }
}
