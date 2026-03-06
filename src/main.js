import { AudioSystem } from "./audio.js";
import { LEVELS } from "./levels.js";
import { ATLAS_URL, ENEMY_ORDER, TILE, drawSprite, drawTile } from "./assets.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const hud = {
  level: document.querySelector("#hud-level"),
  lives: document.querySelector("#hud-lives"),
  relics: document.querySelector("#hud-relics"),
  coins: document.querySelector("#hud-coins"),
  time: document.querySelector("#hud-time"),
  status: document.querySelector("#hud-status"),
  objective: document.querySelector("#hud-objective"),
};

const audioButton = document.querySelector("#audio-button");
const audio = new AudioSystem();
const atlas = new Image();
atlas.src = ATLAS_URL;

const keys = new Set();
const gravity = 930;
const jumpVelocity = -370;
const bounceVelocity = -500;
const playerSpeed = 152;
const enemyWidth = 16;
const enemyHeight = 16;

const state = {
  levelIndex: 0,
  levelCoins: 0,
  levelRelics: 0,
  totalCoins: 0,
  totalRelics: 0,
  score: 0,
  lives: 3,
  status: "Explore",
  gameWon: false,
  level: null,
  hasLevelKey: false,
  timeLeft: 0,
  playerFacing: 1,
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
  const chest = source.chest ?? { x: Math.max(2, source.portal.x - 3), y: source.portal.y };

  return {
    ...source,
    chest,
    mapRows: source.map.map((row) => row.split("").map(Number)),
    coins: source.coins.map((coin) => ({ ...coin, taken: false })),
    relics: source.relics.map((relic) => ({ ...relic, taken: false })),
    enemies: source.enemies.map((enemy, indexInLevel) => ({
      ...enemy,
      kind: enemy.kind ?? ENEMY_ORDER[indexInLevel % ENEMY_ORDER.length],
      dir: 1,
      spawnX: enemy.x,
    })),
  };
}

function tileAt(tx, ty) {
  if (ty < 0 || tx < 0) return 1;
  if (ty >= state.level.mapRows.length) return 1;
  if (tx >= state.level.mapRows[0].length) return 1;
  return state.level.mapRows[ty][tx];
}

