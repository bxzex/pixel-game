import test from "node:test";
import assert from "node:assert/strict";
import {
  DIRECTIONS,
  createGameState,
  setDirection,
  spawnFood,
  tick,
} from "../src/gameLogic.js";

function makeRng(value) {
  return () => value;
}

test("moves one cell each tick in current direction", () => {
  const state = createGameState({ gridSize: 10, randomFn: makeRng(0) });
  const next = tick(state, makeRng(0));
  assert.deepEqual(next.snake[0], { x: state.snake[0].x + 1, y: state.snake[0].y });
});

test("cannot reverse direction directly", () => {
  const state = createGameState({ gridSize: 10, randomFn: makeRng(0) });
  const changed = setDirection(state, DIRECTIONS.LEFT);
  assert.equal(changed.queuedDirection, DIRECTIONS.RIGHT);
});

test("hits wall and ends game", () => {
  const state = {
    gridSize: 5,
    snake: [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
    direction: DIRECTIONS.RIGHT,
    queuedDirection: DIRECTIONS.RIGHT,
    food: { x: 0, y: 0 },
    score: 0,
    isGameOver: false,
    isPaused: false,
  };

  const next = tick(state, makeRng(0));
  assert.equal(next.isGameOver, true);
});

test("self collision ends game", () => {
  const state = {
    gridSize: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ],
    direction: DIRECTIONS.DOWN,
    queuedDirection: DIRECTIONS.DOWN,
    food: { x: 5, y: 5 },
    score: 0,
    isGameOver: false,
    isPaused: false,
  };

  const next = tick(state, makeRng(0));
  assert.equal(next.isGameOver, true);
});

test("eating food grows snake and increments score", () => {
  const state = {
    gridSize: 8,
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }],
    direction: DIRECTIONS.RIGHT,
    queuedDirection: DIRECTIONS.RIGHT,
    food: { x: 4, y: 3 },
    score: 0,
    isGameOver: false,
    isPaused: false,
  };

  const next = tick(state, makeRng(0));
  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.notDeepEqual(next.food, { x: 4, y: 3 });
  assert.equal(next.snake.some((segment) => segment.x === next.food.x && segment.y === next.food.y), false);
});

test("spawnFood returns null when board is full", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];

  const food = spawnFood(2, snake, makeRng(0));
  assert.equal(food, null);
});
