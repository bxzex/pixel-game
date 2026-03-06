import { AudioSystem } from "./audio.js";
import { LEVELS } from "./levels.js";
import { TILE, SPRITES, drawSprite, drawTile } from "./assets.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const hud = {
  level: document.querySelector("#hud-level"),
  lives: document.querySelector("#hud-lives"),
  coins: document.querySelector("#hud-coins"),
  status: document.querySelector("#hud-status"),
};

const audioButton = document.querySelector("#audio-button");
const audio = new AudioSystem();

const keys = new Set();
const gravity = 920;
const jumpVelocity = -360;
const playerSpeed = 145;
const enemyWidth = 16;
const enemyHeight = 16;

const state = {
  levelIndex: 0,
  levelCoins: 0,
  totalCoins: 0,
  lives: 3,
  status: "Explore",
  gameWon: false,
  level: null,
  player: {
    x: 0,
    y: 0,
    w: 12,
    h: 15,
    vx: 0,
    vy: 0,
    onGround: false,
    invulnTimer: 0,
  },
  cameraX: 0,
};

function cloneLevel(index) {
  const source = LEVELS[index];
  return {
    ...source,
    mapRows: source.map.map((row) => row.split("").map(Number)),
    coins: source.coins.map((c) => ({ ...c, taken: false })),
    enemies: source.enemies.map((e) => ({ ...e, dir: 1 })),
  };
}

function resetPlayerToStart() {
  const start = state.level.start;
  state.player.x = start.x * TILE + 2;
  state.player.y = start.y * TILE - 8;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.onGround = false;
  state.player.invulnTimer = 1.2;
}

function loadLevel(index, keepLives = true) {
  state.levelIndex = index;
  state.level = cloneLevel(index);
  state.levelCoins = 0;
  if (!keepLives) state.lives = 3;
  resetPlayerToStart();
  state.status = state.level.name;
  if (index === 0) state.totalCoins = 0;
}

