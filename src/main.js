import { AudioSystem } from "./audio.js?v=20260307clean";
import { LEVELS } from "./levels.js?v=20260307clean";
import { ATLAS_URL, NEW_ATLAS_URL, TILE, TILE_COLLISION, drawAsset, drawTile } from "./assets.js?v=20260307clean";
import { createExplosion, updateParticles, drawParticles, particles } from "./effects.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const hud = {
  guide: document.querySelector("#hud-guide"),
  guideNote: document.querySelector("#hud-guide-note"),
  questList: document.querySelector("#quest-list"),
};

const help = document.querySelector(".help");
if (help) {
  help.textContent = "Move: WASD or Arrow Keys. Collect relics, open the chest for the key, then unlock the door.";
}

const audio = new AudioSystem();
const atlas = new Image();
atlas.src = ATLAS_URL;

const newAtlas = new Image();
newAtlas.src = NEW_ATLAS_URL;
let useNewAtlas = false;
newAtlas.onload = () => { useNewAtlas = true; };

const keys = new Set();
const moveSpeed = 92;
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
  inMenu: true,
  audioReady: false,
  level: null,
  hasLevelKey: false,
  timeLeft: 0,
  guideMessage: "",
  questState: {
    talkedToGuide: false,
    reachedDoor: false,
  },
  facing: "down",
  player: {
    x: 0,
    y: 0,
    w: 12,
    h: 12,
    vx: 0,
    vy: 0,
    invulnTimer: 0,
  },
  cameraX: 0,
  cameraY: 0,
};

const menuOverlay = document.querySelector("#game-menu");
const startBtn = document.querySelector("#start-btn");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    state.inMenu = false;
    if (menuOverlay) menuOverlay.style.display = "none";
    enableAudioOnce();
  });
}

const creditsBtn = document.querySelector("#credits-btn");
if (creditsBtn) {
  creditsBtn.addEventListener("click", () => {
    alert("Pixel Quest - Created by bxzex");
  });
}

function cloneLevel(index) {
  const source = LEVELS[index];
  return {
    ...source,
    mapRows: source.map.map((row) => row.split("").map(Number)),
    blockers: source.blockers.map((entry) => ({ ...entry })),
    hazards: source.hazards.map((entry) => ({ ...entry })),
    props: source.props.map((entry) => ({ ...entry })),
    npcs: source.npcs.map((entry) => ({ ...entry })),
    relics: source.relics.map((entry) => ({ ...entry, taken: false })),
    coins: source.coins.map((entry) => ({ ...entry, taken: false })),
    bonuses: source.bonuses.map((entry) => ({ ...entry, taken: false })),
    enemies: source.enemies.map((entry) => ({ ...entry, dir: 1, startX: entry.x, startY: entry.y })),
    questSteps: (source.questSteps ?? []).map((entry) => ({ ...entry })),
  };
}

function levelWidth() {
  return state.level.mapRows[0].length * TILE;
}

function levelHeight() {
  return state.level.mapRows.length * TILE;
}

function tileAt(tx, ty) {
  if (ty < 0 || tx < 0) return 6;
  if (ty >= state.level.mapRows.length) return 6;
  if (tx >= state.level.mapRows[0].length) return 6;
  return state.level.mapRows[ty][tx];
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function objectBox(x, y, w = 1, h = 1) {
  return { x: x * TILE, y: y * TILE, w: w * TILE, h: h * TILE };
}

function blockedByTiles(box) {
  const left = Math.floor(box.x / TILE);
  const right = Math.floor((box.x + box.w - 1) / TILE);
  const top = Math.floor(box.y / TILE);
  const bottom = Math.floor((box.y + box.h - 1) / TILE);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (TILE_COLLISION.has(tileAt(x, y))) {
        return true;
      }
    }
  }

  return false;
}

function blockedByRects(box) {
  return state.level.blockers.some((entry) => intersects(box, objectBox(entry.x, entry.y, entry.w, entry.h)));
}

function isBlocked(box) {
  return blockedByTiles(box) || blockedByRects(box);
}

function hazardAt(box) {
  return state.level.hazards.some((entry) => intersects(box, objectBox(entry.x, entry.y, entry.w, entry.h)));
}

function resetPlayerToStart() {
  state.player.x = state.level.start.x * TILE + 2;
  state.player.y = state.level.start.y * TILE + 2;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.invulnTimer = 1;
  state.facing = "down";
}

