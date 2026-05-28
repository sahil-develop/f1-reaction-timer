'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Attempt, Stats } from '@/types';

const STORAGE_KEY = 'f1-reaction-attempts';
const MAX_ATTEMPTS = 20;

function loadAttempts(): Attempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAttempts(attempts: Attempt[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // Storage not available
  }
}

export function useLeaderboard() {
  const [attempts, setAttempts] = useState<Attempt[]>(loadAttempts);

  const addAttempt = useCallback((data: Omit<Attempt, 'id' | 'timestamp'>) => {
    const newAttempt: Attempt = {
      ...data,
      id: Math.random().toString(36).slice(2, 9),
      timestamp: Date.now(),
    };
    setAttempts(prev => {
      const updated = [newAttempt, ...prev].slice(0, MAX_ATTEMPTS);
      saveAttempts(updated);
      return updated;
    });
  }, []);

  const clearAttempts = useCallback(() => {
    setAttempts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage not available
    }
  }, []);

  const stats: Stats | null = useMemo(() => {
    if (attempts.length === 0) return null;
    const times = attempts.map(a => a.actualTime);
    return {
      best: Math.min(...times),
      worst: Math.max(...times),
      average: times.reduce((a, b) => a + b, 0) / times.length,
    };
  }, [attempts]);

  return { attempts, addAttempt, clearAttempts, stats };
}
