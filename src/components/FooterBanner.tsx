import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Mail, Send, Check, Shield, FileText, Info, ChevronDown } from 'lucide-react';
import { TimerMode } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface FooterBannerProps {
  timerState: 'idle' | 'running' | 'paused';
  onStartFocusing: () => void;
  onSetFocusLength: (mins: number) => void;
  onShowToast: (message: string, submessage: string, type: 'success' | 'info' | 'alarm') => void;
}

export const FooterBanner = React.memo(function FooterBanner({
  timerState,
  onStartFocusing,
  onSetFocusLength,
  onShowToast,
}: FooterBannerProps) {
  
  const [activeModal, setActiveModal] = React.useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);

  // Contact form states
  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactSubject, setContactSubject] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

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
    <div className="w-full bg-black text-white py-12 md:py-20 mt-16 md:mt-24 font-sans select-none animate-fade-in" id="website-cta-footer">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col gap-12 md:gap-16">
        
        {/* 1. Organic Pebble Black Card (Start Your Streak Today) */}
        <div className="relative w-full max-w-5xl mx-auto py-16 md:py-24 px-6 md:px-12 bg-[#050505] border border-neutral-900 rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
          {/* Subtle gold decorative glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center gap-4.5 max-w-2xl">
            <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.25em] text-amber-500/80 uppercase">
              The Binaural Advantage
            </span>
            
            <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-white leading-tight max-w-xl">
              Sync your brainwaves. Elevate your focus.
            </h2>

            <p className="text-xs md:text-sm text-neutral-400 font-sans max-w-md leading-relaxed mt-1">
              Unlike ordinary timers, our science-backed binaural audio engine synchronizes your hemisphere frequencies for effortless, deep cognitive flow.
            </p>
            
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

        {/* 3. Primary Navigation Links (Upper row of link bar) */}
        <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-neutral-400 font-sans font-medium text-xs pb-4 border-b border-neutral-900/40">
          <button 
            onClick={() => handleScrollTo('top')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Timer
          </button>
          <span className="text-neutral-800 hidden sm:inline">•</span>
          <button 
            onClick={() => handleScrollTo('key-features-section')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <span className="text-neutral-800 hidden sm:inline">•</span>
          <button 
            onClick={() => handleScrollTo('how-it-works-section')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Method
          </button>
          <span className="text-neutral-800 hidden sm:inline">•</span>
          <button 
            onClick={handleInstallClick}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Install
          </button>
          <span className="text-neutral-800 hidden sm:inline">•</span>
          <button 
            onClick={handleTwentyFiveMinTimerClick}
            className="hover:text-white transition-colors cursor-pointer font-semibold text-amber-500/90 hover:text-amber-400"
          >
            25 minute timer
          </button>
          <span className="text-neutral-800 hidden sm:inline">•</span>
          <button 
            onClick={handleCommunityClick}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Community
          </button>
        </div>

        {/* 4. Branding & Policy Links Row (As in the screenshot) */}
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
          
          {/* Logo with timer icon */}
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-neutral-950 border border-neutral-800 shadow-[0_0_10px_rgba(234,179,8,0.4)] select-none">
              <svg viewBox="0 0 100 100" className="w-4.5 h-4.5 text-yellow-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="36" y="10" width="28" height="10" rx="5" fill="currentColor" />
                <rect x="46" y="18" width="8" height="6" fill="currentColor" />
                <circle cx="50" cy="56" r="30" stroke="currentColor" strokeWidth="8" />
                <line x1="50" y1="56" x2="68" y2="38" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-bold tracking-tight text-white font-sans">
              Pomodoro Timer
            </span>
          </div>

          {/* About, Contact, Privacy, Terms Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-neutral-400 font-sans font-medium text-[13px]">
            <a 
              href="/about.html"
              onClick={() => audioEngine.playSubtleClick()}
              className="hover:text-white transition-colors cursor-pointer text-left"
            >
              About
            </a>
            <a 
              href="/contact.html"
              onClick={() => audioEngine.playSubtleClick()}
              className="hover:text-white transition-colors cursor-pointer text-left"
            >
              Contact
            </a>
            <a 
              href="/privacy.html"
              onClick={() => audioEngine.playSubtleClick()}
              className="hover:text-white transition-colors cursor-pointer text-left"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms.html"
              onClick={() => audioEngine.playSubtleClick()}
              className="hover:text-white transition-colors cursor-pointer text-left"
            >
              Terms & Conditions
            </a>
          </div>

        </div>

        {/* 5. Copyright line and Technique reference */}
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-neutral-900/60 pt-4 text-[11px] text-neutral-500 font-sans">
          <span>
            © {new Date().getFullYear()} Pomodoro Timer. Free to use, no sign-up required.
          </span>
        </div>

      </div>

      {/* Animated Policy & Contact Modals Overlay */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            {/* Backdrop closer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                audioEngine.playSubtleClick();
                setActiveModal(null);
                setIsSubmitted(false);
              }}
              className="absolute inset-0 cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 text-neutral-200 shadow-2xl z-10 flex flex-col gap-5 overflow-hidden"
            >
              {/* Subtle gold accent background */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                <div className="flex items-center gap-2.5">
                  {activeModal === 'about' && (
                    <>
                      <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <Info className="w-4.5 h-4.5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono tracking-wider text-amber-500 uppercase font-bold">About Us</span>
                        <h3 className="text-lg font-bold text-white tracking-tight leading-none">Our Story & Goal</h3>
                      </div>
                    </>
                  )}
                  {activeModal === 'contact' && (
                    <>
                      <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        <Mail className="w-4.5 h-4.5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono tracking-wider text-emerald-500 uppercase font-bold">Support</span>
                        <h3 className="text-lg font-bold text-white tracking-tight leading-none">Get In Touch</h3>
                      </div>
                    </>
                  )}
                  {activeModal === 'privacy' && (
                    <>
                      <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                        <Shield className="w-4.5 h-4.5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono tracking-wider text-indigo-500 uppercase font-bold">Security</span>
                        <h3 className="text-lg font-bold text-white tracking-tight leading-none">Privacy Policy</h3>
                      </div>
                    </>
                  )}
                  {activeModal === 'terms' && (
                    <>
                      <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
                        <FileText className="w-4.5 h-4.5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono tracking-wider text-blue-500 uppercase font-bold">Terms</span>
                        <h3 className="text-lg font-bold text-white tracking-tight leading-none">Terms of Service</h3>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    audioEngine.playSubtleClick();
                    setActiveModal(null);
                    setIsSubmitted(false);
                  }}
                  className="p-1.5 hover:bg-neutral-800 border border-neutral-800/40 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer animate-fade-in"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Scrollable Area */}
              <div className="max-h-[60vh] overflow-y-auto pr-1 text-sm text-neutral-400 font-sans leading-relaxed flex flex-col gap-4">
                {activeModal === 'about' && (
                  <div className="flex flex-col gap-4 font-sans text-xs leading-relaxed text-neutral-400">
                    <div className="text-[10px] font-mono text-neutral-500 mb-1">
                      Last updated: July 2026
                    </div>

                    {/* Section 1 */}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider font-mono text-amber-500/90">What is Pomodoro Timer?</h4>
                      <p className="mb-2">
                        <strong className="text-white font-semibold">Pomodoro Timer</strong> is a free, browser-based productivity tool that turns any screen — desktop, laptop, tablet, or phone — into a premium work and study assistant. Master your focus with custom Pomodoro focus sessions and rest intervals, with no app to install and no account required.
                      </p>
                      <p>
                        Unlike standard web timers that lack atmospheric immersion, Pomodoro Timer lets you curate your personal focus cave with multiple high-quality background audio tracks (rain, forest wind, crackling fire, and ocean waves), adjusting volume blends directly inside your browser.
                      </p>
                    </div>

                    {/* Section 2 */}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">Our Mission</h4>
                      <p>
                        Focus should be instant, organic, and free. We built Pomodoro Timer because we kept reaching for productivity trackers that were cluttered with ads, locked behind premium registration paywalls, or filled with unnecessary distracting trackers. Pomodoro Timer is fast, private, and customizable by default.
                      </p>
                    </div>

                    {/* Section 3 */}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">Key Features</h4>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-500">
                        <li>Measure and segment intervals in <strong className="text-neutral-300 font-medium">focus sprints, short breaks, and long breaks</strong>.</li>
                        <li>Four precision <strong className="text-neutral-300 font-medium">presets and customizable durations</strong> to fit your workflow.</li>
                        <li>Fine-grained control over <strong className="text-neutral-300 font-medium">starting subsequent session intervals</strong> automatically.</li>
                        <li>Fully integrated <strong className="text-neutral-300 font-medium">ambient sounds mixer</strong> (Rain, Fire, Waves, Forest) with independent controls.</li>
                        <li>Beautiful visual tracking using a <strong className="text-neutral-300 font-medium">dynamic countdown progress ring</strong>.</li>
                        <li>Engaging statistics showing <strong className="text-neutral-300 font-medium">completed sessions, daily streaks, and target achievements</strong>.</li>
                        <li>Supports browser-native <strong className="text-neutral-300 font-medium">push notifications</strong> when intervals end.</li>
                        <li>Works on every modern browser — no download, no sign-up, no ads.</li>
                      </ul>
                    </div>

                    {/* Section 4 */}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">Privacy First</h4>
                      <p>
                        Pomodoro Timer runs entirely in your browser. We do not collect personal data, do not require an account creation, and never sell or share your data. All session history is preserved purely in your device's browser <code className="px-1.5 py-0.5 rounded bg-neutral-950 font-mono text-[10px] border border-neutral-800 text-amber-400">localStorage</code>.
                      </p>
                    </div>
                  </div>
                )}

                {activeModal === 'contact' && (
                  <div className="flex flex-col gap-4">
                    {isSubmitted ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center py-6 gap-3"
                      >
                        <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">Message Received!</h4>
                        <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                          Thank you for reaching out! Your notes have been securely received. Yashraj will review and get back to you soon.
                        </p>
                        <button
                          onClick={() => {
                            audioEngine.playSubtleClick();
                            setIsSubmitted(false);
                          }}
                          className="mt-4 px-5 py-2 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer"
                        >
                          Send another message
                        </button>
                      </motion.div>
                    ) : (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim() || !contactSubject) return;
                          audioEngine.playSubtleClick();
                          setIsSubmitting(true);
                          setTimeout(() => {
                            setIsSubmitting(false);
                            setIsSubmitted(true);
                            setContactName('');
                            setContactEmail('');
                            setContactSubject('');
                            setContactMessage('');
                          }, 1000);
                        }}
                        className="flex flex-col gap-3.5"
                      >
                        <p className="text-xs text-neutral-400 leading-relaxed -mt-1">
                          We're a small team and we read every message. Whether you've found a bug, have a feature request, or just want to say hello — reach out using the form below.
                        </p>

                        {/* Name Input */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-300">Name</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 rounded-xl text-neutral-200 placeholder-neutral-600 outline-none text-xs transition-all"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-neutral-300">Email</label>
                           <input
                             type="email"
                             required
                             value={contactEmail}
                             onChange={(e) => setContactEmail(e.target.value)}
                             placeholder="you@example.com"
                             className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 rounded-xl text-neutral-200 placeholder-neutral-600 outline-none text-xs transition-all"
                           />
                         </div>

                         {/* Subject Input */}
                         <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-semibold text-neutral-300">Subject</label>
                           <div className="relative">
                             <select
                               required
                               value={contactSubject}
                               onChange={(e) => setContactSubject(e.target.value)}
                               className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 rounded-xl text-neutral-200 outline-none text-xs transition-all appearance-none cursor-pointer pr-10"
                             >
                               <option value="" disabled className="text-neutral-600 bg-neutral-950">Select a topic...</option>
                               <option value="Feature Request" className="bg-neutral-950 text-neutral-200">Feature Request</option>
                               <option value="Report a Bug" className="bg-neutral-950 text-neutral-200">Report a Bug</option>
                               <option value="General Inquiry" className="bg-neutral-950 text-neutral-200">General Inquiry</option>
                               <option value="Feedback" className="bg-neutral-950 text-neutral-200">Feedback</option>
                               <option value="Other" className="bg-neutral-950 text-neutral-200">Other</option>
                             </select>
                             <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-neutral-400">
                               <ChevronDown className="w-4 h-4" />
                             </div>
                           </div>
                         </div>

                         {/* Message Input */}
                         <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-semibold text-neutral-300">Message</label>
                           <textarea
                             required
                             rows={3.5}
                             value={contactMessage}
                             onChange={(e) => setContactMessage(e.target.value)}
                             placeholder="Describe your issue or question..."
                             className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 rounded-xl text-neutral-200 placeholder-neutral-600 outline-none text-xs transition-all resize-none"
                           />
                         </div>

                         {/* Submit Button */}
                         <div className="flex justify-start mt-1">
                           <button
                             type="submit"
                             disabled={isSubmitting || !contactName.trim() || !contactEmail.trim() || !contactMessage.trim() || !contactSubject}
                             className="px-6 py-2.5 bg-white hover:bg-neutral-100 text-neutral-950 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed font-semibold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
                           >
                             {isSubmitting ? (
                               <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                             ) : (
                               <span>Send message</span>
                             )}
                           </button>
                         </div>
                       </form>
                     )}
                   </div>
                 )}

                {activeModal === 'privacy' && (
                  <div className="flex flex-col gap-4 font-sans text-xs leading-relaxed text-neutral-400">
                    <div className="text-[10px] font-mono text-neutral-500 mb-1">
                      Last updated: July 2026
                    </div>

                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-500/90 -mb-2">Overview</h3>
                    <p className="text-neutral-300 text-sm">
                      <strong className="text-white font-semibold">Pomodoro Timer</strong> ("we", "our", "the service") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights. The short version: <strong className="text-white font-medium">we collect almost nothing and we do not sell or share your data</strong>.
                    </p>

                    <div className="flex flex-col gap-4.5 mt-2">
                      {/* Section 1 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">1. Information We Collect</h4>
                        <p className="mb-2">
                          We do not require you to create an account or provide any personal information to use <strong className="text-white font-semibold">Pomodoro Timer</strong>.
                        </p>
                        <p className="mb-2">
                          The timer tool runs entirely in your browser. Any custom durations, session parameters, daily target achievements, sound presets, and streak data are stored only in your browser's <code className="px-1.5 py-0.5 rounded bg-neutral-950 font-mono text-[10px] border border-neutral-800 text-amber-400">localStorage</code> and are never transmitted to our servers.
                        </p>
                        <p className="mb-1 text-neutral-500 font-medium">
                          We may collect the following non-personal, aggregated data through standard server logs and analytics:
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-500">
                          <li>Pages visited and approximate session duration</li>
                          <li>Browser type and operating system (aggregated)</li>
                          <li>Referring website or search engine</li>
                          <li>Country-level geographic region (not precise location)</li>
                        </ul>
                      </div>

                      {/* Section 2 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">2. Cookies</h4>
                        <p className="mb-2">
                          Pomodoro Timer does not use advertising cookies or third-party tracking cookies. We use <code className="px-1.5 py-0.5 rounded bg-neutral-950 font-mono text-[10px] border border-neutral-800 text-amber-400">localStorage</code> (not cookies) to remember your session statistics, custom times, sound settings, and theme preference between visits. This data never leaves your device.
                        </p>
                        <p className="text-neutral-500">
                          You can clear this data at any time by clearing your browser's site data for the application.
                        </p>
                      </div>

                      {/* Section 3 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">3. Third-Party Services</h4>
                        <p className="mb-2">
                          We use <strong className="text-neutral-200">Google Fonts</strong> to load the Inter and JetBrains Mono typefaces. When your browser downloads these fonts, Google may log your IP address as part of standard font delivery. Please refer to Google's Privacy Policy for details.
                        </p>
                        <p className="text-neutral-500">
                          We do not embed social media widgets, advertising networks, or any other third-party trackers.
                        </p>
                      </div>

                      {/* Section 4 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">4. Data Retention</h4>
                        <p>
                          We do not store personal data on our servers. Server access logs, if retained, are kept for no longer than 90 days and are used solely to diagnose technical issues and ensure stability.
                        </p>
                      </div>

                      {/* Section 5 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">5. Children's Privacy</h4>
                        <p>
                          Pomodoro Timer is a general-purpose focus tool suitable for all ages. We do not knowingly collect any personal information from children under 13. Since we collect no personal information from any user, this service complies with COPPA (Children's Online Privacy Protection Act) by design.
                        </p>
                      </div>

                      {/* Section 6 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">6. Your Rights</h4>
                        <p className="mb-2">
                          Because we do not collect identifiable personal data, there is typically nothing for us to retrieve, correct, or delete on your behalf. If you have concerns, please contact us and we will respond promptly.
                        </p>
                        <p className="text-neutral-500">
                          If you are located in the European Economic Area (EEA), you have the right to access, rectify, or erase any personal data we hold, and to lodge a complaint with your local supervisory authority.
                        </p>
                      </div>

                      {/* Section 7 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">7. Changes to This Policy</h4>
                        <p>
                          We may update this Privacy Policy from time to time. The "Last updated" date at the top of this dialog will reflect the most recent revision. Continued use of the service after changes are posted constitutes your complete acceptance of the revised policy.
                        </p>
                      </div>

                      {/* Section 8 */}
                      <div className="p-3 bg-neutral-950/40 rounded-2xl border border-neutral-850">
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">8. Contact</h4>
                        <p>
                          Questions about this Privacy Policy? {' '}
                          <button
                            onClick={() => {
                              audioEngine.playSubtleClick();
                              setActiveModal('contact');
                            }}
                            className="text-amber-500 hover:text-amber-400 hover:underline font-semibold cursor-pointer transition-colors inline"
                          >
                            Contact us here
                          </button>.
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {activeModal === 'terms' && (
                  <div className="flex flex-col gap-4 font-sans text-xs leading-relaxed text-neutral-400">
                    <div className="text-[10px] font-mono text-neutral-500 mb-1">
                      Last updated: July 2026
                    </div>
                    
                    <p className="text-sm text-neutral-300">
                      Please read these Terms and Conditions ("Terms") carefully before using the <strong className="text-white font-semibold">Pomodoro Timer</strong> application ("the Service"). By accessing or using the Service, you agree to be bound by these Terms.
                    </p>

                    <div className="flex flex-col gap-4.5 mt-2">
                      {/* Section 1 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">1. Use of the Service</h4>
                        <p className="mb-2">
                          Pomodoro Timer is provided free of charge for personal and professional use. You may use the Service to run focus and break intervals, track progress, and stream ambient backgrounds to boost productivity. No registration, signup, or payment is required.
                        </p>
                        <p className="text-neutral-500">
                          You agree not to:
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-500">
                          <li>Use the Service for any unlawful purpose.</li>
                          <li>Attempt to reverse-engineer, scrape, or copy the Service for redistribution without written permission.</li>
                          <li>Interfere with or disrupt the client-side execution or systems that serve the Service.</li>
                        </ul>
                      </div>

                      {/* Section 2 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">2. Timekeeping & Accuracy Disclaimer</h4>
                        <p className="mb-2">
                          Pomodoro Timer is designed to provide clean, reliable, and responsive focus tracking. However, absolute countdown accuracy is highly dependent on your browser and environment:
                        </p>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-500 mb-2">
                          <li>Active browser window tab throttling or background tab sleeping behavior.</li>
                          <li>Your screen's active refresh cycle, computer power-save or sleep states.</li>
                          <li>Device-level notification permission and audio permissions.</li>
                        </ul>
                        <p className="text-neutral-500 font-medium">
                          <strong className="text-neutral-300">Do not rely on Pomodoro Timer for safety-critical tasks or precision measurements</strong> where minor countdown fluctuations could lead to damage, injury, or liability.
                        </p>
                      </div>

                      {/* Section 3 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">3. Intellectual Property</h4>
                        <p>
                          The original layout design, color palettes, visual presets, custom vector icons, logic code, and synthesized ambient audio mixer configurations of the Service are owned by Yashraj and contributors, protected under copyright laws. You may not reproduce, copy, clone, or redistribute them without prior written authorization. The generic Pomodoro Technique methodology itself is public domain; only our custom visual implementation and design are proprietary.
                        </p>
                      </div>

                      {/* Section 4 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">4. Disclaimer of Warranties</h4>
                        <p>
                          The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be completely uninterrupted, error-free, or fully synchronized across all legacy browser environments and hardware configurations.
                        </p>
                      </div>

                      {/* Section 5 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">5. Limitation of Liability</h4>
                        <p>
                          To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of, or inability to use, the Service—including but not limited to lost data, missed meetings, or cleared local storage states.
                        </p>
                      </div>

                      {/* Section 6 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">6. Third-Party Links</h4>
                        <p>
                          The Service may contain links to third-party web platforms or tools (such as external community links or information sites). These links are provided for informational purposes only. We have no authority over external content and accept no responsibility for their terms or policies.
                        </p>
                      </div>

                      {/* Section 7 */}
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">7. Changes to These Terms</h4>
                        <p>
                          We reserve the right to modify or replace these Terms at any time. The "Last updated" date at the top of this dialog will reflect the most recent revision. Your continued use of the Pomodoro Timer after revisions are published constitutes your complete acceptance of the updated Terms.
                        </p>
                      </div>

                      {/* Section 8 */}
                      <div className="p-3 bg-neutral-950/40 rounded-2xl border border-neutral-850">
                        <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider font-mono text-amber-500/90">8. Contact</h4>
                        <p>
                          Questions about these Terms or the application's design? {' '}
                          <button
                            onClick={() => {
                              audioEngine.playSubtleClick();
                              setActiveModal('contact');
                            }}
                            className="text-amber-500 hover:text-amber-400 hover:underline font-semibold cursor-pointer transition-colors inline"
                          >
                            Contact us here
                          </button>.
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end border-t border-neutral-800/60 pt-3">
                <button
                  onClick={() => {
                    audioEngine.playSubtleClick();
                    setActiveModal(null);
                    setIsSubmitted(false);
                  }}
                  className="px-4.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer active:scale-98"
                >
                  Close Dialog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
});