function isSolidTile(tile) {
  return tile === 1 || tile === 2 || tile === 3 || tile === 5;
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resetPlayerToStart() {
  const start = state.level.start;
  state.player.x = start.x * TILE + 2;
  state.player.y = start.y * TILE - 8;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.onGround = false;
  state.player.invulnTimer = 1;
  state.playerFacing = 1;
}

function resetLevelProgress() {
  state.levelCoins = 0;
  state.levelRelics = 0;
  state.hasLevelKey = false;
  state.timeLeft = state.level.timeLimit;

  for (const coin of state.level.coins) {
    coin.taken = false;
  }
  for (const relic of state.level.relics) {
    relic.taken = false;
  }
  for (const enemy of state.level.enemies) {
    enemy.x = enemy.spawnX;
    enemy.dir = 1;
  }
}

function loadLevel(index, keepLives = true) {
  state.levelIndex = index;
  state.level = cloneLevel(index);

  if (!keepLives) {
    state.lives = 3;
    state.totalCoins = 0;
    state.totalRelics = 0;
    state.score = 0;
  }

  resetLevelProgress();
  resetPlayerToStart();
  state.status = state.level.name;
  audio.setMood("calm");
}

function collideX(entity, dt) {
  entity.x += entity.vx * dt;

  const left = Math.floor(entity.x / TILE);
  const right = Math.floor((entity.x + entity.w) / TILE);
  const top = Math.floor(entity.y / TILE);
  const bottom = Math.floor((entity.y + entity.h - 1) / TILE);

  for (let y = top; y <= bottom; y += 1) {
    if (entity.vx > 0 && isSolidTile(tileAt(right, y))) {
      entity.x = right * TILE - entity.w - 0.01;
      entity.vx = 0;
    } else if (entity.vx < 0 && isSolidTile(tileAt(left, y))) {
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
    if (entity.vy > 0 && isSolidTile(tileAt(x, bottom))) {
      entity.y = bottom * TILE - entity.h - 0.01;
      entity.vy = 0;
      entity.onGround = true;
    } else if (entity.vy < 0 && isSolidTile(tileAt(x, top))) {
      entity.y = (top + 1) * TILE + 0.01;
      entity.vy = 0;
    }
  }
}

function damagePlayer(reason, fullReset = false) {
  if (state.player.invulnTimer > 0) return;

  state.lives -= 1;
  audio.hit();
  state.status = reason;

  if (state.lives <= 0) {
    state.lives = 3;
    fullReset = true;
    state.status = "All hearts lost. Stage reset.";
  }

  if (fullReset) {
    resetLevelProgress();
  }

  resetPlayerToStart();
}

function checkHazards() {
  const left = Math.floor(state.player.x / TILE);
  const right = Math.floor((state.player.x + state.player.w - 1) / TILE);
  const top = Math.floor(state.player.y / TILE);
  const bottom = Math.floor((state.player.y + state.player.h) / TILE);

  for (let x = left; x <= right; x += 1) {
    for (let y = top; y <= bottom; y += 1) {
      const tile = tileAt(x, y);
      if (tile === 4) {
        damagePlayer("Spikes!", false);
        return;
      }
      if (tile === 6) {
        damagePlayer("Water trap!", false);
        return;
      }
      if (tile === 5 && state.player.vy >= 0 && y >= bottom - 1) {
        state.player.vy = bounceVelocity;
        state.player.onGround = false;
        audio.bounce();
        return;
      }
    }
  }
}

function updatePlayer(dt) {
  const moveLeft = keys.has("arrowleft") || keys.has("a");
  const moveRight = keys.has("arrowright") || keys.has("d");
  const jump = keys.has("arrowup") || keys.has("w") || keys.has(" ");

  if (moveLeft === moveRight) {
    state.player.vx *= 0.78;
    if (Math.abs(state.player.vx) < 5) {
      state.player.vx = 0;
    }
  } else {
    state.player.vx = moveRight ? playerSpeed : -playerSpeed;
    state.playerFacing = moveRight ? 1 : -1;
  }

  if (jump && state.player.onGround) {
    state.player.vy = jumpVelocity;
    state.player.onGround = false;
    audio.jump();
  }

  state.player.vy += gravity * dt;
  collideX(state.player, dt);
  collideY(state.player, dt);
  checkHazards();

  if (state.player.invulnTimer > 0) {
    state.player.invulnTimer -= dt;
  }

  const fallLimit = state.level.mapRows.length * TILE + 24;
  if (state.player.y > fallLimit) {
    damagePlayer("Fell into darkness", false);
  }
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

    const box = { x: enemy.x, y: enemy.y * TILE - 1, w: enemyWidth, h: enemyHeight };
    if (intersects(state.player, box)) {
      damagePlayer("Enemy strike", false);
    }
  }
}

function updateObjectives() {
  for (const coin of state.level.coins) {
    if (coin.taken) continue;

    const box = { x: coin.x * TILE + 3, y: coin.y * TILE + 3, w: 10, h: 10 };
    if (intersects(state.player, box)) {
      coin.taken = true;
      state.levelCoins += 1;
      state.totalCoins += 1;
      state.score += 10;
      audio.coin();
    }
  }

  for (const relic of state.level.relics) {
    if (relic.taken) continue;

    const box = { x: relic.x * TILE + 2, y: relic.y * TILE + 2, w: 12, h: 12 };
    if (intersects(state.player, box)) {
      relic.taken = true;
      state.levelRelics += 1;
      state.totalRelics += 1;
      state.score += 50;
      audio.relic();
      state.status = `Relic shard ${state.levelRelics}/${state.level.requiredRelics}`;
    }
  }

  if (state.levelRelics >= state.level.requiredRelics && !state.hasLevelKey) {
    const chestBox = {
      x: state.level.chest.x * TILE,
      y: state.level.chest.y * TILE,
      w: 16,
      h: 16,
    };

    if (intersects(state.player, chestBox)) {
      state.hasLevelKey = true;
      state.score += 100;
      audio.key();
      state.status = "Vault key found. Portal unlocked.";
    }
  }

  const portalBox = {
    x: state.level.portal.x * TILE,
    y: state.level.portal.y * TILE,
    w: 16,
    h: 16,
  };

  if (intersects(state.player, portalBox)) {
    if (!state.hasLevelKey) {
      if (state.levelRelics < state.level.requiredRelics) {
        const needed = state.level.requiredRelics - state.levelRelics;
        state.status = `Find ${needed} more relic shard(s)`;
      } else {
        state.status = "Open the chest to get the key";
      }
      return;
    }

    audio.portal();

    if (state.levelIndex === LEVELS.length - 1) {
      state.status = `Realm restored. Score ${state.score}`;
      state.gameWon = true;
      audio.setMood("triumph");
      audio.win();
    } else {
      loadLevel(state.levelIndex + 1, true);
    }
  }
}

function updateTimer(dt) {
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    damagePlayer("Time is up", true);
  }

  if (state.timeLeft <= 18) {
    audio.setMood("danger");
  } else if (state.hasLevelKey) {
    audio.setMood("triumph");
  } else {
    audio.setMood("calm");
  }
}

function updateCamera() {
  const levelPixelWidth = state.level.mapRows[0].length * TILE;
  const target = state.player.x - canvas.width / 2 + state.player.w;
  state.cameraX += (target - state.cameraX) * 0.1;
  state.cameraX = Math.max(0, Math.min(levelPixelWidth - canvas.width, state.cameraX));
}

