'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '@/lib/sounds';

function HowToPlay() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase">
          How to Use
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-zinc-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-in">
          <ol className="space-y-2 text-xs text-zinc-400 font-mono list-decimal list-inside">
            <li>Use <span className="text-white">+</span> and <span className="text-white">−</span> buttons to set <span className="text-white">minutes</span> and <span className="text-white">seconds</span>.</li>
            <li>Press <span className="text-[#E8002D]">START</span> to begin the countdown.</li>
            <li>Press <span className="text-[#E8002D]">PAUSE</span> to pause, then <span className="text-[#E8002D]">RESUME</span> to continue.</li>
            <li>When time reaches <span className="text-white">zero</span>, the alarm sounds automatically.</li>
            <li>Press <span className="text-red-400">STOP ALARM</span> to silence it and reset.</li>
          </ol>
        </div>
      )}
    </div>
  );
}

type TimerState = 'idle' | 'running' | 'paused' | 'alarming';

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ progress, alarming }: { progress: number; alarming: boolean }) {
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <svg width="220" height="220" className="-rotate-90" aria-hidden="true">
      <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="#1a1a1a" strokeWidth="10" />
      <circle
        cx="110" cy="110" r={RADIUS}
        fill="none"
        stroke={alarming ? '#ff0040' : '#E8002D'}
        strokeWidth="10"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
      />
    </svg>
  );
}

