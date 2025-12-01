import { useEffect, useState } from 'react';
import { MazeCanvas } from './MazeCanvas';
import type { Maze } from '../lib/maze';
import type { RacerState } from '../lib/aiRacer';
import { formatTime } from '../lib/aiRacer';
import { ModelIcon } from './ModelIcon';

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
                className="flex items-center justify-between p-3 border-3"
                style={{ 
                  backgroundColor: racer.model.color + '30',
                  borderColor: racer.model.color,
                  borderWidth: '3px',
                  boxShadow: '0 3px 0 var(--nes-black)',
                  imageRendering: 'pixelated',
                }}
              >
                <div className="flex items-center gap-2">
                  <ModelIcon model={racer.model} size="md" />
                  <span className="pixel-text text-nes-white text-xs md:text-sm">
                    {racer.model.name.toUpperCase()}
                  </span>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  {isFinished && rank >= 0 && (
                    <span className="text-base md:text-lg" style={{ imageRendering: 'pixelated' }}>
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                    </span>
                  )}
                  <span
                    className="text-[10px] md:text-xs px-2 py-1 pixel-text border-2"
                    style={{
                      backgroundColor: isReady
                        ? 'var(--nes-yellow)'
                        : isRacing
                          ? 'var(--nes-blue)'
                          : isFinished
                            ? 'var(--nes-green)'
                            : hasError
                              ? 'var(--nes-red)'
                              : 'var(--nes-gray)',
                      color: isReady ? '#000000' : '#ffffff',
                      borderColor: '#000000',
                      boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)',
                      imageRendering: 'pixelated',
                    }}
                  >
                    {isReady
                      ? '🏁 READY'
                      : isRacing
                        ? '🏃 RUNNING!'
                        : isFinished
                          ? '✅ FINISHED'
                          : hasError
                            ? '❌ ERROR'
                            : '⏳ IDLE'}
                  </span>
                </div>
              </div>

              {/* Speed & Timer */}
              <div className="text-center space-y-1">
                {/* Think time = Speed */}
                {racer.thinkTime > 0 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-nes-light-gray text-xs pixel-text">THINK:</span>
                    <span className="text-nes-cyan font-pixel text-sm">
                      {formatTime(racer.thinkTime)}
                    </span>
                    <span 
                      className="text-[10px] px-2 py-0.5 pixel-text border-2 border-nes-white"
                      style={{
                        backgroundColor: speedPercent >= 100 
                          ? 'var(--nes-green)' 
                          : speedPercent >= 80 
                            ? 'var(--nes-yellow)'
                            : 'var(--nes-red)',
                        color: 'var(--nes-white)',
                        boxShadow: '1px 1px 0 var(--nes-black)',
                        imageRendering: 'pixelated',
                      }}
                    >
                      {speedPercent >= 100 ? '🚀 FASTEST' : `${speedPercent}% SPEED`}
                    </span>
                  </div>
                )}
                
                {/* Race timer */}
                <div 
                  className="font-pixel text-xl md:text-2xl pixel-text"
                  style={{
                    color: isFinished 
                      ? 'var(--nes-green)' 
                      : isRacing 
                        ? 'var(--nes-cyan)' 
                        : 'var(--nes-light-gray)',
                    textShadow: '2px 2px 0 var(--nes-black)',
                  }}
                >
                  ⏱️ {isReady ? '--' : formatTime(elapsedTime)}
                </div>
                <div className="text-xs text-nes-light-gray pixel-text">
                  {isReady && `${Math.max(0, racer.plannedPath.length > 0 ? racer.plannedPath.length - 1 : 0)} STEPS TO GO`}
                  {isRacing && `MOVE ${racer.moveCount}/${Math.max(0, racer.plannedPath.length > 0 ? racer.plannedPath.length - 1 : 0)}`}
                  {isFinished && `${racer.moveCount} MOVES`}
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
                <p className="text-nes-red text-xs text-center pixel-text border-2 border-nes-red p-2" style={{ backgroundColor: 'var(--nes-red)' + '20', boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.3)' }}>
                  ❌ {racer.error.toUpperCase()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
