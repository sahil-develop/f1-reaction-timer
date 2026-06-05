'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '@/lib/sounds';

type Phase = 'idle' | 'red' | 'green' | 'false-start' | 'finished';

interface Round {
  ms: number | null; // null = false start
}

const TOTAL_ROUNDS = 10;
const RED_MIN = 1500;
const RED_MAX = 4500;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function rating(ms: number) {
  if (ms < 150) return { label: 'Insane', color: 'text-purple-400' };
  if (ms < 200) return { label: 'Elite', color: 'text-blue-400' };
  if (ms < 260) return { label: 'Great', color: 'text-green-400' };
  if (ms < 350) return { label: 'Good', color: 'text-yellow-400' };
  return { label: 'Slow', color: 'text-red-400' };
}

export default function RedGreenLightPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  const phaseRef = useRef<Phase>('idle');
  const roundRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const greenStartRef = useRef<number>(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundRef.current = round; }, [round]);

  const clearAll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const beginRed = useCallback((roundNum: number) => {
    setRound(roundNum);
    setPhase('red');
    timerRef.current = setTimeout(() => {
      greenStartRef.current = performance.now();
      setElapsedMs(0);
      soundManager.playGreenGo();
      setPhase('green');

      const tick = () => {
        setElapsedMs(performance.now() - greenStartRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, rand(RED_MIN, RED_MAX));
  }, []);

  const nextRound = useCallback((fromRound: number) => {
    if (fromRound >= TOTAL_ROUNDS) {
      setPhase('finished');
    } else {
      beginRed(fromRound + 1);
    }
  }, [beginRed]);

  const handlePress = useCallback(() => {
    const p = phaseRef.current;
    const r = roundRef.current;

    if (p === 'idle' || p === 'finished') {
      clearAll();
      setRounds([]);
      beginRed(1);
      return;
    }

    if (p === 'false-start') return; // ignore rapid taps during penalty

    if (p === 'red') {
      clearAll();
      soundManager.playCaught();
      setRounds(prev => [...prev, { ms: null }]);
      setPhase('false-start');
      timerRef.current = setTimeout(() => nextRound(r), 900);
      return;
    }

    if (p === 'green') {
      const rt = performance.now() - greenStartRef.current;
      clearAll();
      soundManager.playRedStop();
      setElapsedMs(rt);
      setRounds(prev => [...prev, { ms: rt }]);
      nextRound(r);
    }
  }, [clearAll, beginRed, nextRound]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handlePress();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePress]);

  useEffect(() => () => clearAll(), [clearAll]);

  const isIdle = phase === 'idle';
  const isRed = phase === 'red';
  const isGreen = phase === 'green';
  const isFalse = phase === 'false-start';
  const isFinished = phase === 'finished';

  const validTimes = rounds.filter((r): r is { ms: number } => r.ms !== null).map(r => r.ms);
  const falseStarts = rounds.filter(r => r.ms === null).length;
  const avg = validTimes.length ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;
  const best = validTimes.length ? Math.min(...validTimes) : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <span className="text-red-500">RED</span> / <span className="text-green-500">GREEN</span> LIGHT
          </h1>
          <p className="text-xs text-zinc-600 font-mono tracking-widest uppercase mt-1">
            Press when GREEN — not when RED
          </p>
        </div>

        {/* Round dots */}
        {!isIdle && (
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
              const r = rounds[i];
              const done = i < rounds.length;
              const active = i === round - 1 && !done;
              return (
                <div
                  key={i}
                  title={done && r.ms !== null ? `${r.ms.toFixed(0)}ms` : done ? 'False start' : ''}
                  className={`w-6 h-6 rounded-full border text-[8px] font-mono flex items-center justify-center transition-all ${
                    done
                      ? r.ms === null
                        ? 'bg-red-500/30 border-red-500/60 text-red-400'
                        : 'bg-green-500/20 border-green-500/50 text-green-400'
                      : active
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-transparent border-zinc-800 text-zinc-700'
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Light — tap to interact */}
        <div
          className="flex flex-col items-center justify-center gap-6 min-h-[300px] rounded-2xl border cursor-pointer select-none active:scale-[0.99] transition-all duration-150 p-8"
          style={{
            background: isGreen
              ? 'rgba(34,197,94,0.1)'
              : isRed || isFalse
              ? 'rgba(239,68,68,0.08)'
              : '#111',
            borderColor: isGreen
              ? 'rgba(34,197,94,0.4)'
              : isRed || isFalse
              ? 'rgba(239,68,68,0.35)'
              : '#2a2a2a',
          }}
          onClick={handlePress}
        >
          {/* Big circle */}
          <div
            className="w-32 h-32 rounded-full border-4 transition-all duration-150 flex items-center justify-center"
            style={{
              background: isGreen
                ? 'rgba(34,197,94,0.9)'
                : isRed || isFalse
                ? 'rgba(239,68,68,0.9)'
                : '#1a1a1a',
              borderColor: isGreen
                ? '#22c55e'
                : isRed || isFalse
                ? '#ef4444'
                : '#333',
              boxShadow: isGreen
                ? '0 0 60px rgba(34,197,94,0.5)'
                : isRed || isFalse
                ? '0 0 60px rgba(239,68,68,0.4)'
                : 'none',
            }}
          />

          {/* Label */}
          {isIdle && (
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-zinc-400">START</p>
              <p className="text-sm text-zinc-600 font-mono">{TOTAL_ROUNDS} rounds — tap or press Space</p>
            </div>
          )}

          {isRed && (
            <div className="text-center space-y-1">
              <p className="text-4xl font-black text-red-400">WAIT</p>
              <p className="text-xs text-zinc-500 font-mono">Round {round}/{TOTAL_ROUNDS}</p>
            </div>
          )}

          {isGreen && (
            <div className="text-center space-y-1">
              <p className="text-4xl font-black text-green-400">PRESS!</p>
              <div className="font-mono tabular-nums text-xl text-green-300">
                {Math.floor(elapsedMs / 1000)}s {Math.floor(elapsedMs % 1000).toString().padStart(3, '0')}ms
              </div>
            </div>
          )}

          {isFalse && (
            <div className="text-center space-y-1">
              <p className="text-4xl font-black text-red-400">FALSE START</p>
              <p className="text-xs text-zinc-500 font-mono">Wait for green!</p>
            </div>
          )}

          {isFinished && (
            <div className="text-center space-y-1">
              <p className="text-3xl font-black text-white">DONE</p>
              <p className="text-xs text-zinc-500 font-mono">Tap to play again</p>
            </div>
          )}
        </div>

        {/* Results */}
        {isFinished && (
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 space-y-4 animate-fade-in">
            <h2 className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase text-center">Results</h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 bg-[#0d0d0d] rounded-xl p-3 border border-[#1e1e1e]">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Avg</span>
                <span className="text-xl font-bold font-mono text-white">
                  {validTimes.length ? `${avg.toFixed(0)}ms` : '—'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-[#0d0d0d] rounded-xl p-3 border border-[#1e1e1e]">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Best</span>
                <span className="text-xl font-bold font-mono text-green-400">
                  {best !== null ? `${best.toFixed(0)}ms` : '—'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-[#0d0d0d] rounded-xl p-3 border border-[#1e1e1e]">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">False</span>
                <span className="text-xl font-bold font-mono text-red-400">{falseStarts}</span>
              </div>
            </div>

            {/* Per-round list */}
            <div className="space-y-1">
              {rounds.map((r, i) => {
                const rt = r.ms;
                const rate = rt !== null ? rating(rt) : null;
                return (
                  <div key={i} className="flex items-center justify-between font-mono text-sm px-1">
                    <span className="text-zinc-600">Round {i + 1}</span>
                    {rt !== null ? (
                      <span className={`font-bold ${rate?.color}`}>
                        {rt.toFixed(0)}ms — {rate?.label}
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold">False start</span>
                    )}
                  </div>
                );
              })}
            </div>

            {best !== null && (
              <p className="text-center text-xs font-mono text-zinc-500">
                Rating: <span className={`font-bold ${rating(avg).color}`}>{rating(avg).label}</span>
              </p>
            )}
          </div>
        )}

        <p className="text-center text-[10px] text-zinc-700 font-mono tracking-widest">
          {isIdle || isFinished
            ? 'PRESS SPACE OR TAP THE LIGHT'
            : isRed || isFalse
            ? 'WAIT FOR GREEN...'
            : 'PRESS NOW!'}
        </p>

      </div>
    </main>
  );
}