function resetLevelProgress() {
  state.levelCoins = 0;
  state.levelRelics = 0;
  state.hasLevelKey = false;
  state.timeLeft = state.level.timeLimit;
  state.questState = {
    talkedToGuide: false,
    reachedDoor: false,
  };
  state.guideMessage = `Find ${state.level.guideName} to begin the quest.`;
  particles.length = 0; // Clear particles on reset

  for (const group of [state.level.relics, state.level.coins, state.level.bonuses]) {
    for (const entry of group) {
      entry.taken = false;
    }
  }

  for (const enemy of state.level.enemies) {
    enemy.x = enemy.startX;
    enemy.y = enemy.startY;
    enemy.dir = 1;
  }
}

function loadLevel(index, keepProgress = true) {
  state.levelIndex = index;
  state.level = cloneLevel(index);

  if (!keepProgress) {
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

function questSteps() {
  return [
    {
      id: "talk-guide",
      text: state.level.questSteps.find((step) => step.id === "talk-guide")?.text ?? "Meet the guide.",
      done: state.questState.talkedToGuide,
    },
    {
      id: "collect-relics",
      text:
        state.level.questSteps.find((step) => step.id === "collect-relics")?.text ??
        `Recover ${state.level.requiredRelics} relics.`,
      done: state.levelRelics >= state.level.requiredRelics,
    },
    {
      id: "open-chest",
      text: state.level.questSteps.find((step) => step.id === "open-chest")?.text ?? "Open the chest.",
      done: state.hasLevelKey,
    },
    {
      id: "reach-door",
      text: state.level.questSteps.find((step) => step.id === "reach-door")?.text ?? "Reach the exit gate.",
      done: state.questState.reachedDoor,
    },
  ];
}

function updateQuestLog() {
  if (!hud.questList) return;
  const steps = questSteps();
  hud.questList.innerHTML = "";
  for (const step of steps) {
    const item = document.createElement("li");
    item.textContent = step.text;
    if (step.done) item.className = "done";
    hud.questList.appendChild(item);
  }
}

function damagePlayer(reason, fullReset = false) {
  if (state.player.invulnTimer > 0) return;

  state.lives -= 1;
  state.status = reason;
  audio.hit();
  createExplosion(state.player.x + state.player.w/2, state.player.y + state.player.h/2, 15, "#ef4444");

  if (state.lives <= 0) {
    state.lives = 3;
    fullReset = true;
    state.status = "You were forced back to the start.";
  }

  if (fullReset) {
    resetLevelProgress();
  }

  resetPlayerToStart();
}

function movePlayer(dt) {
  let inputX = 0;
  let inputY = 0;
  if (keys.has("arrowleft") || keys.has("a")) inputX -= 1;
  if (keys.has("arrowright") || keys.has("d")) inputX += 1;
  if (keys.has("arrowup") || keys.has("w")) inputY -= 1;
  if (keys.has("arrowdown") || keys.has("s")) inputY += 1;

  if (inputX === 0 && inputY === 0) {
    state.player.vx = 0;
    state.player.vy = 0;
    return;
  }

  const length = Math.hypot(inputX, inputY);
  state.player.vx = (inputX / length) * moveSpeed;
  state.player.vy = (inputY / length) * moveSpeed;

  if (Math.abs(inputX) > Math.abs(inputY)) {
    state.facing = inputX > 0 ? "right" : "left";
  } else {
    state.facing = inputY > 0 ? "down" : "up";
  }

  const nextXBox = {
    x: state.player.x + state.player.vx * dt,
    y: state.player.y,
    w: state.player.w,
    h: state.player.h,
  };
  if (!isBlocked(nextXBox)) {
    state.player.x = nextXBox.x;
  }

  const nextYBox = {
    x: state.player.x,
    y: state.player.y + state.player.vy * dt,
    w: state.player.w,
    h: state.player.h,
  };
  if (!isBlocked(nextYBox)) {
    state.player.y = nextYBox.y;
  }
}

function updatePlayer(dt) {
  movePlayer(dt);

  if (state.player.invulnTimer > 0) {
    state.player.invulnTimer -= dt;
  }

  const playerBox = { x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h };
  if (hazardAt(playerBox)) {
    damagePlayer("The keep defenses hit you.", false);
  }
}

function updateEnemies(dt) {
  const playerBox = { x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h };

  for (const enemy of state.level.enemies) {
    const velocity = enemy.speed * enemy.dir * dt;
    if (enemy.axis === "x") {
      enemy.x += velocity;
      if (enemy.x < enemy.min) {
        enemy.x = enemy.min;
        enemy.dir = 1;
      }
      if (enemy.x > enemy.max) {
        enemy.x = enemy.max;
        enemy.dir = -1;
      }
    } else {
      enemy.y += velocity;
      if (enemy.y < enemy.min) {
        enemy.y = enemy.min;
        enemy.dir = 1;
      }
      if (enemy.y > enemy.max) {
        enemy.y = enemy.max;
        enemy.dir = -1;
      }
    }

    const enemyBox = { x: enemy.x * TILE + 2, y: enemy.y * TILE + 2, w: 12, h: 12 };
    if (intersects(playerBox, enemyBox)) {
      damagePlayer("A monster struck you.", false);
    }
  }
}

function collectBonus(item) {
  if (item.effect === "score") {
    state.score += item.value;
    state.status = "Supplies collected.";
    return;
  }

  if (item.effect === "time") {
    state.timeLeft = Math.min(state.level.timeLimit + 40, state.timeLeft + item.value);
    state.status = "More time gained.";
    return;
  }

  if (item.effect === "heal") {
    state.lives = Math.min(playerMaxLives, state.lives + item.value);
    state.status = "Hearts restored.";
  }
}

function updateGuideInteraction(playerBox) {
  for (const character of state.level.npcs) {
    if (character.kind !== state.level.guideNpc) continue;
    const box = { x: character.x * TILE, y: character.y * TILE, w: 18, h: 18 };
    if (!intersects(playerBox, box)) continue;

    state.guideMessage = character.message;
    if (!state.questState.talkedToGuide) {
      state.questState.talkedToGuide = true;
      state.status = `${state.level.guideName} briefed you.`;
      state.score += 20;
    }
    return;
  }
}

function updateInteractions() {
  const playerBox = { x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h };
  updateGuideInteraction(playerBox);

  for (const coin of state.level.coins) {
    if (coin.taken) continue;
    if (!intersects(playerBox, objectBox(coin.x, coin.y))) continue;
    coin.taken = true;
    state.levelCoins += 1;
    state.totalCoins += 1;
    state.score += coin.kind === "coinSilver" ? 10 : 20;
    audio.coin();
    createExplosion(coin.x * TILE + TILE/2, coin.y * TILE + TILE/2, 8, "#fbbf24");
  }

  for (const relic of state.level.relics) {
    if (relic.taken) continue;
    if (!intersects(playerBox, objectBox(relic.x, relic.y))) continue;
    relic.taken = true;
    state.levelRelics += 1;
    state.totalRelics += 1;
    state.score += 70;
    state.status = `Relics ${state.levelRelics}/${state.level.requiredRelics}`;
    state.guideMessage =
      state.levelRelics >= state.level.requiredRelics
        ? "All relics recovered. Head for the chest."
        : `Keep searching. ${state.level.requiredRelics - state.levelRelics} relics remain.`;
    audio.relic();
    createExplosion(relic.x * TILE + TILE/2, relic.y * TILE + TILE/2, 12, "#a78bfa");
  }

  for (const bonus of state.level.bonuses) {
    if (bonus.taken) continue;
    if (!intersects(playerBox, objectBox(bonus.x, bonus.y))) continue;
    bonus.taken = true;
    collectBonus(bonus);
    createExplosion(bonus.x * TILE + TILE/2, bonus.y * TILE + TILE/2, 10, "#4ade80");
  }

  if (!state.hasLevelKey && state.levelRelics >= state.level.requiredRelics) {
    const chestBox = { x: state.level.chest.x * TILE, y: state.level.chest.y * TILE, w: 20, h: 18 };
    if (intersects(playerBox, chestBox)) {
      state.hasLevelKey = true;
      state.score += 100;
      state.status = "Chest opened. The key is yours.";
      state.guideMessage = "The gate is ready. Take the key to the exit door.";
      audio.key();
      createExplosion(state.level.chest.x * TILE + 10, state.level.chest.y * TILE + 10, 15, "#fbbf24");
    }
  }

  const doorBox = { x: state.level.door.x * TILE, y: state.level.door.y * TILE, w: 20, h: 28 };
  if (!intersects(playerBox, doorBox)) {
    return;
  }

  if (!state.hasLevelKey) {
    state.status =
      state.levelRelics < state.level.requiredRelics
        ? `Find ${state.level.requiredRelics - state.levelRelics} more relic(s).`
        : "Open the chest to claim the key.";
    state.guideMessage = state.status;
    return;
  }

  audio.portal();
  if (state.levelIndex === LEVELS.length - 1) {
    state.questState.reachedDoor = true;
    state.gameWon = true;
    state.status = `The kingdom is saved. Score ${state.score}`;
    state.guideMessage = "Every quest is complete.";
    audio.setMood("triumph");
    audio.win();
    return;
  }

  state.questState.reachedDoor = true;
  loadLevel(state.levelIndex + 1, true);
}

function updateTimer(dt) {
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    damagePlayer("Night fell before you escaped.", true);
  }

  if (state.timeLeft < 25) {
    audio.setMood("danger");
  } else if (state.hasLevelKey) {
    audio.setMood("triumph");
  } else {
    audio.setMood("calm");
  }
}

function updateCamera() {
  const targetX = state.player.x - canvas.width / 2 + 24;
  const targetY = state.player.y - canvas.height / 2 + 24;
  state.cameraX += (targetX - state.cameraX) * 0.12;
  state.cameraY += (targetY - state.cameraY) * 0.12;
  state.cameraX = Math.max(0, Math.min(levelWidth() - canvas.width, state.cameraX));
  state.cameraY = Math.max(0, Math.min(levelHeight() - canvas.height, state.cameraY));
}

function drawBackground(time) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#12243f");
  grad.addColorStop(1, "#09131f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff10";
  for (let i = 0; i < 30; i += 1) {
    const x = (i * 181 + Math.floor(state.cameraX * 0.18)) % canvas.width;
    const y = (i * 61 + Math.floor(time * 0.02)) % canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawMap(time) {
  const rows = state.level.mapRows;
  const cols = rows[0].length;
  const startCol = Math.floor(state.cameraX / TILE);
  const endCol = Math.min(cols, startCol + Math.ceil(canvas.width / TILE) + 2);
  const startRow = Math.floor(state.cameraY / TILE);
  const endRow = Math.min(rows.length, startRow + Math.ceil(canvas.height / TILE) + 2);

  for (let y = startRow; y < endRow; y += 1) {
    for (let x = startCol; x < endCol; x += 1) {
      drawTile(ctx, atlas, rows[y][x], x * TILE - state.cameraX, y * TILE - state.cameraY, TILE, time);
    }
  }
}

function drawProps(layer, time) {
  const currentAtlas = useNewAtlas ? newAtlas : atlas;
  for (const item of state.level.props) {
    if ((item.layer ?? "back") !== layer) continue;
    drawAsset(ctx, currentAtlas, item.name, item.x * TILE - state.cameraX, item.y * TILE - state.cameraY, {
      width: item.width * TILE,
      height: item.height * TILE,
      flipX: item.flipX,
      frameIndex: Math.floor(time / 450),
    });
  }
}

function drawCharacters(time) {
  const currentAtlas = useNewAtlas ? newAtlas : atlas;
  for (const npc of state.level.npcs) {
    drawAsset(ctx, currentAtlas, npc.kind, npc.x * TILE - state.cameraX - 6, npc.y * TILE - state.cameraY - 10, {
      width: npc.kind === "cat" ? 24 : 30,
      height: npc.kind === "cat" ? 20 : 30,
      frameIndex: Math.floor(time / 400),
    });
  }

  for (const enemy of state.level.enemies) {
    drawAsset(ctx, currentAtlas, enemy.kind, enemy.x * TILE - state.cameraX - 4, enemy.y * TILE - state.cameraY - 8, {
      width: enemy.kind === "bat" ? 30 : 28,
      height: enemy.kind === "bat" ? 24 : 28,
      flipX: enemy.axis === "x" ? enemy.dir < 0 : false,
      frameIndex: Math.floor(time / 220),
    });
  }

  const heroAsset =
    state.facing === "up"
      ? "heroBack"
      : state.facing === "left" || state.facing === "right"
        ? "heroSide"
        : "heroFront";
  const heroFlip = state.facing === "left";

  if (!(state.player.invulnTimer > 0.1 && Math.floor(state.player.invulnTimer * 14) % 2 === 0)) {
    drawAsset(ctx, currentAtlas, heroAsset, state.player.x - state.cameraX - 8, state.player.y - state.cameraY - 12, {
      width: 32,
      height: 32,
      flipX: heroFlip,
      frameIndex: Math.floor(time / 220),
    });
  }
}

function drawPickups(time) {
  const currentAtlas = useNewAtlas ? newAtlas : atlas;
  for (const group of [state.level.coins, state.level.bonuses, state.level.relics]) {
    for (const item of group) {
      if (item.taken) continue;
      const bob = Math.sin(time * 0.005 + item.x * 0.4 + item.y * 0.2) * 1.5;
      drawAsset(ctx, currentAtlas, item.kind, item.x * TILE - state.cameraX - 1, item.y * TILE - state.cameraY - 4 + bob, {
        width: 18,
        height: 18,
        frameIndex: Math.floor(time / 300),
      });
    }
  }

  drawAsset(
    ctx,
    currentAtlas,
    state.hasLevelKey ? "chestOpen" : "chestClosed",
    state.level.chest.x * TILE - state.cameraX - 2,
    state.level.chest.y * TILE - state.cameraY - 2,
    { width: 22, height: 20 },
  );

  drawAsset(ctx, currentAtlas, state.hasLevelKey ? "keyGold" : "keyDark", state.level.door.x * TILE - state.cameraX, state.level.door.y * TILE - state.cameraY - 10, {
    width: 16,
    height: 16,
  });

  drawAsset(ctx, currentAtlas, "door", state.level.door.x * TILE - state.cameraX - 2, state.level.door.y * TILE - state.cameraY, {
    width: 24,
    height: 30,
    alpha: state.hasLevelKey ? 1 : 0.8,
  });
}

function drawUi() {
  const currentAtlas = useNewAtlas ? newAtlas : atlas;
  
  // Background for HUD area
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, canvas.width, 40);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, 40);

  // Lives (Hearts)
  for (let i = 0; i < playerMaxLives; i += 1) {
    drawAsset(ctx, currentAtlas, i < state.lives ? "uiIconHeart" : "heartEmpty", 10 + i * 24, 8, {
      width: 24,
      height: 24,
    });
  }

  // Set font for canvas HUD
  ctx.font = "12px 'Pixel', monospace";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";

  // Coins
  drawAsset(ctx, currentAtlas, "uiIconCoin", 150, 8, { width: 24, height: 24 });
  ctx.fillText(String(state.totalCoins), 178, 25);

  // Relics
  drawAsset(ctx, currentAtlas, "uiIconSwords", 230, 8, { width: 24, height: 24 });
  ctx.fillText(`${state.levelRelics}/${state.level.requiredRelics}`, 258, 25);

  // Time
  drawAsset(ctx, currentAtlas, "uiIconDrop", 320, 8, { width: 24, height: 24 });
  ctx.fillText(`${Math.ceil(Math.max(0, state.timeLeft))}s`, 348, 25);

  // Level & Status
  ctx.textAlign = "right";
  ctx.fillText(`LVL ${state.levelIndex + 1}`, canvas.width - 10, 25);

  if (state.gameWon) {
    ctx.fillStyle = "#000b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f4eed7";
    ctx.font = "24px 'Pixel', monospace";
    ctx.textAlign = "center";
    ctx.fillText("KINGDOM RESTORED", canvas.width / 2, 150);
    ctx.font = "14px 'Pixel', monospace";
    ctx.fillText(`FINAL SCORE: ${state.score}`, canvas.width / 2, 180);
    ctx.fillText("PRESS F5 TO RESTART", canvas.width / 2, 210);
  }
}

function render(time) {
  drawBackground(time);
  drawMap(time);
  drawProps("back", time);
  drawPickups(time);
  drawParticles(ctx, state.cameraX, state.cameraY);
  drawCharacters(time);
  drawProps("front", time);
  drawUi();

  if (hud.guide) hud.guide.textContent = state.level.guideName;
  if (hud.guideNote) hud.guideNote.textContent = state.guideMessage;
  updateQuestLog();
}

function gameLoop(time) {
  if (!gameLoop.lastTime) gameLoop.lastTime = time;
  const dt = Math.min((time - gameLoop.lastTime) / 1000, 0.033);
  gameLoop.lastTime = time;

  if (!state.inMenu && !state.gameWon) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateInteractions();
    updateTimer(dt);
    updateCamera();
    updateParticles(dt);
  }

  if (!state.inMenu) {
    render(time);
  }
  requestAnimationFrame(gameLoop);
}

function enableAudioOnce() {
  if (state.audioReady) return;
  state.audioReady = true;
  audio.enable().catch(() => {
    state.audioReady = false;
  });
}

document.addEventListener("keydown", (event) => {
  enableAudioOnce();
  keys.add(event.key.toLowerCase());
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

document.addEventListener("pointerdown", enableAudioOnce, { passive: true });

loadLevel(0, false);
requestAnimationFrame(gameLoop);
