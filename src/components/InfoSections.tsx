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
      question: 'What is a Pomodoro Timer?',
      answer: 'A Pomodoro Timer is a minimalist time-management tool designed to structure your work or study sessions into highly focused intervals (traditionally 25 minutes long) called "Pomodoros." These periods of intense cognitive activity are separated by short restorative breaks, allowing the brain to consolidate learning, restore executive function, and prevent mental exhaustion.'
    },
    {
      question: 'Is Pomodoro 50/10 or 25/5 better?',
      answer: 'Neither method is universally superior; it depends entirely on your task complexity and personal focus limits. The classic 25/5 schedule (25 minutes of focus, 5 minutes of rest) is perfect for overcoming procrastination, quick drills, or repetitive studies. The 50/10 schedule is ideal for deeper, complex cognitive tasks like writing, designing, or programming, where getting into a state of "flow" requires a longer uninterrupted window of time.'
    },
    {
      question: 'What is the Pomodoro 90 20 rule?',
      answer: 'The Pomodoro 90/20 rule, also known as the Ultradian Rhythm technique, involves working with undivided attention for 90 minutes followed by a deep restorative 20-minute break. This cycle aligns with the human body\'s natural ultradian rhythm waves of cognitive energy. Practicing 90/20 blocks is fantastic for heavy focus sessions and prevents long-term executive fatigue.'
    },
    {
      question: 'Does Elon Musk use Pomodoro?',
      answer: 'No, Elon Musk does not use the standard Pomodoro Technique. Instead, he famously uses a system called "Time Blocking" or "Time Boxing," where he schedules his entire day in high-intensity, pre-defined 5-minute segments. Although the scale is tighter, both methods share the identical core philosophy: eliminating multitasking by committing 100% of your attention to a single dedicated block.'
    },
    {
      question: 'How many pomodoros is 1 hour?',
      answer: 'In exactly 1 hour (60 minutes), you can complete 2 standard Pomodoro rounds. Each complete round consists of a 25-minute focused work session followed by a 5-minute short restorative break, which sums to 30 minutes. Completing two cycles back-to-back perfectly fills a 60-minute window.'
    },
    {
      question: 'Is Pomodoro 20 minutes or 25 minutes?',
      answer: 'The official, classic Pomodoro session is exactly 25 minutes long, designed by Francesco Cirillo. However, modern productivity apps allow you to tailor the duration to your workflow—such as 20-minute cycles for lightweight tasks, or 50-minute blocks for deep work. The essential rule is to maintain a strict, structured boundary between active attention and complete rest.'
    },
    {
      question: 'Why is it called a Pomodoro Timer?',
      answer: 'The system is named after the tomato-shaped kitchen timer ("pomodoro" means tomato in Italian) that its inventor, Francesco Cirillo, used during his university studies to track his focused blocks. The tomato represents any dedicated interval of uninterrupted attention.'
    },
    {
      question: 'How does a Pomodoro Timer work?',
      answer: 'A Pomodoro Timer works by leveraging structured timing blocks and neural intervals to optimize focus: 1) Choose one single task on your checklist. 2) Start the 25-minute study timer. 3) Work with singular commitment until the bell rings. 4) Take a 5-minute break to detach from screens. 5) Repeat this cycle 4 times, then reward yourself with a long 15–30 minute break.'
    },
    {
      question: 'How to use Pomodoro Timer apps effectively?',
      answer: 'To use Pomodoro Timer apps effectively, start by removing digital friction—turn off notifications, put your phone away, and close unrelated tabs. Next, activate ambient background noises or science-backed binaural alpha waves to block background distractions. Finally, respect your breaks; do not scroll social media or read work emails during your 5-minute rests. Instead, stretch, walk, or drink water to let your brain\'s default mode network recharge.'
    },
    {
      question: 'How to add a Pomodoro Timer to Notion?',
      answer: 'Adding our cute, aesthetic Pomodoro Timer to Notion is extremely easy. Simply copy our website URL (https://pomodoro-timer.online/ or your custom shared preview link), open your Notion workspace page, paste the link where you want the timer, and select "Create Embed" from the pop-up menu. You can then resize the block to beautifully position the minimalist timer directly next to your database, notes, or planner.'
    },
    {
      question: 'How do you make a Pomodoro Timer?',
      answer: 'A custom Pomodoro Timer is made using modern web standards like React, TypeScript, and Tailwind CSS. The core engine uses a stateful countdown countdown loop (via setInterval), wrapped in an aesthetic visual interface with custom ambient audio channels and local storage persistence. This application is an example of an advanced, modern study timer built using responsive, high-performance web engineering.'
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

      {/* 4. COMPREHENSIVE SEO GUIDE SECTION */}
      <section className="flex flex-col gap-8 md:gap-12 pt-16 border-t border-neutral-200/20 dark:border-neutral-800/20" id="seo-comprehensive-guide">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 text-left">
          <div className="inline-flex items-center justify-center gap-1.5 self-start px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200/20">
            <Timer className="w-3.5 h-3.5" />
            <span>Deep Dive Guide</span>
          </div>

          <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            The Ultimate Guide to Using the Pomodoro Technique
          </h2>

          <div className="space-y-6 text-xs md:text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed font-sans">
            <p>
              When it comes to boosting productivity and staying inside a flow state, using a high-quality <strong>pomodoro timer</strong> is one of the most effective strategies you can adopt. Whether you are studying for final exams, coding an intensive software program, or writing an article, finding the <strong>best pomodoro timer</strong> that fits your visual setup is crucial. Our <strong>aesthetic pomodoro timer online</strong> is designed specifically to combine minimalist beauty with focus-boosting features. This is more than just a standard kitchen clock; it is a fully integrated workspace companion crafted to optimize your cognitive stamina. As a 100% <strong>free pomodoro timer</strong>, you can access professional deep-focus tools instantly, helping you manage your energy levels day and night.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="p-5.5 rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-900/10">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs md:text-sm mb-2 font-mono uppercase tracking-wide flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.accent}`} />
                  Why 25 Minutes Work Blocks?
                </h3>
                <p className="text-[11px] md:text-xs leading-relaxed text-neutral-500 dark:text-neutral-450">
                  At its core, a traditional <strong>pomodoro timer 25 minutes</strong> session breaks down massive, daunting projects into manageable chunks of uninterrupted attention. Modern neuroscience reveals that the human brain can only maintain peak cognitive alertness for about 20 to 30 minutes before fatigue begins to creep in. By setting an <strong>online pomodoro timer</strong> for 25 minutes, you create an artificial deadline that triggers healthy urgency. Once the countdown concludes, a short break allows your brain to reset and store what you just learned.
                </p>
              </div>

              <div className="p-5.5 rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-900/10">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs md:text-sm mb-2 font-mono uppercase tracking-wide flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.accent}`} />
                  An App Built For True Immersion
                </h3>
                <p className="text-[11px] md:text-xs leading-relaxed text-neutral-500 dark:text-neutral-450">
                  Not all focus applications are created equal. Many online tools are cluttered with ads, complex configurations, or paywalls that break your immersion. When designing this <strong>pomodoro timer app</strong>, we prioritized absolute simplicity and custom audio triggers. Our <strong>free pomodoro timer</strong> combines custom-blended ambient noises, science-backed binaural alpha/gamma waves, and integrated Spotify focus stations to build an impenetrable wall of sound, making it the premier <strong>online pomodoro timer</strong> for daily studying.
                </p>
              </div>
            </div>

            <h3 className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
              Tips to Maximize Your Aesthetic Pomodoro Time Sessions
            </h3>

            <p>
              To get the absolute most out of your <strong>aesthetic pomodoro timer online</strong> experience, follow these practical steps:
            </p>

            <ul className="list-disc pl-5 space-y-2.5 text-[11px] md:text-xs text-neutral-550 dark:text-neutral-450">
              <li>
                <strong>Prep Your Tasks First:</strong> Before pressing play, list your tasks in our built-in checklist. Never spend your active countdown deciding what to work on.
              </li>
              <li>
                <strong>Commit Fully to the Interval:</strong> If you get a sudden urge to check your phone or look up a random fact, write it down on your scratchpad and instantly return to your active <strong>pomodoro timer</strong> screen.
              </li>
              <li>
                <strong>Protect Your Rest Periods:</strong> Do not stay glued to your screen during the break! Stand up, stretch your back, drink some water, or look out of a window. True rest allows your cognitive reserves to rebuild.
              </li>
              <li>
                <strong>Utilize Audio Shielding:</strong> Put on a pair of noise-canceling headphones, turn on the rain or forest sounds in our ambient mixer, and select one of our curated lofi stations to build your private sanctuary.
              </li>
            </ul>

            <p className="pt-2 text-[11px] md:text-xs border-t border-neutral-100 dark:border-neutral-850 text-neutral-400 dark:text-neutral-500 italic">
              By combining the timeless structure of the classical time-management technique with state-of-the-art sensory tools and clean visual cues, this is the ultimate <strong>pomodoro timer app</strong> engineered to turn procrastination into progress.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
