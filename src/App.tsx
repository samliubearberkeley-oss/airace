import { useState, useCallback, useRef, useEffect } from 'react';
import { AISelector } from './components/AISelector';
import { MazeSettings } from './components/MazeSettings';
import { RaceTrack } from './components/RaceTrack';
import { Podium } from './components/Podium';
import { generateMaze, type Maze } from './lib/maze';
import { type AIModel } from './lib/insforge';
import { planPath, animateRacer, type RacerState } from './lib/aiRacer';
import { trackVisit } from './lib/analytics';

type GameState = 'setup' | 'ready' | 'racing' | 'finished';

function App() {
  // Track page visit on mount
  useEffect(() => {
    trackVisit();
  }, []);

  // Game state
  const [gameState, setGameState] = useState<GameState>('setup');
  const [maze, setMaze] = useState<Maze | null>(null);
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  const [racers, setRacers] = useState<RacerState[]>([]);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);

  // Settings
  const [mazeWidth, setMazeWidth] = useState(8);
  const [mazeHeight, setMazeHeight] = useState(8);

  // Abort controller for canceling races
  const abortControllerRef = useRef<AbortController | null>(null);

  // Toggle AI model selection
  const handleToggleModel = useCallback((model: AIModel) => {
    setSelectedModels((prev) => {
      const exists = prev.some((m) => m.id === model.id);
      if (exists) {
        return prev.filter((m) => m.id !== model.id);
      } else {
        return [...prev, model];
      }
    });
  }, []);

  // Generate new maze
  const handleGenerateMaze = useCallback(() => {
    const newMaze = generateMaze(mazeWidth, mazeHeight);
    setMaze(newMaze);
    setGameState('ready');
    setRacers([]);
    setFinishOrder([]);
  }, [mazeWidth, mazeHeight]);

  // Start the race
  const handleStartRace = useCallback(async () => {
    if (!maze || selectedModels.length < 2) return;

    setGameState('racing');
    setFinishOrder([]);

    // Initialize racers with "ready" status (preparing)
    const initialRacers: RacerState[] = selectedModels.map((model) => ({
      model,
      position: { ...maze.start },
      path: [{ ...maze.start }],
      plannedPath: [],
      status: 'ready',
      thinkTime: 0,
      startTime: null,
      endTime: null,
      moveCount: 0,
    }));
    setRacers(initialRacers);

    // Phase 1: All AIs plan their paths in parallel (hidden from user)
    console.log('🧠 All AIs planning paths...');
    const pathPromises = selectedModels.map((model) => planPath(model, maze));
    const results = await Promise.all(pathPromises);
    console.log('✅ All AIs ready!');

    // Update racers with planned paths and think times
    const readyRacers: RacerState[] = selectedModels.map((model, index) => ({
      model,
      position: { ...maze.start },
      path: [{ ...maze.start }],
      plannedPath: results[index].path,
      status: 'ready',
      thinkTime: results[index].thinkTime, // Think time determines speed!
      startTime: null,
      endTime: null,
      moveCount: 0,
    }));
    setRacers(readyRacers);

    // Create abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Track finish order
    const finishedOrder: string[] = [];

    // Phase 2: All racers start animation at the SAME time!
    console.log('🏁 Race started!');
    const racePromises = readyRacers.map(async (racer, index) => {
      const updateRacer = (state: RacerState) => {
        setRacers((prev) => {
          const newRacers = [...prev];
          newRacers[index] = state;
          return newRacers;
        });

        // Track finish order
        if (state.status === 'finished' && !finishedOrder.includes(racer.model.id)) {
          finishedOrder.push(racer.model.id);
          setFinishOrder([...finishedOrder]);
        }
      };

      return animateRacer(racer, updateRacer, signal);
    });

    await Promise.all(racePromises);
    setGameState('finished');
  }, [maze, selectedModels]);

  // Stop the race
  const handleStopRace = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setGameState('finished');
  }, []);

  // Reset everything
  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMaze(null);
    setRacers([]);
    setFinishOrder([]);
    setGameState('setup');
  }, []);

  // Re-run with same maze
  const handleRerun = useCallback(() => {
    if (!maze) return;
    setRacers([]);
    setFinishOrder([]);
    setGameState('ready');
  }, [maze]);

  const canStartRace = maze && selectedModels.length >= 2;
  const isRacing = gameState === 'racing';

  return (
    <div className="min-h-screen game-bg relative">
      {/* Retro game background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Colorful retro shapes */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-nes-cyan opacity-20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-nes-purple opacity-20" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nes-blue opacity-10" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
      </div>

      {/* Scanline overlay for CRT effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <img 
                src="/logo.svg" 
                alt="AI Maze Race Logo" 
                className="w-14 h-14 md:w-18 md:h-18 drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 0 8px rgba(135, 206, 235, 0.5))' }}
              />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl pixel-text-gradient">
              AI Maze Race
            </h1>
          </div>
          <p className="text-[#333333] text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Select multiple AI models and watch them compete in the same maze. Who will find the exit first?
          </p>
        </header>

        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Setup Section */}
          {(gameState === 'setup' || gameState === 'ready') && (
            <div className="space-y-8">
              {/* AI Selector */}
              <div className="pixel-panel p-6">
                <AISelector
                  selectedModels={selectedModels}
                  onToggle={handleToggleModel}
                  disabled={isRacing}
                />
              </div>

              {/* Maze Settings */}
              <div className="pixel-panel p-6">
                <MazeSettings
                  width={mazeWidth}
                  height={mazeHeight}
                  onWidthChange={setMazeWidth}
                  onHeightChange={setMazeHeight}
                  disabled={isRacing}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={handleGenerateMaze}
                  disabled={isRacing}
                  className="pixel-button"
                  style={{ background: isRacing ? 'var(--nes-gray)' : 'var(--nes-cyan)' }}
                >
                  {maze ? 'Regenerate' : 'Generate'} Maze
                </button>

                {canStartRace && gameState === 'ready' && (
                  <button
                    onClick={handleStartRace}
                    className="pixel-button"
                    style={{ background: 'var(--nes-green)' }}
                  >
                    Start Race
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Racing Section */}
          {(gameState === 'racing' || gameState === 'finished') && maze && (
            <div className="space-y-6">
              {/* Race Track */}
              <div className="pixel-panel p-6">
                <RaceTrack
                  maze={maze}
                  racers={racers}
                  finishOrder={finishOrder}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                {gameState === 'racing' && (
                  <button
                    onClick={handleStopRace}
                    className="pixel-button"
                    style={{ background: 'var(--nes-red)' }}
                  >
                    ⏹️ STOP RACE
                  </button>
                )}

                {gameState === 'finished' && (
                  <>
                    <button
                      onClick={handleRerun}
                      className="pixel-button"
                      style={{ background: 'var(--nes-blue)' }}
                    >
                      🔄 RACE AGAIN
                    </button>
                    <button
                      onClick={handleReset}
                      className="pixel-button"
                      style={{ background: 'var(--nes-gray)' }}
                    >
                      🏠 BACK TO SETUP
                    </button>
                  </>
                )}
              </div>

              {/* Podium - Show after race finished */}
              {gameState === 'finished' && finishOrder.length > 0 && (
                <Podium racers={racers} finishOrder={finishOrder} />
              )}
            </div>
          )}

          {/* Preview maze before race */}
          {gameState === 'ready' && maze && racers.length === 0 && (
            <div className="pixel-panel p-6">
              <h3 className="text-sm md:text-base pixel-text text-nes-white mb-4 text-center">
                📍 MAZE PREVIEW
              </h3>
              <div className="flex justify-center">
                <canvas
                  ref={(canvas) => {
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    const cellSize = 28;
                    const width = maze.width * cellSize;
                    const height = maze.height * cellSize;

                    canvas.width = width;
                    canvas.height = height;

                    // Pixel art rendering
                    ctx.imageSmoothingEnabled = false;

                    // Background
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, width, height);

                    // Grid
                    ctx.strokeStyle = '#212121';
                    ctx.lineWidth = 1;
                    for (let y = 0; y < maze.height; y++) {
                      for (let x = 0; x < maze.width; x++) {
                        ctx.strokeRect(
                          x * cellSize,
                          y * cellSize,
                          cellSize,
                          cellSize
                        );
                      }
                    }

                    // Walls
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

                    // Start
                    ctx.fillStyle = '#4caf50';
                    ctx.fillRect(
                      maze.start.x * cellSize + 2,
                      maze.start.y * cellSize + 2,
                      cellSize - 4,
                      cellSize - 4
                    );
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold ${cellSize * 0.4}px 'Press Start 2P'`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                      'S',
                      maze.start.x * cellSize + cellSize / 2,
                      maze.start.y * cellSize + cellSize / 2
                    );

                    // End
                    ctx.fillStyle = '#e91e63';
                    ctx.fillRect(
                      maze.end.x * cellSize + 2,
                      maze.end.y * cellSize + 2,
                      cellSize - 4,
                      cellSize - 4
                    );
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(
                      'E',
                      maze.end.x * cellSize + cellSize / 2,
                      maze.end.y * cellSize + cellSize / 2
                    );
                  }}
                  className="border-3 border-nes-white"
                  style={{ borderWidth: '3px', imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-[#666666] text-sm font-normal">
          <p>
            Powered by{' '}
            <a 
              href="https://insforge.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#000000] font-semibold hover:underline"
            >
              InsForge
            </a>
            {' • '}
            Made by{' '}
            <a 
              href="https://x.com/real_SamLiu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#000000] font-semibold hover:underline"
            >
              Sam Liu
            </a>
          </p>
          <p className="mt-2 text-xs text-[#666666]">
            Grok 4 • Gemini 2.5 Pro • Claude Sonnet 4.5 • GPT-5 • GPT-4o
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
