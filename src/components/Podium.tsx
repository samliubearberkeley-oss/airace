import type { RacerState } from '../lib/aiRacer';
import { formatTime } from '../lib/aiRacer';
import { ModelIcon } from './ModelIcon';

type Props = {
  racers: RacerState[];
  finishOrder: string[];
};

export function Podium({ racers, finishOrder }: Props) {
  if (finishOrder.length === 0) return null;

  // Get top 3 finishers
  const getRacer = (index: number) => {
    const modelId = finishOrder[index];
    return modelId ? racers.find((r) => r.model.id === modelId) : null;
  };

  const first = getRacer(0);
  const second = getRacer(1);
  const third = getRacer(2);

  const getTotalTime = (racer: RacerState | null | undefined) => {
    if (!racer?.startTime || !racer?.endTime) return 0;
    return racer.endTime - racer.startTime;
  };

  return (
    <div className="pixel-panel p-6 md:p-8" style={{ borderColor: 'var(--nes-yellow)' }}>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl pixel-text-gradient mb-4 animate-pixel-glow">
          🏆 RACE RESULTS 🏆
        </h2>
        <p className="text-nes-light-gray mt-2 text-xs md:text-sm pixel-text">AI MAZE RACE CHAMPIONSHIP</p>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          {second && (
            <div
              className="mb-2 p-4 text-center border-3"
              style={{ 
                backgroundColor: second.model.color + '40',
                borderColor: second.model.color,
                borderWidth: '3px',
                boxShadow: '0 4px 0 var(--nes-black)',
                imageRendering: 'pixelated',
              }}
            >
              <div className="mb-2">
                <ModelIcon model={second.model} size="xl" />
              </div>
              <div className="text-nes-white pixel-text text-xs md:text-sm font-bold">{second.model.name.toUpperCase()}</div>
              <div className="text-nes-light-gray font-pixel text-xs mt-1">
                {formatTime(getTotalTime(second))}
              </div>
              <div className="text-nes-light-gray text-[10px] pixel-text">{second.moveCount} MOVES</div>
            </div>
          )}
          <div className="w-20 md:w-24 h-16 md:h-20 flex items-center justify-center border-3" style={{ backgroundColor: 'var(--nes-gray)', borderColor: 'var(--nes-white)', borderWidth: '3px', boxShadow: '0 4px 0 var(--nes-black)', imageRendering: 'pixelated' }}>
            <span className="text-3xl md:text-4xl" style={{ imageRendering: 'pixelated' }}>🥈</span>
          </div>
          <div className="text-nes-light-gray pixel-text text-xs md:text-sm font-bold mt-1">2ND</div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center -mt-6 md:-mt-8">
          {first && (
            <div
              className="mb-2 p-4 md:p-5 text-center border-3 animate-pixel-bounce"
              style={{ 
                backgroundColor: first.model.color + '50',
                borderColor: 'var(--nes-yellow)',
                borderWidth: '4px',
                boxShadow: `0 6px 0 var(--nes-black), 0 0 20px ${first.model.color}60`,
                imageRendering: 'pixelated',
              }}
            >
              <div className="mb-2">
                <ModelIcon model={first.model} size="xl" />
              </div>
              <div className="text-nes-white pixel-text text-xs md:text-sm font-bold">{first.model.name.toUpperCase()}</div>
              <div className="text-nes-yellow font-pixel font-bold text-sm md:text-lg mt-1">
                {formatTime(getTotalTime(first))}
              </div>
              <div className="text-nes-light-gray text-xs pixel-text">{first.moveCount} MOVES</div>
            </div>
          )}
          <div className="w-24 md:w-28 h-24 md:h-28 flex items-center justify-center border-4" style={{ backgroundColor: 'var(--nes-yellow)', borderColor: 'var(--nes-white)', borderWidth: '4px', boxShadow: '0 6px 0 var(--nes-black)', imageRendering: 'pixelated' }}>
            <span className="text-4xl md:text-5xl" style={{ imageRendering: 'pixelated' }}>🥇</span>
          </div>
          <div className="text-nes-yellow pixel-text text-sm md:text-xl font-black mt-1">1ST</div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          {third && (
            <div
              className="mb-2 p-4 text-center border-3"
              style={{ 
                backgroundColor: third.model.color + '30',
                borderColor: third.model.color,
                borderWidth: '3px',
                boxShadow: '0 3px 0 var(--nes-black)',
                imageRendering: 'pixelated',
              }}
            >
              <div className="mb-2">
                <ModelIcon model={third.model} size="xl" />
              </div>
              <div className="text-nes-white pixel-text text-xs md:text-sm font-bold">{third.model.name.toUpperCase()}</div>
              <div className="text-nes-light-gray font-pixel text-xs mt-1">
                {formatTime(getTotalTime(third))}
              </div>
              <div className="text-nes-light-gray text-[10px] pixel-text">{third.moveCount} MOVES</div>
            </div>
          )}
          <div className="w-20 md:w-24 h-12 md:h-16 flex items-center justify-center border-3" style={{ backgroundColor: 'var(--nes-brown)', borderColor: 'var(--nes-white)', borderWidth: '3px', boxShadow: '0 3px 0 var(--nes-black)', imageRendering: 'pixelated' }}>
            <span className="text-3xl md:text-4xl" style={{ imageRendering: 'pixelated' }}>🥉</span>
          </div>
          <div className="text-nes-brown pixel-text text-xs md:text-sm font-bold mt-1">3RD</div>
        </div>
      </div>

      {/* Full Rankings */}
      <div className="border-t-3 border-nes-gray pt-6" style={{ borderTopWidth: '3px' }}>
        <h3 className="text-xs md:text-sm pixel-text text-nes-white mb-4 text-center">📊 FULL RANKINGS</h3>
        <div className="space-y-2">
          {finishOrder.map((modelId, index) => {
            const racer = racers.find((r) => r.model.id === modelId);
            if (!racer) return null;

            const totalTime = getTotalTime(racer);
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || `#${index + 1}`;

            return (
              <div
                key={modelId}
                className="flex items-center justify-between p-3 border-3"
                style={{
                  backgroundColor: index === 0 ? 'var(--nes-yellow)' + '30' : 'var(--nes-dark-gray)',
                  borderColor: index === 0 ? 'var(--nes-yellow)' : 'var(--nes-gray)',
                  borderWidth: '3px',
                  boxShadow: '0 2px 0 var(--nes-black)',
                  imageRendering: 'pixelated',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base md:text-xl w-6 md:w-8" style={{ imageRendering: 'pixelated' }}>{medal}</span>
                  <ModelIcon model={racer.model} size="lg" />
                  <span className="text-nes-white pixel-text text-xs md:text-sm font-medium">{racer.model.name.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-nes-light-gray text-[10px] md:text-xs pixel-text">{racer.moveCount} MOVES</span>
                  <span 
                    className="font-pixel font-bold text-xs md:text-sm"
                    style={{
                      color: index === 0 ? 'var(--nes-yellow)' : 'var(--nes-light-gray)',
                    }}
                  >
                    {formatTime(totalTime)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* DNF (Did Not Finish) */}
          {racers
            .filter((r) => !finishOrder.includes(r.model.id) && r.status === 'error')
            .map((racer) => (
              <div
                key={racer.model.id}
                className="flex items-center justify-between p-3 border-3"
                style={{
                  backgroundColor: 'var(--nes-red)' + '20',
                  borderColor: 'var(--nes-red)',
                  borderWidth: '3px',
                  boxShadow: '0 2px 0 var(--nes-black)',
                  imageRendering: 'pixelated',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base md:text-xl w-6 md:w-8">❌</span>
                  <div className="opacity-50">
                    <ModelIcon model={racer.model} size="lg" />
                  </div>
                  <span className="text-nes-light-gray pixel-text text-xs md:text-sm font-medium">{racer.model.name.toUpperCase()}</span>
                </div>
                <span className="text-nes-red text-[10px] md:text-xs pixel-text">DNF - {racer.error?.toUpperCase()}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Stats */}
      {first && (
        <div className="mt-6 text-center text-nes-light-gray text-xs md:text-sm pixel-text">
          <p>
            🏆 WINNER: <span className="text-nes-white font-semibold">{first.model.name.toUpperCase()}</span> WITH{' '}
            <span className="text-nes-yellow font-pixel">{formatTime(getTotalTime(first))}</span>
          </p>
        </div>
      )}
    </div>
  );
}
