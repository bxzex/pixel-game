import { TILE_TYPES } from "./assets.js";

function createMap(width, height, fill = TILE_TYPES.GRASS) {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

function paintRect(map, x, y, width, height, tile) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      map[py][px] = tile;
    }
  }
}

function paintHLine(map, x, y, length, tile) {
  for (let px = x; px < x + length; px += 1) {
    map[y][px] = tile;
  }
}

function paintVLine(map, x, y, length, tile) {
  for (let py = y; py < y + length; py += 1) {
    map[py][x] = tile;
  }
}

function toRows(map) {
  return map.map((row) => row.join(""));
}

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function prop(name, x, y, width, height, layer = "back", flipX = false) {
  return { name, x, y, width, height, layer, flipX };
}

function item(kind, x, y, effect = "score", value = 0) {
  return { kind, x, y, effect, value };
}

function npc(kind, x, y, message) {
  return { kind, x, y, message };
}

function enemy(kind, x, y, axis, min, max, speed) {
  return { kind, x, y, axis, min, max, speed };
}

function buildVillage() {
  const map = createMap(52, 30);
  paintRect(map, 0, 0, 52, 30, TILE_TYPES.GRASS);
  paintRect(map, 0, 20, 52, 10, TILE_TYPES.DIRT);
  paintRect(map, 6, 10, 12, 9, TILE_TYPES.DIRT);
  paintRect(map, 19, 8, 11, 11, TILE_TYPES.STONE);
  paintRect(map, 33, 7, 14, 12, TILE_TYPES.DIRT);
  paintRect(map, 14, 22, 24, 3, TILE_TYPES.STONE);
  paintRect(map, 39, 14, 7, 5, TILE_TYPES.WATER);
  paintRect(map, 0, 0, 1, 30, TILE_TYPES.BRICK);
  paintRect(map, 51, 0, 1, 30, TILE_TYPES.BRICK);
  paintRect(map, 0, 0, 52, 1, TILE_TYPES.BRICK);
  paintRect(map, 0, 29, 52, 1, TILE_TYPES.BRICK);
  paintRect(map, 40, 18, 5, 2, TILE_TYPES.BRIDGE);
  paintRect(map, 9, 5, 3, 3, TILE_TYPES.FLOWERS);
  paintRect(map, 29, 21, 4, 2, TILE_TYPES.FLOWERS);

  return {
    name: "Oakheart Village",
    objective: "Speak to the elder, gather the village relics, open the chest, then unlock the east gate.",
    timeLimit: 150,
    requiredRelics: 3,
    start: { x: 5, y: 23 },
    chest: { x: 27, y: 10 },
    door: { x: 47, y: 11 },
    map: toRows(map),
    blockers: [
      rect(3, 15, 7, 8),
      rect(11, 15, 7, 8),
      rect(34, 12, 9, 10),
      rect(44, 12, 8, 10),
      rect(21, 12, 4, 7),
      rect(30, 5, 2, 8),
      rect(36, 5, 2, 8),
      rect(8, 5, 2, 9),
      rect(13, 5, 2, 9),
    ],
    hazards: [],
    npcs: [
      npc("elder", 6, 24, "The relics are scattered across the village."),
      npc("maiden", 16, 24, "The chest near the plaza holds the gate key."),
      npc("wizard", 37, 23, "Drink blue potions when time gets tight."),
      npc("villager", 43, 23, "The road east leads to the forest."),
      npc("cat", 24, 19, "The cat guards the plaza."),
    ],
    enemies: [
      enemy("slime", 31, 24, "x", 28, 36, 1.8),
      enemy("goblin", 41, 22, "y", 20, 25, 2.1),
    ],
    relics: [
      item("map", 12, 7),
      item("compass", 24, 15),
      item("gemPurple", 42, 9),
    ],
    coins: [
      item("coinGold", 8, 22),
      item("coinSilver", 14, 11),
      item("coinGold", 22, 22),
      item("coinSilver", 30, 15),
      item("coinGold", 38, 22),
      item("coinSilver", 44, 9),
    ],
    bonuses: [
      item("apple", 10, 24, "score", 25),
      item("apple", 13, 24, "score", 25),
      item("potionBlue", 35, 23, "time", 18),
      item("potionRed", 25, 10, "heal", 1),
      item("lantern", 19, 24, "score", 60),
    ],
    props: [
      prop("houseA", 2, 14, 8, 9),
      prop("houseB", 10, 14, 8, 9),
      prop("towerA", 20, 11, 5, 9),
      prop("roundTree", 4, 5, 5, 7),
      prop("roundTree", 12, 5, 5, 7),
      prop("palmTree", 37, 4, 5, 9),
      prop("smithy", 33, 11, 10, 9),
      prop("workshop", 43, 11, 9, 9),
      prop("fence", 5, 21, 3, 3, "front"),
      prop("fence", 8, 21, 3, 3, "front"),
      prop("rockSmall", 28, 23, 2, 2, "front"),
      prop("flowers", 18, 23, 3, 2, "front"),
      prop("bush", 39, 23, 3, 2, "front"),
    ],
  };
}

