import { useState, useCallback, useRef } from 'react';
import { AISelector } from './components/AISelector';
import { MazeSettings } from './components/MazeSettings';
import { RaceTrack } from './components/RaceTrack';
import { AITestPanel } from './components/AITestPanel';
import { Podium } from './components/Podium';
import { generateMaze, type Maze } from './lib/maze';
import { type AIModel } from './lib/insforge';
import { planPath, animateRacer, type RacerState } from './lib/aiRacer';

type GameState = 'setup' | 'ready' | 'racing' | 'finished' | 'test';

function App() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
            🧩 AI Maze Race
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select multiple AI models and watch them compete in the same maze. Who will find the exit first?
          </p>
        </header>

        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Setup Section */}
          {(gameState === 'setup' || gameState === 'ready') && (
            <div className="space-y-8">
              {/* AI Selector */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <AISelector
                  selectedModels={selectedModels}
                  onToggle={handleToggleModel}
                  disabled={isRacing}
                />
              </div>

              {/* Maze Settings */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
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
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  🎲 {maze ? 'Regenerate Maze' : 'Generate Maze'}
                </button>

                {canStartRace && gameState === 'ready' && (
                  <button
                    onClick={handleStartRace}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:shadow-green-500/40"
                  >
                    🏁 Start Race!
                  </button>
                )}

                <button
                  onClick={() => setGameState('test')}
                  className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  🔌 Test AI APIs
                </button>
              </div>
            </div>
          )}

          {/* Test Panel */}
          {gameState === 'test' && (
            <div className="space-y-6">
              <AITestPanel />
              <div className="flex justify-center">
                <button
                  onClick={() => setGameState('setup')}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  ← Back to Setup
                </button>
              </div>
            </div>
          )}

          {/* Racing Section */}
          {(gameState === 'racing' || gameState === 'finished') && maze && (
            <div className="space-y-6">
              {/* Race Track */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
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
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
                  >
                    ⏹️ Stop Race
                  </button>
                )}

                {gameState === 'finished' && (
                  <>
                    <button
                      onClick={handleRerun}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                    >
                      🔄 Race Again
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      🏠 Back to Setup
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
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                📍 Maze Preview
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

                    // Background
                    ctx.fillStyle = '#0f0f0f';
                    ctx.fillRect(0, 0, width, height);

                    // Grid
                    ctx.strokeStyle = '#1a1a2e';
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

                    // Start
                    ctx.fillStyle = '#22c55e';
                    ctx.beginPath();
                    ctx.arc(
                      maze.start.x * cellSize + cellSize / 2,
                      maze.start.y * cellSize + cellSize / 2,
                      cellSize * 0.3,
                      0,
                      Math.PI * 2
                    );
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = `bold ${cellSize * 0.35}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                      'S',
                      maze.start.x * cellSize + cellSize / 2,
                      maze.start.y * cellSize + cellSize / 2
                    );

                    // End
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.arc(
                      maze.end.x * cellSize + cellSize / 2,
                      maze.end.y * cellSize + cellSize / 2,
                      cellSize * 0.3,
                      0,
                      Math.PI * 2
                    );
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.fillText(
                      'E',
                      maze.end.x * cellSize + cellSize / 2,
                      maze.end.y * cellSize + cellSize / 2
                    );
                  }}
                  className="rounded-lg shadow-lg border-2 border-slate-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Powered by{' '}
            <span className="text-cyan-400 font-semibold">InsForge</span> AI
            Gateway
          </p>
          <p className="mt-1 text-xs">
            Grok 4 • Gemini 2.5 Pro • Claude Sonnet 4.5 • GPT-5 • GPT-4o
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
