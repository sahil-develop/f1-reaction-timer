'use client';

interface ResultsProps {
  targetTime: number;
  actualTime: number;
  visible: boolean;
}

function formatMs(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}

export function Results({ targetTime, actualTime, visible }: ResultsProps) {
  if (!visible) return null;

  const diff = actualTime - targetTime;
  const absDiff = Math.abs(diff);
  const isEarly = diff < 0;
  const isExact = absDiff < 1;

  const diffColor = isExact
    ? 'text-yellow-400'
    : absDiff < 20
    ? 'text-green-400'
    : absDiff < 50
    ? 'text-yellow-500'
    : 'text-red-400';

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase text-center">
          Result
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {/* Target */}
          <div className="flex flex-col items-center gap-1 bg-[#0d0d0d] rounded-xl p-3 border border-[#1e1e1e]">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">Target</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-zinc-300">
              {formatMs(targetTime)}
            </span>
          </div>

          {/* Actual */}
          <div className="flex flex-col items-center gap-1 bg-[#0d0d0d] rounded-xl p-3 border border-[#1e1e1e]">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">Actual</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-white">
              {formatMs(actualTime)}
            </span>
          </div>

          {/* Difference */}
          <div className="flex flex-col items-center gap-1 bg-[#0d0d0d] rounded-xl p-3 border border-[#1e1e1e]">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">Diff</span>
            <span className={`text-lg sm:text-xl font-bold font-mono ${diffColor}`}>
              {isExact ? '±0.0 ms' : `${isEarly ? '-' : '+'}${formatMs(absDiff)}`}
            </span>
          </div>
        </div>

        {/* Rating bar */}
        <div className="text-center">
          {isExact ? (
            <p className="text-yellow-400 font-bold tracking-widest text-sm">PERFECT TIMING!</p>
          ) : absDiff < 10 ? (
            <p className="text-green-400 font-semibold text-sm">Outstanding reaction!</p>
          ) : absDiff < 30 ? (
            <p className="text-green-500 text-sm">Great timing!</p>
          ) : absDiff < 60 ? (
            <p className="text-yellow-500 text-sm">Good — keep practicing.</p>
          ) : (
            <p className="text-red-400 text-sm">
              {isEarly ? 'Too early' : 'Too late'} — try again!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
