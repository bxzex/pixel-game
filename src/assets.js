export const TILE = 16;

function spriteFromRows(rows) {
  return rows.map((row) => row.split(""));
}

export const PALETTE = {
  ".": null,
  "B": "#2d324a",
  "S": "#6fcb9f",
  "G": "#3c8f5f",
  "R": "#b95756",
  "Y": "#efd057",
  "W": "#f4e7c2",
  "N": "#18202f",
  "P": "#8972ce",
  "C": "#62b8ff",
  "O": "#de8f45",
};

export const SPRITES = {
  player: spriteFromRows([
    "....BB..",
    "...BWWB.",
    "..BWSSWB",
    "..BSSSSB",
    "..BYYYYB",
    "..BRRRRB",
    ".BOB..BO",
    ".B....B.",
  ]),
  enemy: spriteFromRows([
    "...NN...",
    "..NRRN..",
    "..RWWR..",
    ".NRRRRN.",
    ".RRSRRR.",
    ".R....R.",
    "R.O..O.R",
    "..N..N..",
  ]),
  coin: spriteFromRows([
    "..YYYY..",
    ".YYYYYY.",
    "YYOYYOYY",
    "YYYYYYYY",
    "YYOYYOYY",
    "YYOOOOYY",
    ".YYYYYY.",
    "..YYYY..",
  ]),
  portal: spriteFromRows([
    "..PPPP..",
    ".PCCCCP.",
    "PCPPPCCP",
    "PCP..PCP",
    "PCP..PCP",
    "PCPPPCCP",
    ".PCCCCP.",
    "..PPPP..",
  ]),
};

export function drawSprite(ctx, sprite, x, y, scale = 2) {
  for (let sy = 0; sy < sprite.length; sy += 1) {
    for (let sx = 0; sx < sprite[sy].length; sx += 1) {
      const pixel = sprite[sy][sx];
      const color = PALETTE[pixel];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + sx * scale, y + sy * scale, scale, scale);
    }
  }
}

export function drawTile(ctx, type, x, y, size = TILE) {
  if (type === 1) {
    ctx.fillStyle = "#2d324a";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#3e4462";
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    return;
  }
  if (type === 2) {
    ctx.fillStyle = "#3f7554";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#6fcb9f";
    ctx.fillRect(x, y, size, 5);
    return;
  }
  if (type === 3) {
    ctx.fillStyle = "#4f3b6f";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#7f66b6";
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
  }
}
