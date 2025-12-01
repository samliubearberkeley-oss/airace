import { useRef, useEffect } from 'react';
import type { Maze } from '../lib/maze';
import type { AIModel } from '../lib/insforge';

type Props = {
  maze: Maze;
  ballPosition: { x: number; y: number };
  path: { x: number; y: number }[];
  model: AIModel;
  cellSize?: number;
  showPath?: boolean;
};

export function MazeCanvas({
  maze,
  ballPosition,
  path,
  model,
  cellSize = 32,
  showPath = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = maze.width * cellSize;
    const height = maze.height * cellSize;

    canvas.width = width;
    canvas.height = height;

    // Pixel art rendering - disable smoothing
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1;
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw path if enabled
    if (showPath && path.length > 1) {
      ctx.strokeStyle = model.color + '60';
      ctx.lineWidth = Math.max(2, cellSize * 0.25);
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      ctx.beginPath();
      ctx.moveTo(
        path[0].x * cellSize + cellSize / 2,
        path[0].y * cellSize + cellSize / 2
      );
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(
          path[i].x * cellSize + cellSize / 2,
          path[i].y * cellSize + cellSize / 2
        );
      }
      ctx.stroke();
    }

    // Draw walls
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const cell = maze.cells[y][x];
        const px = x * cellSize;
        const py = y * cellSize;

        if (cell.walls.top) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellSize, py);
          ctx.stroke();
        }
        if (cell.walls.right) {
          ctx.beginPath();
          ctx.moveTo(px + cellSize, py);
          ctx.lineTo(px + cellSize, py + cellSize);
          ctx.stroke();
        }
        if (cell.walls.bottom) {
          ctx.beginPath();
          ctx.moveTo(px, py + cellSize);
          ctx.lineTo(px + cellSize, py + cellSize);
          ctx.stroke();
        }
        if (cell.walls.left) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + cellSize);
          ctx.stroke();
        }
      }
    }

    // Draw start marker (pixelated square)
    const startX = maze.start.x * cellSize;
    const startY = maze.start.y * cellSize;
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(startX + 2, startY + 2, cellSize - 4, cellSize - 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${cellSize * 0.4}px 'Press Start 2P'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startX + cellSize / 2, startY + cellSize / 2);

    // Draw end marker (pixelated square)
    const endX = maze.end.x * cellSize;
    const endY = maze.end.y * cellSize;
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(endX + 2, endY + 2, cellSize - 4, cellSize - 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('E', endX + cellSize / 2, endY + cellSize / 2);

    // Draw ball (pixelated square)
    const ballX = ballPosition.x * cellSize + cellSize / 2;
    const ballY = ballPosition.y * cellSize + cellSize / 2;
    const ballSize = Math.floor(cellSize * 0.4);

    // Ball shadow
    ctx.fillStyle = '#00000080';
    ctx.fillRect(
      Math.floor(ballX - ballSize / 2) + 2,
      Math.floor(ballY - ballSize / 2) + 2,
      ballSize,
      ballSize
    );

    // Ball core (pixelated)
    ctx.fillStyle = model.color;
    ctx.fillRect(
      Math.floor(ballX - ballSize / 2),
      Math.floor(ballY - ballSize / 2),
      ballSize,
      ballSize
    );

    // Ball highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      Math.floor(ballX - ballSize / 2) + 2,
      Math.floor(ballY - ballSize / 2) + 2,
      Math.floor(ballSize / 3),
      Math.floor(ballSize / 3)
    );
  }, [maze, ballPosition, path, model, cellSize, showPath]);

  return (
    <canvas
      ref={canvasRef}
      className="border-3"
      style={{
        borderColor: model.color,
        borderWidth: '3px',
        boxShadow: `0 4px 0 var(--nes-black), 0 0 10px ${model.color}40`,
        imageRendering: 'pixelated',
      }}
    />
  );
}