function buildForest() {
  const map = createMap(56, 32);
  paintRect(map, 0, 0, 56, 32, TILE_TYPES.GRASS);
  paintRect(map, 0, 24, 56, 8, TILE_TYPES.DIRT);
  paintRect(map, 18, 0, 8, 32, TILE_TYPES.WATER);
  paintRect(map, 18, 11, 8, 3, TILE_TYPES.BRIDGE);
  paintRect(map, 18, 21, 8, 3, TILE_TYPES.BRIDGE);
  paintRect(map, 29, 8, 10, 3, TILE_TYPES.STONE);
  paintRect(map, 34, 15, 11, 3, TILE_TYPES.STONE);
  paintRect(map, 41, 7, 10, 10, TILE_TYPES.DIRT);
  paintRect(map, 0, 0, 1, 32, TILE_TYPES.BRICK);
  paintRect(map, 55, 0, 1, 32, TILE_TYPES.BRICK);
  paintRect(map, 0, 0, 56, 1, TILE_TYPES.BRICK);
  paintRect(map, 0, 31, 56, 1, TILE_TYPES.BRICK);
  paintHLine(map, 5, 7, 7, TILE_TYPES.FLOWERS);
  paintHLine(map, 43, 25, 6, TILE_TYPES.FLOWERS);

  return {
    name: "Greenriver Forest",
    objective: "Cross the river bridges, recover the forest relics, and unlock the keep road.",
    timeLimit: 165,
    requiredRelics: 4,
    start: { x: 4, y: 26 },
    chest: { x: 46, y: 10 },
    door: { x: 52, y: 10 },
    map: toRows(map),
    blockers: [
      rect(4, 7, 5, 10),
      rect(10, 10, 4, 8),
      rect(29, 3, 5, 10),
      rect(36, 3, 5, 10),
      rect(45, 18, 5, 10),
      rect(49, 6, 4, 10),
      rect(27, 20, 3, 4),
      rect(33, 22, 3, 4),
      rect(40, 21, 3, 4),
    ],
    hazards: [],
    npcs: [
      npc("witch", 8, 25, "The river hides more than fish."),
      npc("wizard", 31, 14, "The bridge is safer than the water."),
      npc("cat", 44, 17, "The cat found the gate."),
    ],
    enemies: [
      enemy("slime", 14, 26, "x", 10, 17, 2),
      enemy("bat", 24, 16, "y", 8, 22, 2.4),
      enemy("goblin", 39, 26, "x", 33, 44, 2.3),
      enemy("skeleton", 50, 23, "y", 20, 27, 2.2),
    ],
    relics: [
      item("map", 12, 8),
      item("gemBlue", 31, 7),
      item("compass", 39, 16),
      item("gemPurple", 49, 8),
    ],
    coins: [
      item("coinSilver", 7, 26),
      item("coinGold", 15, 10),
      item("coinSilver", 22, 12),
      item("coinGold", 31, 20),
      item("coinGold", 40, 16),
      item("coinSilver", 50, 9),
    ],
    bonuses: [
      item("mushroom", 11, 24, "score", 35),
      item("potionGreen", 29, 14, "time", 20),
      item("lantern", 34, 26, "score", 70),
      item("apple", 47, 26, "score", 25),
      item("potionRed", 45, 9, "heal", 1),
    ],
    props: [
      prop("roundTree", 3, 7, 5, 8),
      prop("pineTree", 9, 10, 4, 7),
      prop("firTree", 28, 3, 5, 8),
      prop("hillTree", 34, 3, 5, 8),
      prop("bush", 26, 22, 3, 2, "front"),
      prop("bush", 32, 22, 3, 2, "front"),
      prop("bush", 39, 21, 3, 2, "front"),
      prop("rockSmall", 15, 23, 2, 2, "front"),
      prop("rockMedium", 43, 24, 2, 2, "front"),
      prop("towerB", 47, 17, 5, 10),
      prop("fence", 18, 10, 4, 3, "front"),
      prop("fence", 22, 10, 4, 3, "front"),
      prop("flowers", 44, 25, 3, 2, "front"),
    ],
  };
}

