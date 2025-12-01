import { useEffect, useState } from 'react';
import { MazeCanvas } from './MazeCanvas';
import type { Maze } from '../lib/maze';
import type { RacerState } from '../lib/aiRacer';
import { formatTime } from '../lib/aiRacer';

type Props = {
  maze: Maze;
  racers: RacerState[];
  finishOrder: string[];
};

export function RaceTrack({ maze, racers, finishOrder }: Props) {
  const [now, setNow] = useState(Date.now());

  // Update timer every 50ms for real-time display
  useEffect(() => {
    const hasActiveRacer = racers.some((r) => r.status === 'racing');
    
    if (hasActiveRacer) {
      const interval = setInterval(() => setNow(Date.now()), 50);
      return () => clearInterval(interval);
    }
  }, [racers]);

  // Calculate cell size based on number of racers
  const getCellSize = () => {
    if (racers.length <= 2) return 28;
    if (racers.length <= 3) return 24;
    return 20;
  };

  const cellSize = getCellSize();

  // Find fastest think time for comparison
  const fastestThinkTime = Math.min(...racers.map(r => r.thinkTime || Infinity));

  return (
    <div className="space-y-6">
      {/* Race tracks */}
      <div
        className={`grid gap-6 ${
          racers.length === 1
            ? 'grid-cols-1'
            : racers.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : racers.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : racers.length === 4
                  ? 'grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-2 lg:grid-cols-5'
        }`}
      >
        {racers.map((racer) => {
          const rank = finishOrder.indexOf(racer.model.id);
          const isFinished = racer.status === 'finished';
          const hasError = racer.status === 'error';
          const isRacing = racer.status === 'racing';
          const isReady = racer.status === 'ready';
          
          // Calculate real-time elapsed time
          const elapsedTime = racer.startTime
            ? (racer.endTime || now) - racer.startTime
            : 0;

          // Speed indicator (faster think = faster run)
          const speedRatio = fastestThinkTime > 0 && racer.thinkTime > 0
            ? fastestThinkTime / racer.thinkTime
            : 1;
          const speedPercent = Math.round(speedRatio * 100);

          return (
            <div key={racer.model.id} className="space-y-3">
              {/* Header */}
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: racer.model.color + '20' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{racer.model.emoji}</span>
                  <span className="font-semibold text-white text-sm">
                    {racer.model.name}
                  </span>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  {isFinished && rank >= 0 && (
                    <span className="text-lg">
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isReady
                        ? 'bg-yellow-500/30 text-yellow-300'
                        : isRacing
                          ? 'bg-blue-500/30 text-blue-300 animate-pulse'
                          : isFinished
                            ? 'bg-green-500/30 text-green-300'
                            : hasError
                              ? 'bg-red-500/30 text-red-300'
                              : 'bg-gray-500/30 text-gray-300'
                    }`}
                  >
                    {isReady
                      ? '🏁 Ready'
                      : isRacing
                        ? '🏃 Running!'
                        : isFinished
                          ? '✅ Finished'
                          : hasError
                            ? '❌ Error'
                            : '⏳ Idle'}
                  </span>
                </div>
              </div>

              {/* Speed & Timer */}
              <div className="text-center space-y-1">
                {/* Think time = Speed */}
                {racer.thinkTime > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-400 text-xs">Think:</span>
                    <span className="text-cyan-400 font-mono text-sm">
                      {formatTime(racer.thinkTime)}
                    </span>
                    <span 
                      className={`text-xs px-2 py-0.5 rounded ${
                        speedPercent >= 100 
                          ? 'bg-green-500/30 text-green-300' 
                          : speedPercent >= 80 
                            ? 'bg-yellow-500/30 text-yellow-300'
                            : 'bg-red-500/30 text-red-300'
                      }`}
                    >
                      {speedPercent >= 100 ? '🚀 Fastest' : `${speedPercent}% speed`}
                    </span>
                  </div>
                )}
                
                {/* Race timer */}
                <div 
                  className={`font-mono text-2xl font-bold ${
                    isFinished 
                      ? 'text-green-400' 
                      : isRacing 
                        ? 'text-cyan-400' 
                        : 'text-gray-400'
                  }`}
                >
                  ⏱️ {isReady ? '--' : formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-gray-400">
                  {isReady && `${racer.plannedPath.length - 1} steps to go`}
                  {isRacing && `Move ${racer.moveCount}/${racer.plannedPath.length - 1}`}
                  {isFinished && `${racer.moveCount} moves`}
                </div>
              </div>

              {/* Maze */}
              <div className="flex justify-center">
                <MazeCanvas
                  maze={maze}
                  ballPosition={racer.position}
                  path={racer.path}
                  model={racer.model}
                  cellSize={cellSize}
                  showPath={true}
                />
              </div>

              {/* Error message */}
              {hasError && racer.error && (
                <p className="text-red-400 text-xs text-center bg-red-500/10 rounded-lg p-2">
                  {racer.error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
