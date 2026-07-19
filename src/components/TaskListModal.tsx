/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, TimerMode } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSetFocusedTask: (id: string | null) => void;
  onClearCompleted: () => void;
  mode: TimerMode;
}

export const TaskListModal: React.FC<TaskListModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSetFocusedTask,
  onClearCompleted,
  mode,
}) => {
  const [newTaskText, setNewTaskText] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText('');
    audioEngine.playSubtleClick();
  };

  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;

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
            id="tasks-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            id="tasks-container"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-[460px] max-h-[80vh] overflow-hidden rounded-2xl border bg-[#FCFAF2]/95 dark:bg-neutral-900/95 backdrop-blur-xl transition-all duration-300 flex flex-col ${
              mode === 'focus'
                ? 'shadow-[0_20px_50px_rgba(245,158,11,0.1)] border-amber-500/20 dark:border-amber-500/10'
                : mode === 'shortBreak'
                ? 'shadow-[0_20px_50px_rgba(16,185,129,0.1)] border-emerald-500/20 dark:border-emerald-500/10'
                : 'shadow-[0_20px_50px_rgba(99,102,241,0.1)] border-indigo-500/20 dark:border-indigo-500/10'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-200/10 dark:border-neutral-800/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-sans">
                  Focus Goals
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {activeTasksCount} active
                </span>
              </div>
              <button
                id="close-tasks-btn"
                onClick={onClose}
                className="text-xs font-semibold px-2.5 py-1 text-neutral-450 hover:text-neutral-700 dark:text-neutral-550 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Info Tips Bar */}
              <div className="px-6 py-2.5 bg-amber-500/[0.03] dark:bg-amber-400/[0.02] border-b border-amber-200/5 dark:border-neutral-800/30 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
                <span>Set your daily goals. Use the Focus button to display a task on your active timer screen.</span>
              </div>

              {/* Task Form */}
              <form onSubmit={handleSubmit} className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Focus target description..."
                    maxLength={100}
                    className={`flex-1 px-4 py-2 rounded-xl border border-neutral-250 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 ${
                      mode === 'focus'
                        ? 'focus:ring-amber-500 focus:border-amber-500/40'
                        : mode === 'shortBreak'
                        ? 'focus:ring-emerald-500 focus:border-emerald-500/40'
                        : 'focus:ring-indigo-500 focus:border-indigo-500/40'
                    }`}
                  />
                  <button
                    type="submit"
                    className={`px-4.5 py-2 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm hover:scale-[1.01] active:scale-97 transition-all duration-200 cursor-pointer ${
                      mode === 'focus'
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                        : mode === 'shortBreak'
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                        : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/10'
                    }`}
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* Tasks list */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2 max-h-[35vh]">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-450 dark:text-neutral-500 gap-1.5">
                    <p className="text-xs font-sans">No tasks yet. Create one above to guide your session.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          task.completed
                            ? 'bg-neutral-50/30 dark:bg-neutral-950/10 border-neutral-200/40 dark:border-neutral-850/40 opacity-50'
                            : task.isFocused
                            ? 'bg-amber-500/[0.04] border-amber-500/25 dark:border-amber-400/15 shadow-sm'
                            : 'bg-white dark:bg-neutral-950/40 border-neutral-200/80 dark:border-neutral-850/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                          {/* Toggle Button / Minimal Circular Ring Indicator */}
                          <button
                            type="button"
                            onClick={() => {
                              onToggleTask(task.id);
                              audioEngine.playSubtleClick();
                            }}
                            className="focus:outline-none select-none shrink-0 cursor-pointer"
                          >
                            <div className={`w-4 h-4 rounded-full border transition-all duration-300 flex items-center justify-center ${
                              task.completed
                                ? mode === 'focus'
                                  ? 'bg-amber-500 border-amber-500 shadow-sm shadow-amber-500/25'
                                  : mode === 'shortBreak'
                                  ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/25'
                                  : 'bg-indigo-500 border-indigo-500 shadow-sm shadow-indigo-500/25'
                                : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                            }`}>
                              {task.completed && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-1.5 h-1.5 rounded-full bg-[#FCFAF2] dark:bg-neutral-900"
                                />
                              )}
                            </div>
                          </button>
                          
                          <span className={`text-xs font-medium truncate font-sans text-neutral-800 dark:text-neutral-200 transition-colors ${
                            task.completed ? 'line-through text-neutral-400 dark:text-neutral-600' : ''
                          }`}>
                            {task.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Focus Toggle */}
                          {!task.completed && (
                            <button
                              type="button"
                              onClick={() => {
                                onSetFocusedTask(task.isFocused ? null : task.id);
                                audioEngine.playSubtleClick();
                              }}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded-md border transition-all duration-200 uppercase tracking-wider cursor-pointer ${
                                task.isFocused
                                  ? mode === 'focus'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    : mode === 'shortBreak'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                                  : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 border-transparent hover:border-neutral-200 dark:hover:border-neutral-800'
                              }`}
                            >
                              {task.isFocused ? 'Focused' : 'Focus'}
                            </button>
                          )}

                          {/* Delete Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteTask(task.id);
                              audioEngine.playSubtleClick();
                            }}
                            className="px-2 py-0.5 text-[9px] font-bold text-neutral-400 hover:text-rose-500 dark:text-neutral-500 dark:hover:text-rose-400 transition-all rounded-md border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 cursor-pointer uppercase tracking-wider"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-amber-100/[0.02] dark:bg-neutral-950/20 px-6 py-4 flex items-center justify-between border-t border-amber-200/10 dark:border-neutral-800/40">
              <button
                type="button"
                onClick={onClearCompleted}
                disabled={completedTasksCount === 0}
                className="text-neutral-450 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 disabled:opacity-30 disabled:hover:text-neutral-450 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Clear Completed ({completedTasksCount})
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`px-4.5 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-md transition-all duration-300 active:scale-95 hover:scale-[1.02] cursor-pointer ${
                  mode === 'focus'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                    : mode === 'shortBreak'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                    : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/10'
                }`}
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
