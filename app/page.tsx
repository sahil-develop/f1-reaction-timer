'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState } from '@/types';
import { StartingLights } from '@/components/StartingLights';
import { Results } from '@/components/Results';
import { Leaderboard } from '@/components/Leaderboard';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { soundManager } from '@/lib/sounds';

const LIGHT_INTERVAL_MS = 700;
const MIN_HOLD_MS = 2000;
const MAX_HOLD_MS = 5000;

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export default function Home() {
  const [targetInput, setTargetInput] = useState('250');
  const [inputError, setInputError] = useState('');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [litCount, setLitCount] = useState(0);
  const [lightsOut, setLightsOut] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [actualTime, setActualTime] = useState(0);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const scheduledTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { attempts, addAttempt, clearAttempts, stats } = useLeaderboard();

  const clearAllTimers = useCallback(() => {
    scheduledTimers.current.forEach(clearTimeout);
    scheduledTimers.current = [];
    cancelAnimationFrame(rafRef.current);
  }, []);

  const scheduleTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    scheduledTimers.current.push(id);
    return id;
  }, []);

  const targetMs = clamp(parseInt(targetInput, 10) || 0, 50, 9999);

  const validateInput = (value: string): string => {
    const n = parseInt(value, 10);
    if (!value || isNaN(n)) return 'Enter a number between 50 and 9999';
    if (n < 50) return 'Minimum 50 ms';
    if (n > 9999) return 'Maximum 9999 ms';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetInput(val);
    setInputError(validateInput(val));
  };

  // Stop the timer and record the reaction time
  const stopTimer = useCallback(() => {
    const endTime = performance.now();
    const measured = endTime - startTimeRef.current;
    cancelAnimationFrame(rafRef.current);
    setActualTime(measured);
    setElapsedMs(measured);
    setGameState('finished');
    soundManager.playFinish();
  }, []);

  const startRace = useCallback(() => {
    const err = validateInput(targetInput);
    if (err) {
      setInputError(err);
      return;
    }
    clearAllTimers();
    setLitCount(0);
    setLightsOut(false);
    setElapsedMs(0);
    setActualTime(0);
    setGameState('lights-on');

    for (let i = 0; i < 5; i++) {
      scheduleTimer(() => {
        setLitCount(i + 1);
        soundManager.playLightOn(i);
      }, (i + 1) * LIGHT_INTERVAL_MS);
    }

    const allOnTime = 5 * LIGHT_INTERVAL_MS;
    const holdDuration = MIN_HOLD_MS + Math.random() * (MAX_HOLD_MS - MIN_HOLD_MS);

    scheduleTimer(() => {
      setGameState('lights-hold');
    }, allOnTime);

    scheduleTimer(() => {
      setLightsOut(true);
      setGameState('racing');
      soundManager.playLightsOut();
      startTimeRef.current = performance.now();

      const tick = () => {
        setElapsedMs(performance.now() - startTimeRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, allOnTime + holdDuration);
  }, [targetInput, clearAllTimers, scheduleTimer]);

  const reset = useCallback(() => {
    clearAllTimers();
    setGameState('idle');
    setLitCount(0);
    setLightsOut(false);
    setElapsedMs(0);
    setActualTime(0);
  }, [clearAllTimers]);

  const falseStart = useCallback(() => {
    clearAllTimers();
    setGameState('false-start');
    setLitCount(0);
    setLightsOut(false);
  }, [clearAllTimers]);

  // Save result when finished
  useEffect(() => {
    if (gameState === 'finished' && actualTime > 0) {
      addAttempt({
        targetTime: targetMs,
        actualTime,
        difference: actualTime - targetMs,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, actualTime]);

  // Spacebar shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      e.preventDefault();

      if (gameState === 'idle' || gameState === 'finished' || gameState === 'false-start') {
        startRace();
      } else if (gameState === 'racing') {
        stopTimer();
      } else if (gameState === 'lights-on' || gameState === 'lights-hold') {
        // Pressed too early — false start
        falseStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, startRace, stopTimer, falseStart]);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const isSequencing = gameState === 'lights-on' || gameState === 'lights-hold';
  const isRacing = gameState === 'racing';
  const isFinished = gameState === 'finished';
  const isFalseStart = gameState === 'false-start';
  const isIdle = gameState === 'idle';

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E8002D]" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              F1 REACTION<span className="text-[#E8002D]"> TIMER</span>
            </h1>
            <div className="w-6 h-6 rounded-full bg-[#E8002D]" aria-hidden="true" />
          </div>
          <p className="text-xs text-zinc-600 font-mono tracking-widest uppercase">
            Race Start Simulator
          </p>
        </div>

        {/* Target Time Input */}
        <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-4 sm:p-5">
          <label
            htmlFor="target-input"
            className="block text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase mb-1"
          >
            Target Reaction Time (ms)
          </label>
          <p className="text-[10px] text-zinc-600 font-mono mb-2">
            Your goal — how fast you&apos;re aiming to react
          </p>
          <div className="flex gap-3">
            <input
              id="target-input"
              type="number"
              min={50}
              max={9999}
              value={targetInput}
              onChange={handleInputChange}
              disabled={isSequencing || isRacing}
              className={`
                flex-1 bg-[#0d0d0d] border rounded-xl px-4 py-3 font-mono text-lg font-bold
                text-white text-center tracking-wider
                focus:outline-none focus:ring-1 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                ${inputError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-[#2a2a2a] focus:border-[#E8002D] focus:ring-[#E8002D]/30'
                }
              `}
              placeholder="250"
            />
            <div className="flex items-center text-zinc-600 font-mono text-sm">ms</div>
          </div>
          {inputError && (
            <p className="mt-1.5 text-xs text-red-400 font-mono">{inputError}</p>
          )}
        </div>

        {/* Starting Lights */}
        <div className="flex justify-center">
          <StartingLights litCount={litCount} lightsOut={lightsOut} />
        </div>

        {/* Live Timer (shown while racing) */}
        <div
          className={`
            text-center font-mono transition-all duration-150
            ${isRacing ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          aria-live="polite"
        >
          <div className="text-5xl sm:text-6xl font-black tabular-nums text-[#E8002D] tracking-tight">
            {elapsedMs.toFixed(0)}
            <span className="text-2xl sm:text-3xl ml-2 text-red-800">ms</span>
          </div>
          <p className="text-xs text-zinc-500 font-mono tracking-widest mt-1">
            AIM: {targetMs} ms
          </p>
        </div>

        {/* False Start Banner */}
        {isFalseStart && (
          <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-4 text-center animate-fade-in">
            <p className="text-yellow-400 font-black tracking-widest text-lg">FALSE START!</p>
            <p className="text-yellow-600 text-xs font-mono mt-1">You moved before the lights went out</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {isIdle || isFinished || isFalseStart ? (
            <button
              onClick={startRace}
              disabled={!!inputError}
              className="
                flex-1 bg-[#E8002D] hover:bg-[#FF0040] active:bg-[#c0001f]
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white font-black text-sm tracking-[0.2em] uppercase
                rounded-xl py-4 transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#E8002D]/50
              "
            >
              {isFinished || isFalseStart ? 'TRY AGAIN' : 'START'}
              <span className="opacity-60 font-normal text-xs ml-2">[Space]</span>
            </button>
          ) : isSequencing ? (
            <button
              onClick={reset}
              className="
                flex-1 bg-[#1a1a1a] hover:bg-[#222] active:bg-[#2a2a2a]
                border border-[#333] hover:border-[#555]
                text-zinc-400 font-bold text-sm tracking-[0.2em] uppercase
                rounded-xl py-4 transition-colors
                focus:outline-none focus:ring-2 focus:ring-white/10
              "
            >
              ABORT
            </button>
          ) : (
            /* REACT button — only shown when lights are out */
            <button
              onClick={stopTimer}
              className="
                flex-1 bg-green-500 hover:bg-green-400 active:bg-green-600
                text-black font-black text-xl tracking-[0.15em] uppercase
                rounded-xl py-5 transition-colors
                focus:outline-none focus:ring-2 focus:ring-green-400/50
                animate-pulse
              "
            >
              REACT!
              <span className="font-normal text-sm ml-2 opacity-70">[Space]</span>
            </button>
          )}

          {isFinished && (
            <button
              onClick={reset}
              className="
                bg-[#1a1a1a] hover:bg-[#222]
                border border-[#333]
                text-zinc-400 font-bold text-sm tracking-wider uppercase
                rounded-xl px-5 py-4 transition-colors
                focus:outline-none focus:ring-2 focus:ring-white/10
              "
            >
              RESET
            </button>
          )}
        </div>

        {/* Instruction hint */}
        <p className="text-center text-[10px] text-zinc-700 font-mono tracking-widest">
          {isSequencing
            ? 'WAIT FOR LIGHTS OUT — THEN REACT!'
            : isRacing
            ? 'PRESS SPACE OR TAP REACT AS FAST AS YOU CAN!'
            : 'PRESS SPACE TO START'}
        </p>

        {/* Results */}
        <Results
          targetTime={targetMs}
          actualTime={actualTime}
          visible={isFinished}
        />

        {/* Leaderboard */}
        <Leaderboard attempts={attempts} stats={stats} onClear={clearAttempts} />

      </div>
    </main>
  );
}
