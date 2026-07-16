/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Music, Settings, Keyboard, Info, Bell, BellOff,
  Maximize2, Minimize2, CheckCircle, ExternalLink, HelpCircle, X, Timer
} from 'lucide-react';
import { TimerMode, TimerState, AppSettings, SoundConfig, SessionHistory } from './types';
import { audioEngine } from './lib/audioEngine';
import { TimerCircle } from './components/TimerCircle';
import { SoundSelector } from './components/SoundSelector';
import { SettingsModal } from './components/SettingsModal';
import { InfoSections } from './components/InfoSections';
import { FooterBanner } from './components/FooterBanner';

// Default Constants
const DEFAULT_SETTINGS: AppSettings = {
  durations: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  autoStartNext: false,
  autoStartBreaks: false,
  autoStartFocus: false,
  theme: 'light',
  targetSessions: 6,
};

const DEFAULT_SOUNDS: SoundConfig[] = [
  { id: 'rain', name: 'Rain', category: 'nature', description: 'Gentle synthesized rain shower', isPlaying: false, volume: 0.5 },
  { id: 'forest', name: 'Forest Whispers', category: 'nature', description: 'Soughing wind and rustling leaves', isPlaying: false, volume: 0.5 },
  { id: 'ocean', name: 'Ocean Waves', category: 'nature', description: 'Rhythmic, relaxing rolling surf', isPlaying: false, volume: 0.5 },
  { id: 'fireplace', name: 'Fireplace Spark', category: 'nature', description: 'Cozy burning hearth with wood snaps', isPlaying: false, volume: 0.5 },
  { id: 'coffee', name: 'Coffee Shop', category: 'nature', description: 'Subtle background murmurs and cup clinks', isPlaying: false, volume: 0.35 },
  { id: 'white', name: 'White Noise', category: 'noise', description: 'Continuous steady high spectrum mask', isPlaying: false, volume: 0.4 },
  { id: 'brown', name: 'Brown Noise', category: 'noise', description: 'Deep low frequency rumble for focus', isPlaying: false, volume: 0.4 },
  { id: 'pink', name: 'Pink Noise', category: 'noise', description: 'Balanced organic noise spectrum', isPlaying: false, volume: 0.4 },
  { id: 'studyBeat', name: 'Binaural: Study', category: 'binaural', description: '40Hz Gamma wave for deep analytical focus', isPlaying: false, volume: 0.3 },
  { id: 'relaxBeat', name: 'Binaural: Relax', category: 'binaural', description: '10Hz Alpha wave for quiet meditation', isPlaying: false, volume: 0.3 },
  { id: 'sleepBeat', name: 'Binaural: Sleep', category: 'binaural', description: '3.5Hz Delta wave to soothe and wind down', isPlaying: false, volume: 0.3 },
];

interface ToastNotification {
  id: string;
  message: string;
  submessage?: string;
  type: 'success' | 'info' | 'alarm';
}

