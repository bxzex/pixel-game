function createMap(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function addGround(map, topY) {
  const width = map[0].length;
  const height = map.length;
  for (let x = 0; x < width; x += 1) {
    map[topY][x] = 2;
    for (let y = topY + 1; y < height; y += 1) {
      map[y][x] = 1;
    }
  }
}

function addPlatform(map, x, y, length, tile = 3) {
  for (let i = 0; i < length; i += 1) {
    map[y][x + i] = tile;
  }
}

function addSpikes(map, x, y, length) {
  for (let i = 0; i < length; i += 1) {
    map[y][x + i] = 4;
  }
}

function addBouncer(map, x, y) {
  map[y][x] = 5;
}

function addPit(map, x, width, topY) {
  const height = map.length;
  for (let col = x; col < x + width; col += 1) {
    for (let y = topY; y < height; y += 1) {
      map[y][col] = 0;
    }
  }
}

function toRows(map) {
  return map.map((row) => row.join(""));
}

function buildLevelOne() {
  const width = 88;
  const height = 26;
  const groundY = 21;
  const map = createMap(width, height);
  addGround(map, groundY);

  addPlatform(map, 8, 17, 8);
  addPlatform(map, 20, 14, 7);
  addPlatform(map, 31, 16, 8);
  addPlatform(map, 44, 12, 8);
  addPlatform(map, 56, 15, 9);
  addPlatform(map, 70, 11, 7);

  addSpikes(map, 38, 20, 3);
  addSpikes(map, 53, 20, 4);
  addPit(map, 61, 3, groundY);

  addBouncer(map, 27, 20);
  addBouncer(map, 66, 20);

  return {
    name: "Sunken Gate",
    objective: "Collect 3 relic shards. Optional: gather coins for score.",
    timeLimit: 95,
    requiredRelics: 3,
    start: { x: 3, y: 19 },
    portal: { x: 83, y: 19 },
    map: toRows(map),
    relics: [
      { x: 13, y: 15 },
      { x: 47, y: 10 },
      { x: 73, y: 9 },
    ],
    coins: [
      { x: 10, y: 20 },
      { x: 23, y: 13 },
      { x: 34, y: 15 },
      { x: 45, y: 20 },
      { x: 58, y: 14 },
      { x: 76, y: 10 },
    ],
    enemies: [
      { x: 18, y: 20, minX: 15, maxX: 26, speed: 2.25 },
      { x: 41, y: 20, minX: 35, maxX: 52, speed: 2.6 },
      { x: 68, y: 20, minX: 66, maxX: 80, speed: 3 },
    ],
  };
}

function buildLevelTwo() {
  const width = 94;
  const height = 26;
  const groundY = 21;
  const map = createMap(width, height);
  addGround(map, groundY);

  addPit(map, 15, 4, groundY);
  addPit(map, 36, 3, groundY);
  addPit(map, 63, 4, groundY);

  addPlatform(map, 6, 17, 6);
  addPlatform(map, 15, 15, 6);
  addPlatform(map, 24, 13, 7);
  addPlatform(map, 33, 15, 6);
  addPlatform(map, 41, 11, 8);
  addPlatform(map, 53, 14, 8);
  addPlatform(map, 65, 10, 9);
  addPlatform(map, 78, 13, 8);

  addSpikes(map, 27, 20, 3);
  addSpikes(map, 49, 20, 3);
  addSpikes(map, 73, 20, 4);

  addBouncer(map, 20, 20);
  addBouncer(map, 60, 20);
  addBouncer(map, 87, 20);

  return {
    name: "Verdigris Span",
    objective: "Collect 4 relic shards. Keep moving before time expires.",
    timeLimit: 110,
    requiredRelics: 4,
    start: { x: 2, y: 19 },
    portal: { x: 90, y: 18 },
    map: toRows(map),
    relics: [
      { x: 9, y: 15 },
      { x: 27, y: 11 },
      { x: 56, y: 12 },
      { x: 82, y: 11 },
    ],
    coins: [
      { x: 5, y: 20 },
      { x: 16, y: 14 },
      { x: 28, y: 12 },
      { x: 45, y: 10 },
      { x: 58, y: 20 },
      { x: 69, y: 9 },
      { x: 85, y: 12 },
    ],
    enemies: [
      { x: 11, y: 20, minX: 5, maxX: 14, speed: 2.9 },
      { x: 39, y: 20, minX: 32, maxX: 46, speed: 3.1 },
      { x: 62, y: 20, minX: 58, maxX: 70, speed: 2.75 },
      { x: 84, y: 20, minX: 78, maxX: 91, speed: 3.2 },
    ],
  };
}

function buildLevelThree() {
  const width = 102;
  const height = 28;
  const groundY = 23;
  const map = createMap(width, height);
  addGround(map, groundY);

  addPit(map, 10, 3, groundY);
  addPit(map, 33, 4, groundY);
  addPit(map, 56, 3, groundY);
  addPit(map, 79, 4, groundY);

  addPlatform(map, 4, 18, 6);
  addPlatform(map, 13, 15, 7);
  addPlatform(map, 24, 12, 8);
  addPlatform(map, 36, 16, 7);
  addPlatform(map, 46, 13, 8);
  addPlatform(map, 58, 10, 9);
  addPlatform(map, 71, 14, 8);
  addPlatform(map, 83, 9, 9);
  addPlatform(map, 95, 6, 5);

  addSpikes(map, 19, 22, 3);
  addSpikes(map, 43, 22, 4);
  addSpikes(map, 67, 22, 3);
  addSpikes(map, 90, 22, 4);

  addBouncer(map, 31, 22);
  addBouncer(map, 53, 22);
  addBouncer(map, 76, 22);

  return {
    name: "Obsidian Crown",
    objective: "Collect all 5 relic shards, then claim the apex portal.",
    timeLimit: 130,
    requiredRelics: 5,
    start: { x: 2, y: 21 },
    portal: { x: 98, y: 4 },
    map: toRows(map),
    relics: [
      { x: 7, y: 16 },
      { x: 27, y: 10 },
      { x: 49, y: 11 },
      { x: 74, y: 12 },
      { x: 98, y: 5 },
    ],
    coins: [
      { x: 5, y: 22 },
      { x: 17, y: 14 },
      { x: 39, y: 15 },
      { x: 60, y: 9 },
      { x: 86, y: 8 },
      { x: 97, y: 3 },
      { x: 94, y: 22 },
    ],
    enemies: [
      { x: 16, y: 22, minX: 13, maxX: 29, speed: 3.3 },
      { x: 41, y: 22, minX: 37, maxX: 50, speed: 3.5 },
      { x: 66, y: 22, minX: 60, maxX: 72, speed: 3.8 },
      { x: 88, y: 22, minX: 82, maxX: 96, speed: 4 },
    ],
  };
}

export const LEVELS = [buildLevelOne(), buildLevelTwo(), buildLevelThree()];
