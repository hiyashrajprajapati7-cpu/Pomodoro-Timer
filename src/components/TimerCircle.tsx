/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { TimerMode, TimerState } from '../types';

interface TimerCircleProps {
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  mode: TimerMode;
  timerState: TimerState;
  onToggleStart: () => void;
  onReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  timeLeft,
  totalDuration,
  mode,
  timerState,
  onToggleStart,
  onReset,
  isFullscreen,
  onToggleFullscreen,
}) => {
  // Convert seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG progress circle calculations
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  
  // Guard against division by zero
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 1;
  const strokeDashoffset = circumference - (progress * circumference);

  // Get colors and emojis based on mode
  const getModeStyles = () => {
    switch (mode) {
      case 'focus':
        return {
          stroke: 'stroke-amber-500 dark:stroke-amber-400',
          text: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10 dark:bg-amber-400/10',
          label: 'Focus',
          glow: 'shadow-amber-500/20 dark:shadow-amber-400/15',
        };
      case 'shortBreak':
        return {
          stroke: 'stroke-emerald-500 dark:stroke-emerald-400',
          text: 'text-emerald-500 dark:text-emerald-400',
          bg: 'bg-emerald-500/5 dark:bg-emerald-400/5',
          label: '☕ Short Break',
          glow: 'shadow-emerald-500/10 dark:shadow-emerald-400/5',
        };
      case 'longBreak':
        return {
          stroke: 'stroke-indigo-500 dark:stroke-indigo-400',
          text: 'text-indigo-500 dark:text-indigo-400',
          bg: 'bg-indigo-500/5 dark:bg-indigo-400/5',
          label: '🌙 Long Break',
          glow: 'shadow-indigo-500/10 dark:shadow-indigo-400/5',
        };
    }
  };

  const styles = getModeStyles();

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Interactive Timer Block */}
      <motion.div 
        animate={{ 
          scale: timerState === 'running' ? 1.025 : 1,
          y: timerState === 'running' ? -2 : 0
        }}
        whileHover={{ scale: timerState === 'running' ? 1.04 : 1.015 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`relative w-64 h-64 min-[380px]:w-72 min-[380px]:h-72 sm:w-85 sm:h-85 flex items-center justify-center rounded-full transition-all duration-500 ${styles.glow} shadow-2xl`}
        id="timer-container-circle"
      >
        {/* Soft Glassmorphism background inside the circle */}
        <div className="absolute inset-4 rounded-full bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md border border-white/20 dark:border-neutral-800/20 -z-10" />

        {/* SVG Ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-neutral-100 dark:stroke-neutral-850 fill-none"
            strokeWidth="3.5"
          />

          {/* Animated Foreground Progress Circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            className={`fill-none ${styles.stroke}`}
            strokeWidth="4.5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ 
              type: 'tween', 
              ease: 'linear', 
              duration: timerState === 'running' ? 1.01 : 0.35 
            }}
            style={{
              strokeDasharray: circumference,
              filter: mode === 'focus' ? 'drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.65))' : 'none',
            }}
          />
        </svg>

        {/* Inner Content Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          {/* Mode label */}
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            key={mode}
            className={`text-xs font-mono font-medium tracking-wider px-3 py-1 rounded-full ${styles.bg} ${styles.text} border border-transparent dark:border-neutral-800/10`}
          >
            {styles.label}
          </motion.span>

          {/* Time Countdown digits */}
          <div className="text-5xl sm:text-6xl font-mono tracking-tighter text-neutral-900 dark:text-neutral-50 font-bold my-3 leading-none select-all">
            {formatTime(timeLeft)}
          </div>

          {/* Fullscreen focus button floating inside or next to circle */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus Mode (F)"}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 p-2 rounded-full transition-all duration-200 mt-1"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Primary Action Controls Strip */}
      <div className="flex items-center gap-4 mt-5 sm:mt-10" id="timer-controls">
        {/* Reset Button */}
        <motion.button
          onClick={onReset}
          id="reset-timer-btn"
          title="Reset session (R)"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 btn-glass-fluid cursor-pointer"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </motion.button>

        {/* Start / Pause Button */}
        <motion.button
          onClick={onToggleStart}
          id="toggle-timer-btn"
          title={timerState === 'running' ? "Pause (Space)" : "Start (Space)"}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.965 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className={`flex items-center justify-center w-36 h-11 sm:w-40 sm:h-12 rounded-2xl font-sans text-sm font-semibold shadow-md transition-colors duration-200 cursor-pointer ${
            timerState === 'running'
              ? 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border border-neutral-300/50 dark:border-neutral-700/50'
              : mode === 'focus'
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 border border-amber-450/10'
              : mode === 'shortBreak'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-450/10'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-450/10'
          }`}
        >
          {timerState === 'running' ? (
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
};
