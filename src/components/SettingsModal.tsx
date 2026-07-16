/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Keyboard, Play, RotateCcw, Maximize2, Trash2, Check } from 'lucide-react';
import { AppSettings, TimerMode } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearSessions: () => void;
  mode: TimerMode;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearSessions,
  mode,
}) => {
  const [focusDur, setFocusDur] = React.useState(settings.durations.focus);
  const [shortDur, setShortDur] = React.useState(settings.durations.shortBreak);
  const [longDur, setLongDur] = React.useState(settings.durations.longBreak);
  const [autoStart, setAutoStart] = React.useState(settings.autoStartNext);
  const [autoStartBreaks, setAutoStartBreaks] = React.useState(settings.autoStartBreaks ?? false);
  const [autoStartFocus, setAutoStartFocus] = React.useState(settings.autoStartFocus ?? false);
  const [target, setTarget] = React.useState(settings.targetSessions);

  // Sync state with settings when opened
  React.useEffect(() => {
    if (isOpen) {
      setFocusDur(settings.durations.focus);
      setShortDur(settings.durations.shortBreak);
      setLongDur(settings.durations.longBreak);
      setAutoStart(settings.autoStartNext);
      setAutoStartBreaks(settings.autoStartBreaks ?? false);
      setAutoStartFocus(settings.autoStartFocus ?? false);
      setTarget(settings.targetSessions);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      durations: {
        focus: Math.max(1, Math.min(180, focusDur)),
        shortBreak: Math.max(1, Math.min(60, shortDur)),
        longBreak: Math.max(1, Math.min(120, longDur)),
      },
      autoStartNext: autoStart,
      autoStartBreaks: autoStartBreaks,
      autoStartFocus: autoStartFocus,
      targetSessions: Math.max(1, Math.min(24, target)),
    });
    audioEngine.playSubtleClick();
    onClose();
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your today's session progress?")) {
      onClearSessions();
      audioEngine.playSubtleClick();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[2px]"
            id="settings-backdrop"
          />

          {/* Settings Modal Dialog */}
          <motion.div
            id="settings-container"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-[500px] max-h-[85vh] overflow-hidden rounded-2xl border bg-[#FCFAF2]/95 dark:bg-neutral-900/95 backdrop-blur-xl transition-all duration-300 flex flex-col ${
              mode === 'focus'
                ? 'shadow-[0_20px_50px_rgba(245,158,11,0.12)] border-amber-500/25 dark:border-amber-500/15'
                : mode === 'shortBreak'
                ? 'shadow-[0_20px_50px_rgba(16,185,129,0.12)] border-emerald-500/25 dark:border-emerald-500/15'
                : 'shadow-[0_20px_50px_rgba(99,102,241,0.12)] border-indigo-500/25 dark:border-indigo-500/15'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-200/20 dark:border-neutral-800/80 px-6 py-4.5">
              <div className="flex items-center gap-2">
                <Settings className={`w-5 h-5 transition-colors duration-300 ${
                  mode === 'focus'
                    ? 'text-amber-500'
                    : mode === 'shortBreak'
                    ? 'text-emerald-500'
                    : 'text-indigo-500'
                }`} />
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
                  Timer Settings
                </h3>
              </div>
              <button
                id="close-settings-btn"
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 btn-glass-fluid"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-6 py-5 flex-1 space-y-6 max-h-[60vh]">
              {/* Durations */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                  Custom Durations (Minutes)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {/* Focus */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-450">
                      Focus Session
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={focusDur}
                      onChange={(e) => setFocusDur(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-sm font-semibold font-mono focus:outline-none focus:ring-1 text-center transition-all ${
                        mode === 'focus'
                          ? 'focus:ring-amber-500 focus:border-amber-500/40'
                          : mode === 'shortBreak'
                          ? 'focus:ring-emerald-500 focus:border-emerald-500/40'
                          : 'focus:ring-indigo-500 focus:border-indigo-500/40'
                      }`}
                    />
                  </div>

                  {/* Short Break */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-450">
                      Short Break
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={shortDur}
                      onChange={(e) => setShortDur(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-sm font-semibold font-mono focus:outline-none focus:ring-1 text-center transition-all ${
                        mode === 'focus'
                          ? 'focus:ring-amber-500 focus:border-amber-500/40'
                          : mode === 'shortBreak'
                          ? 'focus:ring-emerald-500 focus:border-emerald-500/40'
                          : 'focus:ring-indigo-500 focus:border-indigo-500/40'
                      }`}
                    />
                  </div>

                  {/* Long Break */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-450">
                      Long Break
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={longDur}
                      onChange={(e) => setLongDur(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-sm font-semibold font-mono focus:outline-none focus:ring-1 text-center transition-all ${
                        mode === 'focus'
                          ? 'focus:ring-amber-500 focus:border-amber-500/40'
                          : mode === 'shortBreak'
                          ? 'focus:ring-emerald-500 focus:border-emerald-500/40'
                          : 'focus:ring-indigo-500 focus:border-indigo-500/40'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Behavior & Target */}
              <div className="space-y-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <h4 className="text-xs font-mono font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                  Timer Behaviors
                </h4>

                {/* Auto Start Breaks Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Auto Start Breaks
                    </label>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans tracking-tight">
                      Automatically start break session when your focus timer finishes.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAutoStartBreaks(!autoStartBreaks);
                      audioEngine.playSubtleClick();
                    }}
                    className={`relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border border-neutral-300/60 dark:border-neutral-700 transition-all duration-300 ease-in-out focus:outline-none ${
                      autoStartBreaks
                        ? mode === 'focus'
                          ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                          : mode === 'shortBreak'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                          : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.35)]'
                        : 'bg-neutral-300 dark:bg-neutral-850'
                    }`}
                  >
                    <span
                      className={`pointer-events-none mt-[1px] ml-[1px] inline-block h-4.5 w-4.5 transform rounded-full bg-white dark:bg-neutral-950 shadow-md ring-0 transition duration-300 ease-in-out ${
                        autoStartBreaks ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto Start Focus Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Auto Start Focus
                    </label>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans tracking-tight">
                      Automatically start focus session when your break timer finishes.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAutoStartFocus(!autoStartFocus);
                      audioEngine.playSubtleClick();
                    }}
                    className={`relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border border-neutral-300/60 dark:border-neutral-700 transition-all duration-300 ease-in-out focus:outline-none ${
                      autoStartFocus
                        ? mode === 'focus'
                          ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                          : mode === 'shortBreak'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                          : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.35)]'
                        : 'bg-neutral-300 dark:bg-neutral-850'
                    }`}
                  >
                    <span
                      className={`pointer-events-none mt-[1px] ml-[1px] inline-block h-4.5 w-4.5 transform rounded-full bg-white dark:bg-neutral-950 shadow-md ring-0 transition duration-300 ease-in-out ${
                        autoStartFocus ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Target Sessions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Daily Target Sessions
                    </label>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans tracking-tight">
                      The number of dots tracking your session goals today.
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={target}
                    onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                    className={`w-16 px-2 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-850 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-sm font-semibold font-mono focus:outline-none focus:ring-1 text-center transition-all ${
                      mode === 'focus'
                        ? 'focus:ring-amber-500 focus:border-amber-500/40'
                        : mode === 'shortBreak'
                        ? 'focus:ring-emerald-500 focus:border-emerald-500/40'
                        : 'focus:ring-indigo-500 focus:border-indigo-500/40'
                    }`}
                  />
                </div>
              </div>

              {/* Keyboard Shortcuts Help */}
              <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-neutral-450" />
                  <h4 className="text-xs font-mono font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                    Keyboard Shortcuts
                  </h4>
                </div>

                <div className="grid gap-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50/50 dark:bg-neutral-950/15 border border-neutral-100 dark:border-neutral-850">
                    <span className="text-neutral-500 dark:text-neutral-400 font-sans">Start or Pause timer</span>
                    <kbd className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono shadow-sm">
                      SPACE
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50/50 dark:bg-neutral-950/15 border border-neutral-100 dark:border-neutral-850">
                    <span className="text-neutral-500 dark:text-neutral-400 font-sans">Reset current timer</span>
                    <kbd className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono shadow-sm">
                      R
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50/50 dark:bg-neutral-950/15 border border-neutral-100 dark:border-neutral-850">
                    <span className="text-neutral-500 dark:text-neutral-400 font-sans">Toggle Full Screen Mode</span>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono shadow-sm">
                        CTRL + F
                      </kbd>
                      <span className="text-neutral-405 font-sans">or</span>
                      <kbd className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono shadow-sm">
                        F
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-amber-200/20 dark:border-neutral-800/60 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">Clear Data</span>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans leading-tight">
                    Reset completed focus sessions and history back to zero.
                  </p>
                </div>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 bg-rose-500/10 dark:bg-rose-500/20 px-3 py-2 rounded-xl transition-all btn-glass-fluid"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Session Progress</span>
                </button>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-amber-100/10 dark:bg-neutral-950/20 px-6 py-4 flex items-center justify-end gap-3 border-t border-amber-200/20 dark:border-neutral-800/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-450 dark:hover:text-neutral-250 rounded-xl transition-all btn-glass-fluid"
              >
                Cancel
              </button>
              <button
                id="save-settings-btn"
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-white rounded-xl shadow-lg transition-all active:scale-95 duration-300 hover:scale-[1.03] ${
                  mode === 'focus'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 border border-amber-400/20'
                    : mode === 'shortBreak'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 border border-emerald-400/20'
                    : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30 border border-indigo-400/20'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
