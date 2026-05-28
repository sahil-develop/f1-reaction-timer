'use client';

import type { Attempt, Stats } from '@/types';

interface LeaderboardProps {
  attempts: Attempt[];
  stats: Stats | null;
  onClear: () => void;
}

function formatMs(ms: number, decimals = 1): string {
  return `${ms.toFixed(decimals)} ms`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function Leaderboard({ attempts, stats, onClear }: LeaderboardProps) {
  if (attempts.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {/* Stats Summary */}
      {stats && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-4 sm:p-5">
          <h2 className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase text-center mb-4">
            Session Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">Best</span>
              <span className="text-base font-bold font-mono text-yellow-400">{formatMs(stats.best)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">Avg</span>
              <span className="text-base font-bold font-mono text-zinc-300">{formatMs(stats.average)}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">Worst</span>
              <span className="text-base font-bold font-mono text-red-400">{formatMs(stats.worst)}</span>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
          <h2 className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase">
            History ({attempts.length})
          </h2>
          <button
            onClick={onClear}
            className="text-xs text-zinc-600 hover:text-red-400 transition-colors font-mono tracking-wider cursor-pointer"
          >
            CLEAR
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase border-b border-[#1a1a1a]">
                <th className="text-left px-4 py-2">#</th>
                <th className="text-right px-3 py-2">Target</th>
                <th className="text-right px-3 py-2">Actual</th>
                <th className="text-right px-3 py-2">Diff</th>
                <th className="text-right px-4 py-2 hidden sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt, index) => {
                const diff = attempt.actualTime - attempt.targetTime;
                const absDiff = Math.abs(diff);
                const diffColor =
                  absDiff < 1
                    ? 'text-yellow-400'
                    : absDiff < 20
                    ? 'text-green-400'
                    : absDiff < 50
                    ? 'text-yellow-500'
                    : 'text-red-400';
                const isBest = stats && attempt.actualTime === stats.best;

                return (
                  <tr
                    key={attempt.id}
                    className={`
                      border-b border-[#141414] last:border-0
                      ${isBest ? 'bg-yellow-400/5' : 'hover:bg-white/2'}
                      transition-colors
                    `}
                  >
                    <td className="px-4 py-2.5 font-mono text-zinc-500">
                      {attempts.length - index}
                      {isBest && (
                        <span className="ml-1 text-yellow-400 text-[10px]">★</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-zinc-400 text-right">
                      {formatMs(attempt.targetTime)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-white font-semibold text-right">
                      {formatMs(attempt.actualTime)}
                    </td>
                    <td className={`px-3 py-2.5 font-mono font-semibold text-right ${diffColor}`}>
                      {absDiff < 1
                        ? '±0.0'
                        : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-zinc-600 text-right text-xs hidden sm:table-cell">
                      {formatTime(attempt.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