function isSolidAt(tx, ty) {
  if (ty < 0 || tx < 0) return true;
  if (ty >= state.level.mapRows.length) return true;
  if (tx >= state.level.mapRows[0].length) return true;
  const tile = state.level.mapRows[ty][tx];
  return tile === 1 || tile === 2 || tile === 3;
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function collideX(entity, dt) {
  entity.x += entity.vx * dt;
  const left = Math.floor(entity.x / TILE);
  const right = Math.floor((entity.x + entity.w) / TILE);
  const top = Math.floor(entity.y / TILE);
  const bottom = Math.floor((entity.y + entity.h - 1) / TILE);

  for (let y = top; y <= bottom; y += 1) {
    if (entity.vx > 0 && isSolidAt(right, y)) {
      entity.x = right * TILE - entity.w - 0.01;
      entity.vx = 0;
    } else if (entity.vx < 0 && isSolidAt(left, y)) {
      entity.x = (left + 1) * TILE + 0.01;
      entity.vx = 0;
    }
  }
}

function collideY(entity, dt) {
  entity.onGround = false;
  entity.y += entity.vy * dt;
  const left = Math.floor(entity.x / TILE);
  const right = Math.floor((entity.x + entity.w - 1) / TILE);
  const top = Math.floor(entity.y / TILE);
  const bottom = Math.floor((entity.y + entity.h) / TILE);

  for (let x = left; x <= right; x += 1) {
    if (entity.vy > 0 && isSolidAt(x, bottom)) {
      entity.y = bottom * TILE - entity.h - 0.01;
      entity.vy = 0;
      entity.onGround = true;
    } else if (entity.vy < 0 && isSolidAt(x, top)) {
      entity.y = (top + 1) * TILE + 0.01;
      entity.vy = 0;
    }
  }
}

function updatePlayer(dt) {
  const moveLeft = keys.has("arrowleft") || keys.has("a");
  const moveRight = keys.has("arrowright") || keys.has("d");
  const jump = keys.has("arrowup") || keys.has("w") || keys.has(" ");

  if (moveLeft === moveRight) {
    state.player.vx *= 0.78;
    if (Math.abs(state.player.vx) < 5) state.player.vx = 0;
  } else {
    state.player.vx = moveRight ? playerSpeed : -playerSpeed;
  }

  if (jump && state.player.onGround) {
    state.player.vy = jumpVelocity;
    state.player.onGround = false;
    audio.jump();
  }

  state.player.vy += gravity * dt;
  collideX(state.player, dt);
  collideY(state.player, dt);

  if (state.player.invulnTimer > 0) {
    state.player.invulnTimer -= dt;
  }

  const fallLimit = state.level.mapRows.length * TILE + 32;
  if (state.player.y > fallLimit) {
    damagePlayer();
  }
}

function damagePlayer() {
  if (state.player.invulnTimer > 0) return;
  state.lives -= 1;
  audio.hit();
  if (state.lives <= 0) {
    state.status = "Defeated - restarting level";
    state.lives = 3;
    state.levelCoins = 0;
    state.level.coins.forEach((coin) => {
      coin.taken = false;
    });
  }
  resetPlayerToStart();
}

function updateEnemies(dt) {
  for (const enemy of state.level.enemies) {
    enemy.x += enemy.speed * enemy.dir * dt;
    if (enemy.x < enemy.minX * TILE) {
      enemy.x = enemy.minX * TILE;
      enemy.dir = 1;
    }
    if (enemy.x > enemy.maxX * TILE) {
      enemy.x = enemy.maxX * TILE;
      enemy.dir = -1;
    }

    const enemyBox = { x: enemy.x, y: enemy.y * TILE - 1, w: enemyWidth, h: enemyHeight };
    if (intersects(state.player, enemyBox)) {
      damagePlayer();
    }
  }
}

function updateCoinsAndPortal() {
  for (const coin of state.level.coins) {
    if (coin.taken) continue;
    const box = { x: coin.x * TILE + 3, y: coin.y * TILE + 3, w: 10, h: 10 };
    if (intersects(state.player, box)) {
      coin.taken = true;
      state.levelCoins += 1;
      state.totalCoins += 1;
      audio.coin();
    }
  }

  const portalBox = {
    x: state.level.portal.x * TILE,
    y: state.level.portal.y * TILE,
    w: 16,
    h: 16,
  };

  if (intersects(state.player, portalBox)) {
    if (state.levelCoins >= state.level.requiredCoins) {
      audio.portal();
      if (state.levelIndex === LEVELS.length - 1) {
        state.status = "You cleared Pixel Ruins";
        state.gameWon = true;
        audio.win();
      } else {
        loadLevel(state.levelIndex + 1, true);
      }
    } else {
      state.status = `Need ${state.level.requiredCoins - state.levelCoins} more coin(s)`;
    }
  }
}

function updateCamera() {
  const levelPixelWidth = state.level.mapRows[0].length * TILE;
  const target = state.player.x - canvas.width / 2 + state.player.w;
  state.cameraX += (target - state.cameraX) * 0.1;
  state.cameraX = Math.max(0, Math.min(levelPixelWidth - canvas.width, state.cameraX));
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#1a2850");
  grad.addColorStop(1, "#0f1528");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff12";
  for (let i = 0; i < 48; i += 1) {
    const x = (i * 157 + Math.floor(state.cameraX * 0.3)) % canvas.width;
    const y = (i * 89) % (canvas.height - 40);
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawWorld() {
  const rows = state.level.mapRows;
  const cols = rows[0].length;
  const startCol = Math.floor(state.cameraX / TILE);
  const endCol = Math.min(cols, startCol + Math.ceil(canvas.width / TILE) + 2);

  for (let y = 0; y < rows.length; y += 1) {
    for (let x = startCol; x < endCol; x += 1) {
      const tile = rows[y][x];
      if (tile === 0) continue;
      drawTile(ctx, tile, x * TILE - state.cameraX, y * TILE, TILE);
    }
  }

  for (const coin of state.level.coins) {
    if (coin.taken) continue;
    drawSprite(ctx, SPRITES.coin, coin.x * TILE - state.cameraX, coin.y * TILE, 2);
  }

  for (const enemy of state.level.enemies) {
    drawSprite(ctx, SPRITES.enemy, enemy.x - state.cameraX, enemy.y * TILE - 1, 2);
  }

  drawSprite(ctx, SPRITES.portal, state.level.portal.x * TILE - state.cameraX, state.level.portal.y * TILE, 2);

  if (!(state.player.invulnTimer > 0.1 && Math.floor(state.player.invulnTimer * 14) % 2 === 0)) {
    drawSprite(ctx, SPRITES.player, state.player.x - state.cameraX, state.player.y, 2);
  }
}

function render() {
  drawBackground();
  drawWorld();

  if (state.gameWon) {
    ctx.fillStyle = "#000a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f7f4d4";
    ctx.font = "24px Courier New";
    ctx.fillText("RUINS RESTORED", 220, 150);
    ctx.font = "14px Courier New";
    ctx.fillText("Refresh page to play again", 220, 180);
  }

  hud.level.textContent = String(state.levelIndex + 1);
  hud.lives.textContent = String(state.lives);
  hud.coins.textContent = String(state.totalCoins);
  hud.status.textContent = state.status;
}

function gameLoop(time) {
  if (!gameLoop.lastTime) gameLoop.lastTime = time;
  const dt = Math.min((time - gameLoop.lastTime) / 1000, 0.033);
  gameLoop.lastTime = time;

  if (!state.gameWon) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateCoinsAndPortal();
    updateCamera();
  }

  render();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.key === " ") {
    event.preventDefault();
  }
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

audioButton.addEventListener("click", async () => {
  await audio.enable();
  audioButton.textContent = "Audio On";
  audioButton.disabled = true;
});

loadLevel(0, false);
requestAnimationFrame(gameLoop);