function drawBackground(time) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#132746");
  grad.addColorStop(1, "#091626");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 36; i += 1) {
    const px = (i * 179 + Math.floor(state.cameraX * 0.18)) % canvas.width;
    const py = 20 + (i * 57) % (canvas.height - 80);
    ctx.fillStyle = i % 3 === 0 ? "#9cc3ff22" : "#ffffff14";
    ctx.fillRect(px, py, 2, 2);
  }

  ctx.fillStyle = "#0c2236";
  const layerOffset = (state.cameraX * 0.35) % canvas.width;
  ctx.beginPath();
  ctx.moveTo(-layerOffset, canvas.height);
  for (let x = -layerOffset; x <= canvas.width + 120; x += 40) {
    const ridge = 220 + Math.sin((x + time * 0.03) * 0.03) * 18;
    ctx.lineTo(x, ridge);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.fill();
}

function drawWorld(time) {
  const rows = state.level.mapRows;
  const cols = rows[0].length;
  const startCol = Math.floor(state.cameraX / TILE);
  const endCol = Math.min(cols, startCol + Math.ceil(canvas.width / TILE) + 2);

  for (let y = 0; y < rows.length; y += 1) {
    for (let x = startCol; x < endCol; x += 1) {
      const tile = rows[y][x];
      if (tile === 0) continue;
      drawTile(ctx, atlas, tile, x * TILE - state.cameraX, y * TILE, TILE, time);
    }
  }

  for (const coin of state.level.coins) {
    if (coin.taken) continue;
    const bob = Math.sin(time * 0.006 + coin.x) * 1.5;
    drawSprite(ctx, atlas, "coin", coin.x * TILE - state.cameraX, coin.y * TILE + bob, { scale: 2 });
  }

  for (const relic of state.level.relics) {
    if (relic.taken) continue;
    const bob = Math.sin(time * 0.004 + relic.x * 0.4) * 1.8;
    drawSprite(ctx, atlas, "relic", relic.x * TILE - state.cameraX, relic.y * TILE + bob, { scale: 2 });
  }

  drawSprite(
    ctx,
    atlas,
    state.hasLevelKey ? "chestOpen" : "chestClosed",
    state.level.chest.x * TILE - state.cameraX,
    state.level.chest.y * TILE,
    { scale: 2 },
  );

  if (state.hasLevelKey) {
    drawSprite(ctx, atlas, "key", state.level.chest.x * TILE - state.cameraX + 18, state.level.chest.y * TILE - 10, {
      scale: 1,
      alpha: 0.85,
    });
  }

  for (const enemy of state.level.enemies) {
    const sprite = ENEMY_ORDER.includes(enemy.kind) ? enemy.kind : "goblin";
    drawSprite(ctx, atlas, sprite, enemy.x - state.cameraX, enemy.y * TILE - 1, {
      scale: 2,
      flipX: enemy.dir < 0,
    });
  }

  drawSprite(
    ctx,
    atlas,
    state.hasLevelKey ? "portalOpen" : "portalLocked",
    state.level.portal.x * TILE - state.cameraX,
    state.level.portal.y * TILE,
    { scale: 2 },
  );

  if (!(state.player.invulnTimer > 0.1 && Math.floor(state.player.invulnTimer * 16) % 2 === 0)) {
    drawSprite(ctx, atlas, "hero", state.player.x - state.cameraX, state.player.y, {
      scale: 2,
      flipX: state.playerFacing < 0,
    });
  }
}

function drawOverlay() {
  for (let i = 0; i < state.lives; i += 1) {
    drawSprite(ctx, atlas, "heart", 10 + i * 18, 8, { scale: 1 });
  }

  if (state.gameWon) {
    ctx.fillStyle = "#000a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5f8ff";
    ctx.font = "24px Lucida Console";
    ctx.fillText("PIXEL GAME CLEARED", 178, 154);
    ctx.font = "14px Lucida Console";
    ctx.fillText(`Final score: ${state.score}`, 236, 184);
  }
}

function render(time) {
  drawBackground(time);
  drawWorld(time);
  drawOverlay();

  hud.level.textContent = String(state.levelIndex + 1);
  hud.lives.textContent = String(state.lives);
  hud.relics.textContent = `${state.levelRelics}/${state.level.requiredRelics}`;
  hud.coins.textContent = String(state.totalCoins);
  hud.time.textContent = String(Math.ceil(Math.max(0, state.timeLeft)));
  hud.status.textContent = state.status;
  hud.objective.textContent = state.level.objective;
}

function gameLoop(time) {
  if (!gameLoop.lastTime) gameLoop.lastTime = time;
  const dt = Math.min((time - gameLoop.lastTime) / 1000, 0.033);
  gameLoop.lastTime = time;

  if (!state.gameWon) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateObjectives();
    updateTimer(dt);
    updateCamera();
  }

  render(time);
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