export default function App() {
  // 1. Core State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure theme is set correctly on document on load
        if (parsed.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  
  // Track remaining seconds
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return settings.durations.focus * 60;
  });

  // Track completed sessions
  const [sessionsCompleted, setSessionsCompleted] = useState<SessionHistory[]>(() => {
    const saved = localStorage.getItem('pomodoro_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Sound configs state
  const [sounds, setSounds] = useState<SoundConfig[]>(DEFAULT_SOUNDS);

  // Fullscreen Focus State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Popups visibility
  const [isSoundsOpen, setIsSoundsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Toasts state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Browser Notification permissions
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Audio active check
  const [isAudioContextInited, setIsAudioContextInited] = useState<boolean>(false);

  // 2. Refs
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const modeRef = useRef<TimerMode>(mode);
  modeRef.current = mode;

  // Track overall seconds for circular progress calculation
  const [totalDuration, setTotalDuration] = useState<number>(() => {
    return settings.durations.focus * 60;
  });

  // 3. Document Title syncing
  useEffect(() => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const prefix = timerState === 'running' ? `▶ ${formatTime(timeLeft)}` : formatTime(timeLeft);
    const label = mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    document.title = `${prefix} | Minimalist ${label}`;
  }, [timeLeft, mode, timerState]);

  // 4. Load & request browser Notification API capability
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        showToast({
          id: Math.random().toString(),
          message: permission === 'granted' ? 'Notifications Enabled!' : 'Notifications Declined',
          submessage: permission === 'granted' ? 'We will alert you when a timer finishes.' : 'You can enable them in your browser settings.',
          type: 'info',
        });
        audioEngine.playSubtleClick();
      });
    }
  };

  // 5. Save settings/history to local storage on changes
  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro_history', JSON.stringify(sessionsCompleted));
  }, [sessionsCompleted]);

  // 6. Handle custom settings save updates
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // If idle, immediately apply new duration for current mode
    if (timerState === 'idle') {
      const mins = newSettings.durations[mode];
      setTimeLeft(mins * 60);
      setTotalDuration(mins * 60);
    }
    showToast({
      id: Math.random().toString(),
      message: 'Settings Saved',
      submessage: 'Timer durations have been successfully updated.',
      type: 'success',
    });
  };

  const handleClearSessions = () => {
    setSessionsCompleted([]);
    showToast({
      id: Math.random().toString(),
      message: 'Progress Reset',
      submessage: 'Completed focus sessions and history set to zero.',
      type: 'info',
    });
  };

  // 7. Toast Manager
  const showToast = (toast: ToastNotification) => {
    setToasts(prev => [toast, ...prev].slice(0, 3)); // max 3 simultaneous toasts
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  };

  // 8. Mode Switch Handler
  const switchMode = (newMode: TimerMode, forceReset: boolean = false) => {
    if (newMode === mode && !forceReset) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setMode(newMode);
    setTimerState('idle');
    const mins = settings.durations[newMode];
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
    audioEngine.playSubtleClick();
  };

  // 9. Countdown Core Interval Loop
  const toggleStartTimer = () => {
    // Lazy Audio Setup
    if (!isAudioContextInited) {
      setIsAudioContextInited(true);
    }

    if (timerState === 'running') {
      // Pause
      setTimerState('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      audioEngine.playSubtleClick();
    } else {
      // Start / Resume
      setTimerState('running');
      audioEngine.playSubtleClick();

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer Finished!
            clearInterval(timerIntervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimerState('idle');
    const mins = settings.durations[mode];
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
    audioEngine.playSubtleClick();
  };

  // 10. Timer End Session Handling
  const handleTimerComplete = () => {
    audioEngine.playNotificationSound();

    let notificationTitle = "Session Complete!";
    let notificationText = "";
    let toastMsg = "";
    let toastSub = "";
    let nextMode: TimerMode = 'focus';

    if (mode === 'focus') {
      // Focus Session Ends
      const completedSession: SessionHistory = {
        completedAt: new Date().toISOString(),
        mode: 'focus',
        duration: settings.durations.focus,
      };
      setSessionsCompleted(prev => [...prev, completedSession]);

      // Calculate next mode (alternate short/long break based on focus count)
      const currentTodayCount = sessionsCompleted.filter(s => {
        const d = new Date(s.completedAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length + 1;

      // Every 4th focus session, take a long break
      if (currentTodayCount % 4 === 0) {
        nextMode = 'longBreak';
        notificationText = "Great job! Time for a long break.";
        toastMsg = "Focus Finished! 🏆";
        toastSub = "Outstanding! You've earned a long break.";
      } else {
        nextMode = 'shortBreak';
        notificationText = "Great job! Time for a short break.";
        toastMsg = "Focus Finished! 🍅";
        toastSub = "Time to stretch. Take a short break.";
      }
    } else {
      // Break Ends
      nextMode = 'focus';
      notificationText = "Break ended. Ready to focus?";
      toastMsg = "Break Completed! ☕";
      toastSub = "Let's return to study mode. Ready?";
    }

    // Show native browser notification if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationTitle, {
        body: notificationText,
        icon: '/favicon.ico',
        tag: 'pomodoro-alert',
        silent: true // sound is generated natively via Web Audio API chime
      });
    }

    // Show in-app animated Toast
    showToast({
      id: Math.random().toString(),
      message: toastMsg,
      submessage: toastSub,
      type: 'alarm',
    });

    // Handle auto-start behavior
    setMode(nextMode);
    const nextDurationSeconds = settings.durations[nextMode] * 60;
    setTimeLeft(nextDurationSeconds);
    setTotalDuration(nextDurationSeconds);

    const shouldAutoStart =
      settings.autoStartNext ||
      (mode === 'focus' ? settings.autoStartBreaks : settings.autoStartFocus);

    if (shouldAutoStart) {
      setTimerState('running');
      // Create fresh interval immediately
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerState('idle');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // 11. Fullscreen Focus Handler
  const toggleFullscreenFocus = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      // Attempt browser native fullscreen if available
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen();
        }
      } catch (e) {}
    } else {
      setIsFullscreen(false);
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      } catch (e) {}
    }
    audioEngine.playSubtleClick();
  };

  // Exit fullscreen on Esc key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 12. Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing in inputs or select boxes
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Ctrl + F for Fullscreen
      if (e.ctrlKey && key === 'f') {
        e.preventDefault();
        toggleFullscreenFocus();
        return;
      }

      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleStartTimer();
      } else if (key === 'r') {
        e.preventDefault();
        resetTimer();
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullscreenFocus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [timerState, isFullscreen, mode, settings]);

  // 13. Completed focus session counter logic (filtering for today)
  const getTodaySessionsCount = () => {
    const todayStr = new Date().toDateString();
    return sessionsCompleted.filter(s => {
      const d = new Date(s.completedAt);
      return d.toDateString() === todayStr;
    }).length;
  };

  const todayCount = getTodaySessionsCount();
  const targetArray = Array.from({ length: settings.targetSessions });

  return (
    <div className={`h-[100dvh] w-screen bg-[#FAF5EC] dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-500 font-sans relative flex flex-col ${isFullscreen ? 'overflow-hidden' : 'overflow-y-auto snap-y snap-mandatory scroll-smooth'}`}>
      <div id="top-marker" className="absolute top-0 left-0 w-0 h-0 pointer-events-none" />
      
      {/* 1. First Fold: Header + Main Timer Area */}
      <div className="h-[100dvh] min-h-[100dvh] w-full flex flex-col justify-between shrink-0 snap-start relative overflow-hidden">
        {/* Decorative subtle ambient lights */}
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        {mode === 'shortBreak' && (
          <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        )}
        {mode === 'longBreak' && (
          <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        )}

      {/* 1. Header (hidden in Fullscreen Focus Mode) */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.header
            id="app-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-[1440px] mx-auto px-8 md:px-12 py-7 flex items-center justify-between border-b border-neutral-100/10"
          >
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-mono font-bold text-sm tracking-tight shadow-md transition-all duration-500 ${
                mode === 'focus'
                  ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.55)] border border-amber-400/30'
                  : mode === 'shortBreak'
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.55)] border border-emerald-400/30'
                  : 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.55)] border border-indigo-400/30'
              }`}>
                <Timer className="w-4.5 h-4.5 text-white animate-pulse" />
              </span>
              <span className={`text-sm font-bold tracking-tight font-sans transition-all duration-500 ${
                mode === 'focus'
                  ? 'text-amber-600 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.45)]'
                  : mode === 'shortBreak'
                  ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.45)]'
                  : 'text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.45)]'
              }`}>
                Pomodoro Timer
              </span>
            </div>

            {/* Utility Controls Row */}
            <div className="flex items-center gap-1.5">
              {/* Daily Target Indicators */}
              <button
                id="target-indicators"
                onClick={() => {
                  audioEngine.playSubtleClick();
                  showToast({
                    id: Math.random().toString(),
                    message: "Daily Focus Goal",
                    submessage: `You completed ${todayCount} of ${settings.targetSessions} focused sessions today. Keep it up!`,
                    type: "info",
                  });
                }}
                title={`Daily Focus Target: ${todayCount} / ${settings.targetSessions} sessions`}
                className={`group px-3 py-2 rounded-xl flex items-center gap-2.5 transition-all duration-300 active:scale-95 hover:scale-105 btn-glass-fluid border border-transparent ${
                  mode === 'focus'
                    ? 'hover:text-amber-600 hover:border-amber-500/35 dark:hover:text-amber-400 dark:hover:border-amber-400/35 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : mode === 'shortBreak'
                    ? 'hover:text-emerald-600 hover:border-emerald-500/35 dark:hover:text-emerald-400 dark:hover:border-emerald-400/35 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'hover:text-indigo-600 hover:border-indigo-500/35 dark:hover:text-indigo-400 dark:hover:border-indigo-400/35 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                }`}
              >
                <div className="flex items-center gap-1">
                  {targetArray.map((_, idx) => {
                    const isCompleted = idx < todayCount;
                    return (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full border transition-all duration-500 ${
                          isCompleted
                            ? mode === 'focus'
                              ? 'bg-neutral-500 border-neutral-500 dark:bg-neutral-400 dark:border-neutral-400 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                              : mode === 'shortBreak'
                              ? 'bg-neutral-500 border-neutral-500 dark:bg-neutral-400 dark:border-neutral-400 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                              : 'bg-neutral-500 border-neutral-500 dark:bg-neutral-400 dark:border-neutral-400 group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                            : 'bg-transparent border-neutral-300 dark:border-neutral-700'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className={`text-[10px] font-mono tracking-wider font-semibold text-neutral-500 dark:text-neutral-450 uppercase transition-all duration-300 ${
                  mode === 'focus'
                    ? 'group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : mode === 'shortBreak'
                    ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                }`}>
                  {todayCount}/{settings.targetSessions}
                </span>
              </button>

              {/* Notification Permission Toggle */}
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  title="Enable browser notifications"
                  className={`p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 btn-glass-fluid transition-all duration-300 active:scale-95 hover:scale-105 border border-transparent ${
                    mode === 'focus'
                      ? 'hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : mode === 'shortBreak'
                      ? 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                  }`}
                >
                  <BellOff className="w-4 h-4" />
                </button>
              )}

              {/* Focus Sounds Toggle */}
              <button
                id="focus-sounds-btn"
                onClick={() => {
                  setIsSoundsOpen(true);
                  audioEngine.resumeContext();
                  audioEngine.playSubtleClick();
                }}
                title="Focus sounds mixer"
                className={`group p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold tracking-tight btn-glass-fluid transition-all duration-300 active:scale-95 hover:scale-105 border ${
                  sounds.some(s => s.isPlaying)
                    ? mode === 'focus'
                      ? 'bg-amber-500/15 dark:bg-amber-400/25 border-amber-500/50 dark:border-amber-400/50 text-amber-600 dark:text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.45)]'
                      : mode === 'shortBreak'
                      ? 'bg-emerald-500/15 dark:bg-emerald-400/25 border-emerald-500/50 dark:border-emerald-400/50 text-emerald-600 dark:text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.45)]'
                      : 'bg-indigo-500/15 dark:bg-indigo-400/25 border-indigo-500/50 dark:border-indigo-400/50 text-indigo-600 dark:text-indigo-400 font-bold shadow-[0_0_15px_rgba(99,102,241,0.45)]'
                    : mode === 'focus'
                    ? 'text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] border-transparent'
                    : mode === 'shortBreak'
                    ? 'text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] border-transparent'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)] border-transparent'
                }`}
              >
                <Music className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                  sounds.some(s => s.isPlaying)
                    ? mode === 'focus'
                      ? 'text-amber-600 dark:text-amber-400'
                      : mode === 'shortBreak'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                    : 'text-neutral-500 dark:text-neutral-450'
                }`} />
                <span className={`hidden sm:inline transition-all duration-300 ${
                  sounds.some(s => s.isPlaying)
                    ? mode === 'focus'
                      ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : mode === 'shortBreak'
                      ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                    : ''
                }`}>Focus Sounds</span>
              </button>

              {/* Theme Switcher */}
              <button
                id="theme-toggle-btn"
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    theme: prev.theme === 'light' ? 'dark' : 'light',
                  }));
                  audioEngine.playSubtleClick();
                }}
                title={settings.theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                className={`p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 btn-glass-fluid transition-all duration-300 active:scale-95 hover:scale-105 border border-transparent ${
                  mode === 'focus'
                    ? 'hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : mode === 'shortBreak'
                    ? 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                }`}
              >
                {settings.theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              {/* Timer Settings Cog */}
              <button
                id="timer-settings-btn"
                onClick={() => {
                  setIsSettingsOpen(true);
                  audioEngine.playSubtleClick();
                }}
                title="Timer and Shortcut settings"
                className={`group p-2 rounded-xl transition-all duration-300 active:scale-95 hover:scale-105 btn-glass-fluid border border-transparent ${
                  mode === 'focus'
                    ? 'hover:text-amber-600 hover:border-amber-500/35 dark:hover:text-amber-400 dark:hover:border-amber-400/35 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : mode === 'shortBreak'
                    ? 'hover:text-emerald-600 hover:border-emerald-500/35 dark:hover:text-emerald-400 dark:hover:border-emerald-400/35 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'hover:text-indigo-600 hover:border-indigo-500/35 dark:hover:text-indigo-400 dark:hover:border-indigo-400/35 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                }`}
              >
                <Settings className={`w-4 h-4 transition-all duration-500 group-hover:rotate-45 text-neutral-500 dark:text-neutral-400 ${
                  mode === 'focus'
                    ? 'group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : mode === 'shortBreak'
                    ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                }`} />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* 2. Main Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative">
        
        {/* Fullscreen focus active banner */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200/20 dark:border-neutral-850/20 shadow-md text-xs font-mono font-medium tracking-tight text-neutral-400 select-none z-10"
            >
              <span>Focus Mode Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <button
                onClick={toggleFullscreenFocus}
                className="ml-2 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 btn-glass-fluid"
              >
                Exit
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 sm:gap-10">
          
          {/* Main Countdown Timer Circle */}
          <TimerCircle
            timeLeft={timeLeft}
            totalDuration={totalDuration}
            mode={mode}
            timerState={timerState}
            onToggleStart={toggleStartTimer}
            onReset={resetTimer}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreenFocus}
          />

          {/* Mode Selector Row (Focus, Short Break, Long Break) - hidden in Fullscreen */}
          <AnimatePresence>
            {!isFullscreen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative flex items-center gap-1 p-1 bg-amber-100/35 dark:bg-neutral-900/45 backdrop-blur-xl rounded-2xl border border-amber-200/20 dark:border-neutral-800/20 shadow-md"
                id="mode-selector-strip"
              >
                <button
                  id="mode-focus-btn"
                  onClick={() => switchMode('focus')}
                  className={`relative flex items-center justify-center px-4.5 py-2 text-xs font-semibold rounded-xl transition-all duration-300 z-10 cursor-pointer ${
                    mode === 'focus'
                      ? 'text-amber-650 dark:text-amber-400 font-bold scale-102'
                      : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {mode === 'focus' && (
                    <motion.div
                      layoutId="activeModeBackground"
                      className="absolute inset-0 bg-amber-500/15 dark:bg-amber-400/20 border border-amber-500/30 dark:border-amber-400/35 rounded-xl shadow-[0_0_8px_rgba(245,158,11,0.25)] -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span>Focus</span>
                </button>

                <button
                  id="mode-short-btn"
                  onClick={() => switchMode('shortBreak')}
                  className={`relative flex items-center justify-center px-4.5 py-2 text-xs font-semibold rounded-xl transition-all duration-300 z-10 cursor-pointer ${
                    mode === 'shortBreak'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-102'
                      : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {mode === 'shortBreak' && (
                    <motion.div
                      layoutId="activeModeBackground"
                      className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 dark:border-emerald-500/30 rounded-xl shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span>Short Break</span>
                </button>

                <button
                  id="mode-long-btn"
                  onClick={() => switchMode('longBreak')}
                  className={`relative flex items-center justify-center px-4.5 py-2 text-xs font-semibold rounded-xl transition-all duration-300 z-10 cursor-pointer ${
                    mode === 'longBreak'
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-102'
                      : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {mode === 'longBreak' && (
                    <motion.div
                      layoutId="activeModeBackground"
                      className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/25 dark:border-indigo-500/30 rounded-xl shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span>Long Break</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>

      {/* 2. Second Fold: InfoSections & Footer Banner */}
      {!isFullscreen && (
        <div className="w-full snap-start relative flex flex-col justify-between">
          {/* Informational Sections */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <InfoSections mode={mode} />
            </motion.div>
          </AnimatePresence>

          {/* Footer Banner */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <FooterBanner
                timerState={timerState}
                onStartFocusing={() => {
                  if (timerState !== 'running') {
                    toggleStartTimer();
                  }
                  const topEl = document.getElementById('top-marker');
                  if (topEl) {
                    topEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                  showToast({
                    id: Math.random().toString(),
                    message: 'Focus Streak Started!',
                    submessage: 'Let us lock in and conquer your targets.',
                    type: 'success',
                  });
                }}
                onSetFocusLength={(mins) => {
                  const newSettings = {
                    ...settings,
                    durations: {
                      ...settings.durations,
                      focus: mins
                    }
                  };
                  setSettings(newSettings);
                  setMode('focus');
                  setTimerState('idle');
                  setTimeLeft(mins * 60);
                  setTotalDuration(mins * 60);
                  showToast({
                    id: Math.random().toString(),
                    message: `${mins} Minute Timer Active`,
                    submessage: `Your focus duration has been calibrated to ${mins} minutes.`,
                    type: 'info',
                  });
                }}
                onShowToast={(msg, sub, type) => {
                  showToast({
                    id: Math.random().toString(),
                    message: msg,
                    submessage: sub,
                    type: type,
                  });
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* 4. Ambient Popups */}
      {/* Sounds Selector drawer */}
      <SoundSelector
        isOpen={isSoundsOpen}
        onClose={() => setIsSoundsOpen(false)}
        sounds={sounds}
        setSounds={setSounds}
      />

      {/* Timer / App Settings drawer */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearSessions={handleClearSessions}
        mode={mode}
      />

      {/* Shortcuts Guide Overlay */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShortcutsOpen(false)}
              className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[1px]"
              id="shortcuts-backdrop"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-[340px] p-6 rounded-2xl border border-amber-200/30 dark:border-neutral-800/50 bg-[#FCFAF2]/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl text-center"
            >
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-2 mb-4 font-sans">
                <Keyboard className="w-4 h-4 text-neutral-400" />
                <span>Shortcut Reference</span>
              </h3>
              <div className="space-y-2.5 text-xs font-mono text-left">
                <div className="flex justify-between items-center py-1 border-b border-amber-200/20 dark:border-neutral-850">
                  <span className="text-neutral-500 font-sans">Start / Pause</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-100/40 dark:bg-neutral-800 text-[10px] font-mono shadow-sm text-amber-900/80 dark:text-neutral-400 border border-amber-200/25 dark:border-transparent">SPACE</kbd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-amber-200/20 dark:border-neutral-850">
                  <span className="text-neutral-500 font-sans">Reset Timer</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-100/40 dark:bg-neutral-800 text-[10px] font-mono shadow-sm text-amber-900/80 dark:text-neutral-400 border border-amber-200/25 dark:border-transparent">R</kbd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-amber-200/20 dark:border-neutral-850">
                  <span className="text-neutral-500 font-sans">Toggle Full Screen</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-100/40 dark:bg-neutral-800 text-[10px] font-mono shadow-sm text-amber-900/80 dark:text-neutral-400 border border-amber-200/25 dark:border-transparent">F</kbd>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-500 font-sans">Toggle Full Screen alternative</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-amber-100/40 dark:bg-neutral-800 text-[10px] font-mono shadow-sm text-amber-900/80 dark:text-neutral-400 border border-amber-200/25 dark:border-transparent">CTRL + F</kbd>
                </div>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="mt-5 w-full py-2 bg-neutral-900/90 dark:bg-neutral-100/90 text-white dark:text-neutral-950 text-xs font-semibold rounded-xl shadow transition-all btn-glass-fluid"
              >
                Dismiss Guide
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. In-App Elegant Notifications (Toasts Overlay) */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-[340px] w-full" id="toasts-overlay">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`pointer-events-auto w-full p-4 rounded-2xl shadow-xl border backdrop-blur-xl flex items-start gap-3.5 transition-colors duration-300 ${
                toast.type === 'success'
                  ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-100 dark:border-emerald-900/50'
                  : toast.type === 'alarm'
                  ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-100 dark:border-rose-900/50'
                  : 'bg-white/95 dark:bg-neutral-900/95 border-neutral-150 dark:border-neutral-800'
              }`}
            >
              {toast.type === 'success' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4.5 h-4.5" />
                </div>
              )}
              {toast.type === 'alarm' && (
                <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 text-lg">
                  🔔
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Info className="w-4.5 h-4.5" />
                </div>
              )}

              <div className="flex-1 text-left">
                <h4 className={`text-xs font-semibold tracking-tight ${
                  toast.type === 'success'
                    ? 'text-emerald-850 dark:text-emerald-300'
                    : toast.type === 'alarm'
                    ? 'text-rose-850 dark:text-rose-300'
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {toast.message}
                </h4>
                {toast.submessage && (
                  <p className={`text-[11px] font-sans tracking-tight mt-0.5 leading-normal ${
                    toast.type === 'success'
                      ? 'text-emerald-700 dark:text-emerald-450'
                      : toast.type === 'alarm'
                      ? 'text-rose-700 dark:text-rose-450'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {toast.submessage}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded p-0.5 shrink-0 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