function buildKeep() {
  const map = createMap(60, 34, TILE_TYPES.STONE);
  paintRect(map, 0, 24, 60, 10, TILE_TYPES.BRICK);
  paintRect(map, 4, 4, 12, 16, TILE_TYPES.DIRT);
  paintRect(map, 18, 4, 10, 16, TILE_TYPES.STONE);
  paintRect(map, 30, 4, 12, 16, TILE_TYPES.DIRT);
  paintRect(map, 44, 4, 12, 16, TILE_TYPES.STONE);
  paintRect(map, 24, 22, 10, 3, TILE_TYPES.WOOD);
  paintRect(map, 16, 26, 7, 4, TILE_TYPES.WATER);
  paintRect(map, 36, 26, 8, 4, TILE_TYPES.WATER);
  paintRect(map, 24, 26, 10, 4, TILE_TYPES.BRIDGE);
  paintRect(map, 12, 10, 2, 8, TILE_TYPES.BRICK);
  paintRect(map, 46, 10, 2, 8, TILE_TYPES.BRICK);
  paintRect(map, 0, 0, 1, 34, TILE_TYPES.BRICK);
  paintRect(map, 59, 0, 1, 34, TILE_TYPES.BRICK);
  paintRect(map, 0, 0, 60, 1, TILE_TYPES.BRICK);
  paintRect(map, 0, 33, 60, 1, TILE_TYPES.BRICK);
  paintHLine(map, 22, 19, 16, TILE_TYPES.FLOWERS);

  return {
    name: "Ashen Keep",
    objective: "Collect the keep relics, open the war chest, and leave through the final gate.",
    timeLimit: 180,
    requiredRelics: 5,
    start: { x: 6, y: 27 },
    chest: { x: 29, y: 16 },
    door: { x: 55, y: 14 },
    map: toRows(map),
    blockers: [
      rect(5, 4, 8, 16),
      rect(18, 4, 10, 7),
      rect(18, 13, 10, 7),
      rect(31, 4, 10, 7),
      rect(31, 13, 10, 7),
      rect(45, 4, 9, 16),
      rect(21, 4, 2, 15),
      rect(37, 4, 2, 15),
      rect(26, 12, 6, 4),
      rect(52, 10, 4, 10),
    ],
    hazards: [
      rect(24, 23, 10, 1),
    ],
    npcs: [
      npc("wizard", 8, 26, "The last gate reacts to the gold key."),
      npc("elder", 12, 26, "The keep was built around the relic vault."),
    ],
    enemies: [
      enemy("goblin", 16, 22, "x", 13, 22, 2.4),
      enemy("skeleton", 34, 22, "x", 30, 40, 2.5),
      enemy("bat", 28, 18, "y", 10, 22, 2.8),
      enemy("skeleton", 50, 22, "y", 18, 27, 2.6),
    ],
    relics: [
      item("shield", 10, 8),
      item("sword", 24, 8),
      item("gemPurple", 35, 8),
      item("gemBlue", 49, 8),
      item("map", 29, 21),
    ],
    coins: [
      item("coinGold", 8, 22),
      item("coinSilver", 18, 8),
      item("coinGold", 29, 15),
      item("coinSilver", 41, 8),
      item("coinGold", 52, 21),
    ],
    bonuses: [
      item("potionGold", 13, 22, "time", 25),
      item("fire", 24, 21, "score", 80),
      item("lantern", 33, 21, "score", 80),
      item("mushroom", 45, 22, "score", 40),
      item("potionRed", 54, 21, "heal", 1),
    ],
    props: [
      prop("towerA", 4, 4, 8, 10),
      prop("towerB", 17, 4, 8, 10),
      prop("smithy", 26, 12, 8, 8),
      prop("workshop", 33, 12, 9, 8),
      prop("towerA", 44, 4, 8, 10),
      prop("towerB", 51, 10, 7, 10),
      prop("rockLarge", 22, 25, 3, 2, "front"),
      prop("rockMedium", 35, 25, 3, 2, "front"),
      prop("flowers", 29, 19, 3, 2, "front"),
      prop("fence", 24, 24, 4, 3, "front"),
      prop("fence", 30, 24, 4, 3, "front"),
    ],
  };
}

export const LEVELS = [buildVillage(), buildForest(), buildKeep()];
