import { AudioSystem } from "./audio.js";
import { LEVELS } from "./levels.js";
import { ATLAS_URL, ENEMY_ORDER, TILE, drawAsset, drawTile } from "./assets.js";

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
const jumpVelocity = -365;
const playerSpeed = 152;
const playerMaxLives = 5;

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
  return {
    ...source,
    mapRows: source.map.map((row) => row.split("").map(Number)),
    coins: source.coins.map((coin) => ({ ...coin, taken: false })),
    relics: source.relics.map((relic) => ({ ...relic, taken: false })),
    bonuses: source.bonuses.map((bonus) => ({ ...bonus, taken: false })),
    enemies: source.enemies.map((enemy) => ({ ...enemy, dir: 1, spawnX: enemy.x })),
    backProps: [...source.backProps],
    frontProps: [...source.frontProps],
    npcs: [...source.npcs],
  };
}

function tileAt(tx, ty) {
  if (ty < 0 || tx < 0) return 1;
  if (ty >= state.level.mapRows.length) return 1;
  if (tx >= state.level.mapRows[0].length) return 1;
  return state.level.mapRows[ty][tx];
}

function isSolidTile(tile) {
  return tile === 1 || tile === 2 || tile === 3 || tile === 5 || tile === 7;
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resetPlayerToStart() {
  const start = state.level.start;
  state.player.x = start.x * TILE + 2;
  state.player.y = start.y * TILE - 10;
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
  for (const bonus of state.level.bonuses) {
    bonus.taken = false;
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

function resetAfterDamage(fullReset) {
  if (fullReset) {
    resetLevelProgress();
  }
  resetPlayerToStart();
}

function damagePlayer(reason, fullReset = false) {
  if (state.player.invulnTimer > 0) return;

  state.lives -= 1;
  audio.hit();
  state.status = reason;

  if (state.lives <= 0) {
    state.lives = 3;
    fullReset = true;
    state.status = "The path resets.";
  }

  resetAfterDamage(fullReset);
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
        damagePlayer("Water dragged you under.", false);
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
    damagePlayer("You fell below the kingdom.", false);
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

    const box = { x: enemy.x + 4, y: enemy.y * TILE + 4, w: 10, h: 10 };
    if (intersects(state.player, box)) {
      damagePlayer("A creature struck you.", false);
    }
  }
}

function applyBonus(bonus) {
  if (bonus.effect === "score") {
    state.score += bonus.value;
    state.status = "Treasure found.";
    return;
  }

  if (bonus.effect === "time") {
    state.timeLeft = Math.min(state.level.timeLimit + 30, state.timeLeft + bonus.value);
    state.status = "More time gained.";
    return;
  }

  if (bonus.effect === "heal") {
    state.lives = Math.min(playerMaxLives, state.lives + bonus.value);
    state.status = "Hearts restored.";
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
      state.score += coin.kind === "coinSilver" ? 10 : 20;
      audio.coin();
    }
  }

  for (const bonus of state.level.bonuses) {
    if (bonus.taken) continue;
    const box = { x: bonus.x * TILE + 2, y: bonus.y * TILE + 2, w: 12, h: 12 };
    if (intersects(state.player, box)) {
      bonus.taken = true;
      applyBonus(bonus);
    }
  }

  for (const relic of state.level.relics) {
    if (relic.taken) continue;
    const box = { x: relic.x * TILE + 1, y: relic.y * TILE + 1, w: 13, h: 13 };
    if (intersects(state.player, box)) {
      relic.taken = true;
      state.levelRelics += 1;
      state.totalRelics += 1;
      state.score += 60;
      audio.relic();
      state.status = `Relic ${state.levelRelics}/${state.level.requiredRelics} recovered.`;
    }
  }

  if (state.levelRelics >= state.level.requiredRelics && !state.hasLevelKey) {
    const chestBox = {
      x: state.level.chest.x * TILE,
      y: state.level.chest.y * TILE,
      w: 24,
      h: 20,
    };

    if (intersects(state.player, chestBox)) {
      state.hasLevelKey = true;
      state.score += 100;
      audio.key();
      state.status = "The chest opened. The gate key is yours.";
    }
  }

  const portalBox = {
    x: state.level.portal.x * TILE,
    y: state.level.portal.y * TILE,
    w: 18,
    h: 30,
  };

  if (!intersects(state.player, portalBox)) {
    return;
  }

  if (!state.hasLevelKey) {
    state.status =
      state.levelRelics < state.level.requiredRelics
        ? `Find ${state.level.requiredRelics - state.levelRelics} more relic(s).`
        : "Open the chest to unlock the gate.";
    return;
  }

  audio.portal();

  if (state.levelIndex === LEVELS.length - 1) {
    state.status = `The kingdom is restored. Score ${state.score}`;
    state.gameWon = true;
    audio.setMood("triumph");
    audio.win();
    return;
  }

  loadLevel(state.levelIndex + 1, true);
}

function updateTimer(dt) {
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    damagePlayer("Time ran out.", true);
  }

  if (state.timeLeft <= 22) {
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
  grad.addColorStop(0, "#142844");
  grad.addColorStop(0.6, "#0d1d34");
  grad.addColorStop(1, "#091320");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff18";
  for (let i = 0; i < 40; i += 1) {
    const px = (i * 173 + Math.floor(state.cameraX * 0.2)) % canvas.width;
    const py = 18 + (i * 59) % (canvas.height - 110);
    ctx.fillRect(px, py, 2, 2);
  }

  ctx.fillStyle = "#0e2540";
  const offset = (state.cameraX * 0.28) % 220;
  ctx.beginPath();
  ctx.moveTo(-offset, canvas.height);
  for (let x = -offset; x <= canvas.width + 220; x += 36) {
    const ridge = 235 + Math.sin((x + time * 0.04) * 0.024) * 14;
    ctx.lineTo(x, ridge);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.fill();
}

function drawPropList(props, time, alpha = 1) {
  for (const item of props) {
    const frameIndex =
      item.name === "flowers" || item.name === "fence" || item.name === "lantern"
        ? Math.floor(time / 400) % 2
        : 0;
    drawAsset(ctx, atlas, item.name, item.x * TILE - state.cameraX, item.y * TILE, {
      width: item.width * TILE,
      height: item.height * TILE,
      flipX: item.flipX,
      alpha,
      frameIndex,
    });
  }
}

function drawNpcList(time) {
  for (const character of state.level.npcs) {
    drawAsset(ctx, atlas, character.name, character.x * TILE - state.cameraX, character.y * TILE, {
      width: 32,
      height: 32,
      frameIndex: character.name === "cat" ? Math.floor(time / 500) % 1 : 0,
    });
  }
}

function drawWorld(time) {
  drawPropList(state.level.backProps, time, 0.95);

  const rows = state.level.mapRows;
  const cols = rows[0].length;
  const startCol = Math.floor(state.cameraX / TILE);
  const endCol = Math.min(cols, startCol + Math.ceil(canvas.width / TILE) + 3);

  for (let y = 0; y < rows.length; y += 1) {
    for (let x = startCol; x < endCol; x += 1) {
      const tile = rows[y][x];
      if (tile === 0) continue;
      drawTile(ctx, atlas, tile, x * TILE - state.cameraX, y * TILE, TILE, time);
    }
  }

  drawNpcList(time);

  for (const coin of state.level.coins) {
    if (coin.taken) continue;
    const bob = Math.sin(time * 0.006 + coin.x) * 2;
    drawAsset(ctx, atlas, coin.kind ?? "coinGold", coin.x * TILE - state.cameraX, coin.y * TILE + bob, {
      width: 18,
      height: 18,
      frameIndex: Math.floor(time / 280) % 2,
    });
  }

  for (const bonus of state.level.bonuses) {
    if (bonus.taken) continue;
    const bob = Math.sin(time * 0.004 + bonus.x) * 1.5;
    drawAsset(ctx, atlas, bonus.name, bonus.x * TILE - state.cameraX, bonus.y * TILE + bob, {
      width: 20,
      height: 20,
      frameIndex: Math.floor(time / 320) % 2,
    });
  }

  for (const relic of state.level.relics) {
    if (relic.taken) continue;
    const bob = Math.sin(time * 0.004 + relic.x * 0.5) * 2;
    drawAsset(ctx, atlas, relic.kind ?? "gemPurple", relic.x * TILE - state.cameraX, relic.y * TILE + bob, {
      width: 20,
      height: 20,
      frameIndex: Math.floor(time / 300) % 2,
    });
  }

  drawAsset(ctx, atlas, state.hasLevelKey ? "chestOpen" : "chestClosed", state.level.chest.x * TILE - state.cameraX, state.level.chest.y * TILE, {
    width: 28,
    height: 24,
  });

  if (!state.hasLevelKey) {
    drawAsset(ctx, atlas, "keyDark", state.level.portal.x * TILE - state.cameraX + 4, state.level.portal.y * TILE - 10, {
      width: 16,
      height: 16,
    });
  }

  drawAsset(ctx, atlas, "exitDoor", state.level.portal.x * TILE - state.cameraX, state.level.portal.y * TILE, {
    width: 28,
    height: 34,
    alpha: state.hasLevelKey ? 1 : 0.72,
  });

  for (const enemy of state.level.enemies) {
    const frameIndex = Math.floor(time / 170) % 2;
    drawAsset(ctx, atlas, ENEMY_ORDER.includes(enemy.kind) ? enemy.kind : "goblin", enemy.x - state.cameraX, enemy.y * TILE, {
      width: enemy.kind === "bat" ? 34 : 32,
      height: enemy.kind === "bat" ? 30 : 32,
      frameIndex,
      flipX: enemy.dir < 0,
    });
  }

  drawPropList(state.level.frontProps, time);

  const heroFrame = state.player.onGround && Math.abs(state.player.vx) > 12 ? Math.floor(time / 130) % 4 : 0;
  if (!(state.player.invulnTimer > 0.1 && Math.floor(state.player.invulnTimer * 15) % 2 === 0)) {
    drawAsset(ctx, atlas, "heroIdle", state.player.x - state.cameraX - 8, state.player.y - 10, {
      width: 38,
      height: 38,
      frameIndex: heroFrame,
      flipX: state.playerFacing < 0,
    });
  }
}

function drawOverlay() {
  for (let i = 0; i < state.lives; i += 1) {
    drawAsset(ctx, atlas, "heart", 10 + i * 18, 8, { width: 14, height: 14 });
  }

  if (state.hasLevelKey) {
    drawAsset(ctx, atlas, "keyGold", 10, 26, { width: 16, height: 16 });
  }

  if (state.gameWon) {
    ctx.fillStyle = "#000b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8f3dc";
    ctx.font = "24px Lucida Console";
    ctx.fillText("KINGDOM RESTORED", 190, 152);
    ctx.font = "14px Lucida Console";
    ctx.fillText(`Final score: ${state.score}`, 238, 180);
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