export default function AlarmTimerPage() {
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);
  const [state, setState] = useState<TimerState>('idle');
  const [remaining, setRemaining] = useState(0);
  const [initialTotal, setInitialTotal] = useState(0);

  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);
  const remainingRef = useRef(0);

  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  const totalSeconds = minutes * 60 + seconds;

  const clearCounting = useCallback(() => {
    if (countIntervalRef.current) clearInterval(countIntervalRef.current);
  }, []);

  const clearAlarm = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  const startAlarm = useCallback(() => {
    clearCounting();
    setState('alarming');
    soundManager.playAlarmBeep();
    alarmIntervalRef.current = setInterval(() => soundManager.playAlarmBeep(), 800);
  }, [clearCounting]);

  const startCounting = useCallback(() => {
    countIntervalRef.current = setInterval(() => {
      const remMs = endTimeRef.current - Date.now();
      if (remMs <= 0) {
        clearInterval(countIntervalRef.current!);
        setRemaining(0);
        startAlarm();
      } else {
        const remSec = Math.ceil(remMs / 1000);
        setRemaining(remSec);
        remainingRef.current = remSec;
      }
    }, 200);
  }, [startAlarm]);

  const start = useCallback(() => {
    if (state === 'idle') {
      const total = totalSeconds;
      if (total <= 0) return;
      setInitialTotal(total);
      setRemaining(total);
      remainingRef.current = total;
      endTimeRef.current = Date.now() + total * 1000;
    } else if (state === 'paused') {
      endTimeRef.current = Date.now() + remainingRef.current * 1000;
    }
    setState('running');
    startCounting();
  }, [state, totalSeconds, startCounting]);

  const pause = useCallback(() => {
    clearCounting();
    setState('paused');
  }, [clearCounting]);

  const reset = useCallback(() => {
    clearCounting();
    clearAlarm();
    setState('idle');
    setRemaining(0);
    setInitialTotal(0);
    remainingRef.current = 0;
  }, [clearCounting, clearAlarm]);

  const stopAlarm = useCallback(() => {
    clearAlarm();
    setState('idle');
    setRemaining(0);
    setInitialTotal(0);
    remainingRef.current = 0;
  }, [clearAlarm]);

  useEffect(() => () => { clearCounting(); clearAlarm(); }, [clearCounting, clearAlarm]);

  const isIdle = state === 'idle';
  const isRunning = state === 'running';
  const isPaused = state === 'paused';
  const isAlarming = state === 'alarming';

  const displaySecs = isIdle ? totalSeconds : remaining;
  const displayMin = Math.floor(displaySecs / 60);
  const displaySec = displaySecs % 60;
  const progress = isIdle ? 1 : initialTotal > 0 ? remaining / initialTotal : 0;

  const adjustSeconds = (delta: number) => {
    setSeconds(s => {
      const next = s + delta;
      if (next >= 60) { setMinutes(m => Math.min(99, m + 1)); return next - 60; }
      if (next < 0) { setMinutes(m => { if (m <= 0) return 0; return m - 1; }); return next + 60; }
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            ALARM <span className="text-[#E8002D]">TIMER</span>
          </h1>
          <p className="text-xs text-zinc-600 font-mono tracking-widest uppercase mt-1">
            Countdown with alarm
          </p>
        </div>

        {/* How to Use */}
        <HowToPlay />

        {/* Time Input */}
        {isIdle && (
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 animate-fade-in">
            <p className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase mb-4 text-center">
              Set Time
            </p>
            <div className="flex items-center justify-center gap-6">

              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setMinutes(m => Math.min(99, m + 1))}
                  className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] font-mono font-bold text-white transition-colors"
                >
                  +
                </button>
                <span className="text-4xl font-black font-mono tabular-nums w-16 text-center">
                  {minutes.toString().padStart(2, '0')}
                </span>
                <button
                  onClick={() => setMinutes(m => Math.max(0, m - 1))}
                  className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] font-mono font-bold text-white transition-colors"
                >
                  −
                </button>
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">min</span>
              </div>

              <span className="text-4xl font-black text-zinc-600 pb-6">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => adjustSeconds(5)}
                  className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] font-mono font-bold text-white transition-colors"
                >
                  +
                </button>
                <span className="text-4xl font-black font-mono tabular-nums w-16 text-center">
                  {seconds.toString().padStart(2, '0')}
                </span>
                <button
                  onClick={() => adjustSeconds(-5)}
                  className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] font-mono font-bold text-white transition-colors"
                >
                  −
                </button>
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">sec</span>
              </div>

            </div>
          </div>
        )}

        {/* Circular ring + display */}
        <div className="flex justify-center">
          <div className="relative">
            <ProgressRing progress={progress} alarming={isAlarming} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-4xl sm:text-5xl font-black font-mono tabular-nums tracking-tight ${
                isAlarming ? 'text-red-400 animate-pulse' : 'text-white'
              }`}>
                {displayMin.toString().padStart(2, '0')}:{displaySec.toString().padStart(2, '0')}
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 tracking-widest uppercase">
                {isIdle ? 'READY' : isRunning ? 'COUNTING' : isPaused ? 'PAUSED' : 'ALARM!'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {isAlarming ? (
            <button
              onClick={stopAlarm}
              className="flex-1 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-sm tracking-[0.2em] uppercase rounded-xl py-4 transition-colors animate-pulse focus:outline-none"
            >
              STOP ALARM
            </button>
          ) : (
            <>
              {isRunning ? (
                <button
                  onClick={pause}
                  className="flex-1 bg-[#E8002D] hover:bg-[#FF0040] active:bg-[#c0001f] text-white font-black text-sm tracking-[0.2em] uppercase rounded-xl py-4 transition-colors focus:outline-none"
                >
                  PAUSE
                </button>
              ) : (
                <button
                  onClick={start}
                  disabled={totalSeconds === 0 && isIdle}
                  className="flex-1 bg-[#E8002D] hover:bg-[#FF0040] active:bg-[#c0001f] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm tracking-[0.2em] uppercase rounded-xl py-4 transition-colors focus:outline-none"
                >
                  {isPaused ? 'RESUME' : 'START'}
                </button>
              )}
              {!isIdle && (
                <button
                  onClick={reset}
                  className="bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-zinc-400 font-bold text-sm tracking-wider uppercase rounded-xl px-5 py-4 transition-colors focus:outline-none"
                >
                  RESET
                </button>
              )}
            </>
          )}
        </div>

        {/* Hint */}
        <p className="text-center text-[10px] text-zinc-700 font-mono tracking-widest">
          {isIdle
            ? 'SET A TIME AND PRESS START'
            : isRunning
            ? 'RUNNING — PAUSE OR WAIT FOR ALARM'
            : isPaused
            ? 'PAUSED — RESUME OR RESET'
            : 'ALARM IS RINGING!'}
        </p>

      </div>
    </main>
  );
}
