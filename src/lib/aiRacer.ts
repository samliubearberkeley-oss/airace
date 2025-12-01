import { insforge, type AIModel } from './insforge';
import { type Maze, type Direction, getValidMoves, move } from './maze';

export type RaceStatus = 'idle' | 'ready' | 'racing' | 'finished' | 'error';

export type RacerState = {
  model: AIModel;
  position: { x: number; y: number };
  path: { x: number; y: number }[];
  plannedPath: { x: number; y: number }[];
  status: RaceStatus;
  thinkTime: number; // AI thinking time determines speed!
  startTime: number | null;
  endTime: number | null;
  moveCount: number;
  error?: string;
};

// Convert maze to a simple grid representation for AI
function mazeToGrid(maze: Maze): string {
  const lines: string[] = [];
  
  const gridHeight = maze.height * 2 + 1;
  const gridWidth = maze.width * 2 + 1;
  const grid: string[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill('█'));
  
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.cells[y][x];
      const gridY = y * 2 + 1;
      const gridX = x * 2 + 1;
      
      grid[gridY][gridX] = ' ';
      
      if (!cell.walls.top && y > 0) grid[gridY - 1][gridX] = ' ';
      if (!cell.walls.bottom && y < maze.height - 1) grid[gridY + 1][gridX] = ' ';
      if (!cell.walls.left && x > 0) grid[gridY][gridX - 1] = ' ';
      if (!cell.walls.right && x < maze.width - 1) grid[gridY][gridX + 1] = ' ';
    }
  }
  
  grid[1][1] = 'S';
  grid[maze.height * 2 - 1][maze.width * 2 - 1] = 'E';
  
  for (const row of grid) {
    lines.push(row.join(''));
  }
  
  return lines.join('\n');
}

// Use BFS to find the optimal path
function findOptimalPath(maze: Maze): { x: number; y: number }[] {
  const start = { ...maze.start };
  const end = { ...maze.end };
  
  const queue: { pos: { x: number; y: number }; path: { x: number; y: number }[] }[] = [
    { pos: start, path: [start] }
  ];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);
  
  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    
    if (pos.x === end.x && pos.y === end.y) {
      return path;
    }
    
    const validMoves = getValidMoves(maze, pos);
    for (const dir of validMoves) {
      const newPos = move(pos, dir);
      const key = `${newPos.x},${newPos.y}`;
      
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ pos: newPos, path: [...path, newPos] });
      }
    }
  }
  
  return [start];
}

// Get path from AI - returns path and thinking time
export async function planPath(
  model: AIModel,
  maze: Maze
): Promise<{ path: { x: number; y: number }[]; thinkTime: number }> {
  const gridView = mazeToGrid(maze);
  const optimalPath = findOptimalPath(maze);
  
  const prompt = `You are a maze-solving AI. Here's a maze:

${gridView}

Legend:
- █ = wall
- (space) = path
- S = start position (0,0)
- E = exit position (${maze.width - 1},${maze.height - 1})

The maze is ${maze.width}x${maze.height} cells. Find the shortest path from S to E.

Directions:
- U = up (decrease Y)
- D = down (increase Y)  
- L = left (decrease X)
- R = right (increase X)

Respond with ONLY the move sequence, like: DDRRDDRR
No explanations, just the moves.`;

  const startTime = Date.now();

  try {
    // Create a timeout promise (12 seconds max)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API timeout')), 12000);
    });
    
    const response = await Promise.race([
      insforge.ai.chat.completions.create({
        model: model.id,
        messages: [
          {
            role: 'system',
            content: 'You are a maze solver. Output only U/D/L/R moves. Nothing else.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        maxTokens: 200,
      }),
      timeoutPromise,
    ]);

    const thinkTime = Date.now() - startTime;
    console.log(`${model.name} think time: ${thinkTime}ms`);

    const content = response.choices[0]?.message?.content?.toUpperCase().trim() || '';
    
    // Parse the move sequence
    const path: { x: number; y: number }[] = [{ ...maze.start }];
    let pos = { ...maze.start };
    
    for (const char of content) {
      let dir: Direction | null = null;
      if (char === 'U') dir = 'up';
      else if (char === 'D') dir = 'down';
      else if (char === 'L') dir = 'left';
      else if (char === 'R') dir = 'right';
      
      if (dir) {
        const validMoves = getValidMoves(maze, pos);
        if (validMoves.includes(dir)) {
          pos = move(pos, dir);
          path.push({ ...pos });
          
          if (pos.x === maze.end.x && pos.y === maze.end.y) {
            return { path, thinkTime };
          }
        }
      }
    }
    
    // If AI path didn't reach the end, use optimal path
    if (pos.x !== maze.end.x || pos.y !== maze.end.y) {
      console.log(`${model.name} path incomplete, using optimal path`);
      return { path: optimalPath, thinkTime };
    }
    
    return { path, thinkTime };
  } catch (error) {
    const thinkTime = Date.now() - startTime;
    console.error(`AI error for ${model.name}:`, error);
    return { path: optimalPath, thinkTime: thinkTime + 5000 }; // Penalty for error
  }
}

// Animate a racer - speed based on think time!
export async function animateRacer(
  state: RacerState,
  onUpdate: (state: RacerState) => void,
  abortSignal?: AbortSignal
): Promise<RacerState> {
  const { plannedPath, thinkTime } = state;
  
  // Calculate speed: think time / number of steps = ms per step
  // Faster thinker = faster runner!
  const totalSteps = plannedPath.length - 1;
  const msPerStep = totalSteps > 0 ? Math.max(30, thinkTime / totalSteps) : 100;
  
  console.log(`${state.model.name}: ${totalSteps} steps, ${msPerStep.toFixed(0)}ms/step (think: ${thinkTime}ms)`);
  
  // Start racing
  state.status = 'racing';
  state.startTime = Date.now();
  onUpdate({ ...state });
  
  // Move along the planned path
  for (let i = 1; i < plannedPath.length; i++) {
    if (abortSignal?.aborted) {
      state.status = 'error';
      state.error = 'Race aborted';
      onUpdate({ ...state });
      return state;
    }
    
    state.position = { ...plannedPath[i] };
    state.path.push({ ...state.position });
    state.moveCount++;
    
    onUpdate({ ...state });
    
    // Animation speed based on think time!
    await new Promise((resolve) => setTimeout(resolve, msPerStep));
  }
  
  // Finished!
  state.status = 'finished';
  state.endTime = Date.now();
  onUpdate({ ...state });
  
  return state;
}

// Format time duration
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}
