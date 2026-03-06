export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function isOppositeDirection(current, next) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

export function createGameState(options = {}) {
  const gridSize = options.gridSize ?? 20;
  const startX = Math.floor(gridSize / 2);
  const startY = Math.floor(gridSize / 2);
  const snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];

  const food = spawnFood(gridSize, snake, options.randomFn);

  return {
    gridSize,
    snake,
    direction: DIRECTIONS.RIGHT,
    queuedDirection: DIRECTIONS.RIGHT,
    food,
    score: 0,
    isGameOver: false,
    isPaused: false,
  };
}

export function setDirection(state, nextDirection) {
  if (!nextDirection || state.isGameOver) {
    return state;
  }

  if (isOppositeDirection(state.direction, nextDirection)) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection,
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

export function tick(state, randomFn = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = state.queuedDirection;
  const head = state.snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  const ateFood = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (hitWall || hitSelf) {
    return {
      ...state,
      isGameOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) {
    nextSnake.pop();
  }

  const nextFood = ateFood ? spawnFood(state.gridSize, nextSnake, randomFn) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: state.score + (ateFood ? 1 : 0),
    isGameOver: ateFood && !nextFood ? true : state.isGameOver,
  };
}

export function spawnFood(gridSize, snake, randomFn = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * freeCells.length);
  return freeCells[index];
}
