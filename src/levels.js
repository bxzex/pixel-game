function createMap(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function toRows(map) {
  return map.map((row) => row.join(""));
}

function fillGround(map, topY, startX = 0, endX = map[0].length - 1, topTile = 2, fillTile = 1) {
  for (let x = startX; x <= endX; x += 1) {
    map[topY][x] = topTile;
    for (let y = topY + 1; y < map.length; y += 1) {
      map[y][x] = fillTile;
    }
  }
}

function addPlatform(map, x, y, length, tile = 3) {
  for (let i = 0; i < length; i += 1) {
    map[y][x + i] = tile;
  }
}

function addSolidRect(map, x, y, width, height, tile = 5) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      map[py][px] = tile;
    }
  }
}

function addWater(map, startX, width, topY) {
  for (let x = startX; x < startX + width; x += 1) {
    for (let y = topY; y < map.length; y += 1) {
      map[y][x] = 6;
    }
  }
}

function addSpikeStrip(map, x, y, length) {
  for (let i = 0; i < length; i += 1) {
    map[y][x + i] = 4;
  }
}

function prop(name, x, y, width, height, flipX = false) {
  return { name, x, y, width, height, flipX };
}

function pickup(name, x, y, effect, value = 0) {
  return { name, x, y, effect, value };
}

function npc(name, x, y) {
  return { name, x, y };
}

function buildOakheartHamlet() {
  const width = 96;
  const height = 28;
  const groundY = 23;
  const map = createMap(width, height);

  fillGround(map, groundY);
  addWater(map, 34, 6, groundY);
  addPlatform(map, 33, 20, 8, 7);
  addPlatform(map, 12, 19, 8, 3);
  addPlatform(map, 22, 17, 7, 3);
  addPlatform(map, 46, 18, 9, 3);
  addPlatform(map, 62, 16, 8, 3);
  addPlatform(map, 74, 14, 8, 3);
  addSpikeStrip(map, 58, 22, 3);
  addSpikeStrip(map, 86, 22, 3);

  return {
    name: "Oakheart Hamlet",
    objective: "Recover the village relics, take the chest key, and reach the gate beyond the smithy.",
    timeLimit: 115,
    requiredRelics: 3,
    start: { x: 4, y: 21 },
    chest: { x: 83, y: 19 },
    portal: { x: 90, y: 19 },
    map: toRows(map),
    relics: [
      { x: 15, y: 18, kind: "gemPurple" },
      { x: 51, y: 17, kind: "map" },
      { x: 76, y: 13, kind: "gemBlue" },
    ],
    coins: [
      { x: 10, y: 22, kind: "coinGold" },
      { x: 18, y: 18, kind: "coinSilver" },
      { x: 27, y: 16, kind: "coinGold" },
      { x: 49, y: 17, kind: "coinSilver" },
      { x: 67, y: 15, kind: "coinGold" },
      { x: 80, y: 13, kind: "coinGold" },
    ],
    bonuses: [
      pickup("apple", 8, 22, "score", 35),
      pickup("apple", 20, 18, "score", 35),
      pickup("potionBlue", 38, 19, "time", 12),
      pickup("lantern", 70, 15, "score", 60),
      pickup("potionRed", 85, 18, "heal", 1),
    ],
    enemies: [
      { kind: "slime", x: 25, y: 22, minX: 20, maxX: 31, speed: 2.1 },
      { kind: "goblin", x: 56, y: 22, minX: 52, maxX: 65, speed: 2.7 },
      { kind: "bat", x: 78, y: 12, minX: 75, maxX: 88, speed: 2.6 },
    ],
    backProps: [
      prop("houseA", 2, 15, 8, 8),
      prop("houseB", 11, 15, 8, 8),
      prop("roundTree", 29, 16, 7, 8),
      prop("roundTree", 41, 16, 7, 8),
      prop("pineTree", 58, 15, 6, 8),
      prop("hillTree", 66, 15, 6, 8),
      prop("towerA", 72, 14, 8, 9),
      prop("smithy", 82, 15, 10, 8),
    ],
    frontProps: [
      prop("fence", 9, 21, 4, 3),
      prop("fence", 13, 21, 4, 3),
      prop("flowers", 6, 22, 3, 2),
      prop("bush", 31, 21, 3, 2),
      prop("rockMedium", 43, 22, 3, 2),
      prop("flowers", 60, 22, 3, 2),
      prop("rockLarge", 73, 22, 3, 2),
    ],
    npcs: [
      npc("elder", 7, 21),
      npc("maiden", 16, 21),
      npc("wizard", 86, 21),
    ],
  };
}

