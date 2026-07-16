import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, BookOpen, Sparkles, Timer, CheckCircle2, 
  HelpCircle, Volume2, Sliders, Keyboard, ShieldCheck, 
  Brain, Coffee, Zap, Moon
} from 'lucide-react';
import { TimerMode } from '../types';

interface InfoSectionsProps {
  mode: TimerMode;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepItem {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: string;
}

export function InfoSections({ mode }: InfoSectionsProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dynamic Theme Styling depending on focus/break mode
  const getColors = () => {
    switch (mode) {
      case 'shortBreak':
        return {
          accent: 'text-emerald-600 dark:text-emerald-400',
          bgAccent: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          borderAccent: 'border-emerald-500/20 dark:border-emerald-500/35',
          ringAccent: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          hoverAccent: 'hover:border-emerald-500/30 hover:bg-emerald-500/5',
          stepBg: 'bg-emerald-50 dark:bg-emerald-950/20',
          pillBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        };
      case 'longBreak':
        return {
          accent: 'text-indigo-600 dark:text-indigo-400',
          bgAccent: 'bg-indigo-500/10 dark:bg-indigo-500/20',
          borderAccent: 'border-indigo-500/20 dark:border-indigo-500/35',
          ringAccent: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
          hoverAccent: 'hover:border-indigo-500/30 hover:bg-indigo-500/5',
          stepBg: 'bg-indigo-50 dark:bg-indigo-950/20',
          pillBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
        };
      case 'focus':
      default:
        return {
          accent: 'text-amber-650 dark:text-amber-400',
          bgAccent: 'bg-amber-500/10 dark:bg-amber-400/20',
          borderAccent: 'border-amber-500/20 dark:border-amber-400/35',
          ringAccent: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
          hoverAccent: 'hover:border-amber-500/30 hover:bg-amber-500/5',
          stepBg: 'bg-amber-50/50 dark:bg-amber-950/20',
          pillBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        };
    }
  };

  const colors = getColors();

  const steps: StepItem[] = [
    {
      number: '01',
      icon: <Brain className="w-5 h-5" />,
      title: 'Define Your Focus',
      description: 'Choose a single, distinct task to accomplish. Turn off messaging notifications and close unrelated tabs to establish high cognitive readiness.',
      duration: 'Prep Goal: 1-2 min'
    },
    {
      number: '02',
      icon: <Timer className="w-5 h-5" />,
      title: 'Deep Focus Round',
      description: 'Work with single-minded focus for 25 minutes. If a random thought distracts you, quickly jot it down on your task board and return to flow.',
      duration: 'Focus Interval: 25 min'
    },
    {
      number: '03',
      icon: <Coffee className="w-5 h-5" />,
      title: 'Mindful Short Break',
      description: 'Step away from all screens. Drink a glass of water, do light stretching, or take deep breaths. Let your memory digest information offline.',
      duration: 'Rest Interval: 5 min'
    },
    {
      number: '04',
      icon: <Zap className="w-5 h-5" />,
      title: 'Consolidation & Long Rest',
      description: 'After completing 4 productive focus rounds, reward yourself with a restorative long break to prevent mental fatigue and build healthy habits.',
      duration: 'Long Rest: 15-30 min'
    }
  ];

  const features: FeatureItem[] = [
    {
      icon: <Volume2 className="w-5 h-5" />,
      title: 'Multi-Channel Ambient Mixer',
      description: 'Custom synthesize natural soundscapes! Mix campfire crackles, ocean waves, forest winds, and rain with binaural alpha/gamma waves designed to lock you into focus.'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Zero-Distraction Theatre Mode',
      description: 'Click the fullscreen icon to launch an immersive full-screen focus visualizer featuring a soft, breathing focal ring that centers your attention.'
    },
    {
      icon: <Sliders className="w-5 h-5" />,
      title: 'Granular Customization',
      description: 'Tailor the time segments precisely to your cognitive limits. Adjust focus rounds, short rests, long rests, and daily targeted session metrics in real-time.'
    },
    {
      icon: <Keyboard className="w-5 h-5" />,
      title: 'Instant Keyboard Hotkeys',
      description: 'Zero mouse lag! Seamlessly control your flow with tactile shortcuts: Space to toggle play/pause, R to reset the clock, and F to cycle fullscreen.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: 'Privacy-First & Offline Storage',
      description: 'Your focus data is private. There are no registrations, trackers, or cookies. All history is kept entirely inside your secure local container.'
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: 'Daily Progress Indicators',
      description: 'Beautiful progress nodes help track focus cycles completed throughout the day. Watch your streak grow and reset each morning.'
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: 'What is the Pomodoro Technique and how does it prevent burnout?',
      answer: 'Created by Francesco Cirillo in the late 1980s, the Pomodoro Technique is a time management philosophy that breaks work into focused 25-minute intervals (called "Pomodoros") separated by 5-minute rests. By scheduling regular intervals of deep focus alongside restorative mini-breaks, it preserves executive function, eliminates cognitive fatigue, and prevents mental burnout.'
    },
    {
      question: 'How do Focus Soundscapes and Binaural Beats enhance deep work?',
      answer: 'Focus sounds act as auditory shielding, masking sudden background noise that would otherwise trigger startle responses in your brain. Binaural beats send slightly different frequencies to each ear (e.g., 160Hz and 200Hz), encouraging the neural pathways to synchronize into a 40Hz Gamma state (associated with high memory retention and focus) or a 10Hz Alpha state (associated with relaxed alert flow).'
    },
    {
      question: 'Can I customize the timer lengths for my own workflow?',
      answer: 'Absolutely! Click the settings gear in the top right to adjust your Focus session length (e.g. 50 minutes for longer flow states), Short Break durations (e.g. 10 minutes), Long Break intervals, and even your overall daily session target.'
    },
    {
      question: 'Are there keyboard shortcuts to handle the app quickly?',
      answer: 'Yes, this app supports professional keyboard navigation. Press Space to instantly Play/Pause the countdown, R to Reset the clock, and F to jump into or out of the immersive focus view.'
    },
    {
      question: 'Does the website track my work or collect telemetry?',
      answer: 'No. This app is designed with a strict offline-first, local-only architecture. Your progress and customized configurations reside entirely on your device inside secure client storage, ensuring total privacy.'
    },
    {
      question: 'Is it free to use for daily studying and productivity?',
      answer: 'Yes, this tool is 100% open, fully unlocked, and clean. There are no paywalls, premium-locked sounds, limits on daily focus sessions, or flashing display ads.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 py-12 md:py-20 flex flex-col gap-16 md:gap-24 relative select-none">
      
      {/* 1. HOW IT WORKS SECTION */}
      <section className="flex flex-col gap-8 md:gap-12" id="how-it-works-section">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <div className="inline-flex items-center justify-center gap-1.5 self-center px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master Your Time</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            How the Pomodoro System Works
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The core recipe is simple but incredibly effective. It leverages brain biology to optimize learning speed, focus retention, and task speed.
          </p>
        </div>

        {/* Step-by-Step visual timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`relative flex flex-col gap-4 p-6.5 rounded-2xl border transition-all duration-300 ${colors.stepBg} border-neutral-100/30 dark:border-neutral-850/30 hover:scale-[1.02] hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold tracking-widest ${colors.accent}`}>
                  {step.number}
                </span>
                <div className={`p-2 rounded-xl ${colors.bgAccent} ${colors.accent}`}>
                  {step.icon}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 font-sans">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans min-h-[72px]">
                  {step.description}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-neutral-200/20 dark:border-neutral-800/20">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide uppercase ${colors.pillBg}`}>
                  {step.duration}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. KEY FEATURES SECTION */}
      <section className="flex flex-col gap-8 md:gap-12" id="key-features-section">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <div className="inline-flex items-center justify-center gap-1.5 self-center px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powerhouse Toolset</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Engineered for Deep Flow
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Unlike basic default clocks, our focus environment integrates advanced clinical sound synthesis and seamless tactile shortcuts to reduce distraction friction to zero.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (index % 3) * 0.08, duration: 0.4 }}
              className={`p-6.5 rounded-2xl border border-neutral-250/20 dark:border-neutral-850 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm flex flex-col gap-3.5 transition-all duration-300 ${colors.hoverAccent}`}
            >
              <div className={`p-2 w-fit rounded-xl ${colors.bgAccent} ${colors.accent}`}>
                {feat.icon}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 font-sans">
                  {feat.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className="flex flex-col gap-8 md:gap-12" id="faq-section">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <div className="inline-flex items-center justify-center gap-1.5 self-center px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border border-indigo-200/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Queries</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Everything you need to know about productivity science, binaural audio mechanics, and setup guides.
          </p>
        </div>

        {/* Collapsible Accordion Lists */}
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-neutral-200/30 dark:border-neutral-850/50 bg-white/30 dark:bg-neutral-900/20 backdrop-blur-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6.5 py-4.5 flex items-center justify-between text-left gap-4 font-sans focus:outline-none"
                >
                  <span className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-neutral-550 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6.5 pb-5 pt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans border-t border-neutral-200/10 dark:border-neutral-800/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
