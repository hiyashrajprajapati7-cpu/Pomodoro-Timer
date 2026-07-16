import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { TimerMode } from '../types';

interface FooterBannerProps {
  timerState: 'idle' | 'running' | 'paused';
  onStartFocusing: () => void;
  onSetFocusLength: (mins: number) => void;
  onShowToast: (message: string, submessage: string, type: 'success' | 'info' | 'alarm') => void;
}

export function FooterBanner({
  timerState,
  onStartFocusing,
  onSetFocusLength,
  onShowToast,
}: FooterBannerProps) {
  
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'top') {
      const topEl = document.getElementById('top-marker');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleInstallClick = () => {
    onShowToast(
      'Install Pomodoro Timer',
      'Click the share/install icon in your browser address bar to save this app to your homescreen as a native PWA!',
      'success'
    );
  };

  const handleCommunityClick = () => {
    onShowToast(
      'Join our Community',
      'Our deep focus Discord is coming soon! Stay tuned and keep growing your streak offline.',
      'info'
    );
  };

  const handleTwentyFiveMinTimerClick = () => {
    onSetFocusLength(25);
    handleScrollTo('top');
  };

  return (
    <div className="w-full bg-black text-white py-12 md:py-20 mt-16 md:mt-24 font-sans select-none" id="website-cta-footer">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col gap-12 md:gap-16">
        
        {/* 1. Organic Pebble Black Card (Start Your Streak Today) */}
        <div className="relative w-full max-w-5xl mx-auto py-16 md:py-24 px-6 md:px-12 bg-[#050505] border border-neutral-900 rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
          {/* Subtle gold decorative glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-4.5 max-w-2xl">
            <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.25em] text-amber-500/80 uppercase">
              No Account Needed
            </span>
            
            <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-white leading-tight">
              Start your streak today.
            </h2>
            
            <motion.button
              whileHover={{ scale: 1.04, shadow: '0 0 20px rgba(245,158,11,0.2)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartFocusing}
              className="mt-4 px-7 py-3.5 bg-[#c5a165] hover:bg-[#b38e52] text-white font-sans font-semibold text-xs md:text-sm rounded-full flex items-center justify-center gap-2.5 shadow-[0_12px_24px_-10px_rgba(197,161,101,0.45)] transition-all duration-300 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Start focusing</span>
            </motion.button>
          </div>
        </div>

        {/* 2. Divider line in the footer */}
        <div className="w-full h-px bg-neutral-900 max-w-5xl mx-auto" />

        {/* 3. Footer Links Grid/Row */}
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4 text-xs">
          
          {/* Left Block: Logo + Attribution */}
          <div className="flex flex-col gap-1.5 max-w-xs text-left">
            <span className="text-sm font-bold tracking-tight text-white font-sans">
              Pomodoro Timer
            </span>
            <span className="text-[11px] text-neutral-500 leading-normal font-sans">
              Inspired by the <a href="https://pomodorotimer.online/" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-400">Pomodoro Technique</a>. Developed by Yashraj.
            </span>
          </div>

          {/* Center Links Block */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-neutral-400 font-sans font-medium">
            <button 
              onClick={() => handleScrollTo('top')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Timer
            </button>
            <button 
              onClick={() => handleScrollTo('key-features-section')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => handleScrollTo('how-it-works-section')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Method
            </button>
            <button 
              onClick={handleInstallClick}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Install
            </button>
            <button 
              onClick={handleTwentyFiveMinTimerClick}
              className="hover:text-white transition-colors cursor-pointer font-semibold text-amber-500/90 hover:text-amber-400"
            >
              25 minute timer
            </button>
            <button 
              onClick={handleCommunityClick}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Community
            </button>
          </div>

          {/* Right Block: Copyright */}
          <div className="text-[11px] text-neutral-500 font-sans">
            © {new Date().getFullYear()} Pomodoro
          </div>

        </div>

      </div>
    </div>
  );
}
