export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type TimerState = 'idle' | 'running' | 'paused';

export interface SoundConfig {
  id: string;
  name: string;
  category: 'nature' | 'noise' | 'binaural';
  description?: string;
  isPlaying: boolean;
  volume: number; // 0 to 1
}

export interface AppSettings {
  durations: {
    focus: number; // in minutes
    shortBreak: number;
    longBreak: number;
  };
  autoStartNext: boolean;
  autoStartBreaks?: boolean;
  autoStartFocus?: boolean;
  theme: 'light' | 'dark';
  targetSessions: number;
}

export interface SessionHistory {
  completedAt: string;
  mode: TimerMode;
  duration: number;
}