function buildGreenriverWilds() {
  const width = 106;
  const height = 30;
  const groundY = 24;
  const map = createMap(width, height);

  fillGround(map, groundY);
  addWater(map, 24, 8, groundY);
  addWater(map, 62, 10, groundY);
  addPlatform(map, 23, 20, 10, 7);
  addPlatform(map, 61, 18, 12, 7);
  addPlatform(map, 10, 18, 8, 3);
  addPlatform(map, 38, 17, 8, 3);
  addPlatform(map, 48, 14, 7, 3);
  addPlatform(map, 74, 15, 8, 3);
  addPlatform(map, 88, 12, 7, 3);
  addSpikeStrip(map, 54, 23, 4);
  addSpikeStrip(map, 98, 23, 3);

  return {
    name: "Greenriver Wilds",
    objective: "Cross the forest bridges, gather the relics hidden in the wilds, and unlock the gate in the ruins.",
    timeLimit: 125,
    requiredRelics: 4,
    start: { x: 3, y: 22 },
    chest: { x: 95, y: 20 },
    portal: { x: 100, y: 19 },
    map: toRows(map),
    relics: [
      { x: 13, y: 17, kind: "map" },
      { x: 42, y: 16, kind: "compass" },
      { x: 66, y: 17, kind: "gemPurple" },
      { x: 90, y: 11, kind: "gemBlue" },
    ],
    coins: [
      { x: 8, y: 23, kind: "coinSilver" },
      { x: 27, y: 19, kind: "coinGold" },
      { x: 44, y: 16, kind: "coinSilver" },
      { x: 69, y: 17, kind: "coinGold" },
      { x: 78, y: 14, kind: "coinSilver" },
      { x: 92, y: 11, kind: "coinGold" },
    ],
    bonuses: [
      pickup("potionGreen", 16, 17, "time", 18),
      pickup("mushroom", 40, 23, "score", 45),
      pickup("lantern", 57, 23, "score", 60),
      pickup("apple", 73, 14, "score", 35),
      pickup("potionBlue", 96, 19, "time", 10),
    ],
    enemies: [
      { kind: "slime", x: 19, y: 23, minX: 14, maxX: 22, speed: 2.4 },
      { kind: "goblin", x: 50, y: 23, minX: 46, maxX: 58, speed: 3 },
      { kind: "bat", x: 70, y: 16, minX: 64, maxX: 80, speed: 3.1 },
      { kind: "goblin", x: 94, y: 23, minX: 88, maxX: 102, speed: 3.2 },
    ],
    backProps: [
      prop("palmTree", 6, 15, 6, 9),
      prop("roundTree", 14, 15, 7, 9),
      prop("pineTree", 33, 15, 6, 9),
      prop("firTree", 38, 15, 6, 9),
      prop("hillTree", 43, 15, 6, 9),
      prop("roundTree", 55, 15, 7, 9),
      prop("pineTree", 79, 14, 6, 10),
      prop("towerB", 90, 14, 8, 10),
      prop("workshop", 97, 16, 9, 8),
    ],
    frontProps: [
      prop("bush", 11, 23, 3, 2),
      prop("flowers", 17, 23, 3, 2),
      prop("rockSmall", 34, 23, 2, 2),
      prop("rockLarge", 58, 23, 3, 2),
      prop("fence", 83, 23, 4, 3),
      prop("fence", 87, 23, 4, 3),
    ],
    npcs: [
      npc("witch", 5, 22),
      npc("villager", 98, 22),
      npc("cat", 89, 23),
    ],
  };
}

