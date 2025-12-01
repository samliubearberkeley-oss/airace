import type { RacerState } from '../lib/aiRacer';
import { formatTime } from '../lib/aiRacer';

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
    <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-2xl p-8 border border-amber-500/30 shadow-2xl">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400">
          🏆 Race Results 🏆
        </h2>
        <p className="text-gray-400 mt-2">AI Maze Race Championship</p>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          {second && (
            <div
              className="mb-2 p-4 rounded-xl text-center transition-all hover:scale-105"
              style={{ backgroundColor: second.model.color + '30' }}
            >
              <div className="text-4xl mb-2">{second.model.emoji}</div>
              <div className="text-white font-bold text-sm">{second.model.name}</div>
              <div className="text-gray-300 text-xs mt-1">
                {formatTime(getTotalTime(second))}
              </div>
              <div className="text-gray-400 text-xs">{second.moveCount} moves</div>
            </div>
          )}
          <div className="w-24 h-20 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-center justify-center shadow-lg">
            <span className="text-4xl">🥈</span>
          </div>
          <div className="text-gray-300 font-bold mt-1">2nd</div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center -mt-8">
          {first && (
            <div
              className="mb-2 p-5 rounded-xl text-center transition-all hover:scale-105 ring-2 ring-amber-400/50"
              style={{ 
                backgroundColor: first.model.color + '40',
                boxShadow: `0 0 30px ${first.model.color}40`
              }}
            >
              <div className="text-5xl mb-2 animate-bounce">{first.model.emoji}</div>
              <div className="text-white font-bold">{first.model.name}</div>
              <div className="text-amber-300 font-mono font-bold text-lg mt-1">
                {formatTime(getTotalTime(first))}
              </div>
              <div className="text-gray-300 text-sm">{first.moveCount} moves</div>
            </div>
          )}
          <div className="w-28 h-28 bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t-lg flex items-center justify-center shadow-xl">
            <span className="text-5xl">🥇</span>
          </div>
          <div className="text-amber-400 font-black text-xl mt-1">1st</div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          {third && (
            <div
              className="mb-2 p-4 rounded-xl text-center transition-all hover:scale-105"
              style={{ backgroundColor: third.model.color + '30' }}
            >
              <div className="text-4xl mb-2">{third.model.emoji}</div>
              <div className="text-white font-bold text-sm">{third.model.name}</div>
              <div className="text-gray-300 text-xs mt-1">
                {formatTime(getTotalTime(third))}
              </div>
              <div className="text-gray-400 text-xs">{third.moveCount} moves</div>
            </div>
          )}
          <div className="w-24 h-16 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg flex items-center justify-center shadow-lg">
            <span className="text-4xl">🥉</span>
          </div>
          <div className="text-amber-600 font-bold mt-1">3rd</div>
        </div>
      </div>

      {/* Full Rankings */}
      <div className="border-t border-slate-600/50 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">📊 Full Rankings</h3>
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
                className={`flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.02] ${
                  index === 0 
                    ? 'bg-amber-500/20 border border-amber-500/30' 
                    : 'bg-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8">{medal}</span>
                  <span className="text-2xl">{racer.model.emoji}</span>
                  <span className="text-white font-medium">{racer.model.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">{racer.moveCount} moves</span>
                  <span 
                    className={`font-mono font-bold ${
                      index === 0 ? 'text-amber-400 text-lg' : 'text-gray-300'
                    }`}
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
                className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 border border-red-500/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8">❌</span>
                  <span className="text-2xl opacity-50">{racer.model.emoji}</span>
                  <span className="text-gray-400 font-medium">{racer.model.name}</span>
                </div>
                <span className="text-red-400 text-sm">DNF - {racer.error}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Stats */}
      {first && (
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>
            🏆 Winner: <span className="text-white font-semibold">{first.model.name}</span> with{' '}
            <span className="text-amber-400 font-mono">{formatTime(getTotalTime(first))}</span>
          </p>
        </div>
      )}
    </div>
  );
}
