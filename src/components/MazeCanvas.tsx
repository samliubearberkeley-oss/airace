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

    // Clear canvas
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw path if enabled
    if (showPath && path.length > 1) {
      ctx.strokeStyle = model.color + '40';
      ctx.lineWidth = cellSize * 0.3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
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
    ctx.strokeStyle = '#e0e0e0';
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

    // Draw start marker
    const startX = maze.start.x * cellSize + cellSize / 2;
    const startY = maze.start.y * cellSize + cellSize / 2;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(startX, startY, cellSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${cellSize * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startX, startY);

    // Draw end marker
    const endX = maze.end.x * cellSize + cellSize / 2;
    const endY = maze.end.y * cellSize + cellSize / 2;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endX, endY, cellSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('E', endX, endY);

    // Draw ball
    const ballX = ballPosition.x * cellSize + cellSize / 2;
    const ballY = ballPosition.y * cellSize + cellSize / 2;

    // Glow effect
    const gradient = ctx.createRadialGradient(
      ballX,
      ballY,
      0,
      ballX,
      ballY,
      cellSize * 0.5
    );
    gradient.addColorStop(0, model.color);
    gradient.addColorStop(0.5, model.color + '80');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, cellSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Ball core
    ctx.fillStyle = model.color;
    ctx.beginPath();
    ctx.arc(ballX, ballY, cellSize * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Ball highlight
    ctx.fillStyle = '#ffffff40';
    ctx.beginPath();
    ctx.arc(
      ballX - cellSize * 0.1,
      ballY - cellSize * 0.1,
      cellSize * 0.12,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [maze, ballPosition, path, model, cellSize, showPath]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg shadow-lg"
      style={{
        boxShadow: `0 0 20px ${model.color}30`,
        border: `2px solid ${model.color}50`,
      }}
    />
  );
}

