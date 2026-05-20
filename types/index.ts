export interface Attempt {
  id: string;
  targetTime: number;
  actualTime: number;
  difference: number;
  timestamp: number;
}

export type GameState = 'idle' | 'lights-on' | 'lights-hold' | 'racing' | 'finished' | 'false-start';

export interface Stats {
  best: number;
  worst: number;
  average: number;
}