function buildAshenKeep() {
  const width = 118;
  const height = 30;
  const groundY = 24;
  const map = createMap(width, height);

  fillGround(map, groundY, 0, 30, 2, 1);
  fillGround(map, groundY, 31, width - 1, 5, 5);
  addSolidRect(map, 78, 16, 30, 1, 5);
  addSolidRect(map, 92, 12, 14, 1, 5);
  addPlatform(map, 18, 19, 8, 3);
  addPlatform(map, 38, 17, 7, 3);
  addPlatform(map, 54, 19, 8, 3);
  addPlatform(map, 70, 18, 7, 3);
  addPlatform(map, 96, 11, 7, 3);
  addWater(map, 46, 5, groundY);
  addSpikeStrip(map, 64, 23, 5);
  addSpikeStrip(map, 88, 23, 4);
  addSpikeStrip(map, 109, 23, 4);

  return {
    name: "Ashen Keep",
    objective: "Bring the relics back through the ruined keep, unlock the final door, and escape the fortress.",
    timeLimit: 145,
    requiredRelics: 5,
    start: { x: 4, y: 22 },
    chest: { x: 106, y: 20 },
    portal: { x: 112, y: 19 },
    map: toRows(map),
    relics: [
      { x: 21, y: 18, kind: "gemPurple" },
      { x: 41, y: 16, kind: "shield" },
      { x: 58, y: 18, kind: "sword" },
      { x: 81, y: 15, kind: "map" },
      { x: 99, y: 10, kind: "gemBlue" },
    ],
    coins: [
      { x: 15, y: 23, kind: "coinSilver" },
      { x: 24, y: 18, kind: "coinGold" },
      { x: 42, y: 16, kind: "coinSilver" },
      { x: 73, y: 17, kind: "coinGold" },
      { x: 93, y: 11, kind: "coinGold" },
      { x: 109, y: 19, kind: "coinSilver" },
    ],
    bonuses: [
      pickup("potionRed", 11, 23, "heal", 1),
      pickup("fire", 35, 23, "score", 80),
      pickup("lantern", 76, 17, "score", 80),
      pickup("potionGold", 96, 10, "time", 15),
      pickup("shield", 107, 19, "score", 120),
    ],
    enemies: [
      { kind: "goblin", x: 26, y: 23, minX: 20, maxX: 31, speed: 3.1 },
      { kind: "skeleton", x: 61, y: 23, minX: 55, maxX: 67, speed: 3.3 },
      { kind: "bat", x: 83, y: 15, minX: 78, maxX: 93, speed: 3.4 },
      { kind: "skeleton", x: 110, y: 23, minX: 104, maxX: 116, speed: 3.6 },
    ],
    backProps: [
      prop("towerA", 34, 14, 9, 10),
      prop("towerB", 45, 14, 9, 10),
      prop("smithy", 57, 16, 10, 8),
      prop("workshop", 68, 16, 10, 8),
      prop("towerA", 82, 12, 9, 12),
      prop("towerB", 97, 12, 9, 12),
    ],
    frontProps: [
      prop("rockMedium", 32, 23, 3, 2),
      prop("rockLarge", 52, 23, 3, 2),
      prop("fence", 79, 23, 4, 3),
      prop("flowers", 89, 23, 3, 2),
      prop("rockSmall", 102, 23, 2, 2),
    ],
    npcs: [
      npc("wizard", 8, 22),
      npc("elder", 13, 22),
    ],
  };
}

export const LEVELS = [buildOakheartHamlet(), buildGreenriverWilds(), buildAshenKeep()];
