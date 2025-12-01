// Maze generation using Depth-First Search (DFS) algorithm
// Each cell can have walls on 4 sides: top, right, bottom, left

export type Cell = {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
};

export type Maze = {
  width: number;
  height: number;
  cells: Cell[][];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type Direction = 'up' | 'down' | 'left' | 'right';

// Initialize a grid with all walls
function createGrid(width: number, height: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      };
    }
  }
  return grid;
}

// Get unvisited neighbors
function getUnvisitedNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;
  const height = grid.length;
  const width = grid[0].length;

  if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]); // top
  if (x < width - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]); // right
  if (y < height - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]); // bottom
  if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]); // left

  return neighbors;
}

// Remove wall between two adjacent cells
function removeWalls(current: Cell, next: Cell) {
  const dx = next.x - current.x;
  const dy = next.y - current.y;

  if (dx === 1) {
    current.walls.right = false;
    next.walls.left = false;
  } else if (dx === -1) {
    current.walls.left = false;
    next.walls.right = false;
  } else if (dy === 1) {
    current.walls.bottom = false;
    next.walls.top = false;
  } else if (dy === -1) {
    current.walls.top = false;
    next.walls.bottom = false;
  }
}

// Generate maze using DFS
export function generateMaze(width: number, height: number): Maze {
  const grid = createGrid(width, height);
  const stack: Cell[] = [];

  // Start from top-left corner
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid);

    if (neighbors.length > 0) {
      // Pick a random unvisited neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      // Backtrack
      stack.pop();
    }
  }

  // Reset visited flags
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y][x].visited = false;
    }
  }

  return {
    width,
    height,
    cells: grid,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 },
  };
}

// Get valid moves from a position
export function getValidMoves(
  maze: Maze,
  position: { x: number; y: number }
): Direction[] {
  const cell = maze.cells[position.y][position.x];
  const moves: Direction[] = [];

  if (!cell.walls.top && position.y > 0) moves.push('up');
  if (!cell.walls.right && position.x < maze.width - 1) moves.push('right');
  if (!cell.walls.bottom && position.y < maze.height - 1) moves.push('down');
  if (!cell.walls.left && position.x > 0) moves.push('left');

  return moves;
}

// Move in a direction
export function move(
  position: { x: number; y: number },
  direction: Direction
): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: position.x, y: position.y - 1 };
    case 'down':
      return { x: position.x, y: position.y + 1 };
    case 'left':
      return { x: position.x - 1, y: position.y };
    case 'right':
      return { x: position.x + 1, y: position.y };
  }
}

// Convert maze to ASCII for AI
export function mazeToASCII(
  maze: Maze,
  ballPosition: { x: number; y: number }
): string {
  const lines: string[] = [];

  // Top border
  let topBorder = '┌';
  for (let x = 0; x < maze.width; x++) {
    topBorder += '───' + (x < maze.width - 1 ? '┬' : '┐');
  }
  lines.push(topBorder);

  for (let y = 0; y < maze.height; y++) {
    // Cell row
    let cellRow = '│';
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.cells[y][x];
      let content = '   ';

      if (ballPosition.x === x && ballPosition.y === y) {
        content = ' ● ';
      } else if (maze.start.x === x && maze.start.y === y) {
        content = ' S ';
      } else if (maze.end.x === x && maze.end.y === y) {
        content = ' E ';
      }

      cellRow += content;
      cellRow += cell.walls.right ? '│' : ' ';
    }
    lines.push(cellRow);

    // Bottom walls
    if (y < maze.height - 1) {
      let bottomRow = '├';
      for (let x = 0; x < maze.width; x++) {
        const cell = maze.cells[y][x];
        bottomRow += cell.walls.bottom ? '───' : '   ';
        bottomRow += x < maze.width - 1 ? '┼' : '┤';
      }
      lines.push(bottomRow);
    }
  }

  // Bottom border
  let bottomBorder = '└';
  for (let x = 0; x < maze.width; x++) {
    bottomBorder += '───' + (x < maze.width - 1 ? '┴' : '┘');
  }
  lines.push(bottomBorder);

  return lines.join('\n');
}

// Serialize maze for sharing (same maze across all racers)
export function serializeMaze(maze: Maze): string {
  return JSON.stringify(maze);
}

// Deserialize maze
export function deserializeMaze(data: string): Maze {
  return JSON.parse(data);
}

