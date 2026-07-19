/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Volume2, VolumeX, CloudRain, Trees, Waves, Flame, 
  Coffee, Radio, Brain, Music, Volume1, Search, Sparkles
} from 'lucide-react';
import { SoundConfig } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface SoundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  sounds: SoundConfig[];
  setSounds: React.Dispatch<React.SetStateAction<SoundConfig[]>>;
  mode: 'focus' | 'shortBreak' | 'longBreak';
}

const parseSpotifyUrl = (url: string): { type: string; id: string } | null => {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Try matching standard web link patterns
  // e.g. https://open.spotify.com/playlist/37i9dQZF1DX8U77mEUfUTg?si=...
  const webMatch = cleanUrl.match(/open\.spotify\.com\/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
  if (webMatch) {
    return { type: webMatch[1], id: webMatch[2] };
  }

  // Try matching URI patterns
  // e.g. spotify:playlist:37i9dQZF1DX8U77mEUfUTg
  const uriMatch = cleanUrl.match(/spotify:(playlist|track|album|artist):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    return { type: uriMatch[1], id: uriMatch[2] };
  }

  // Fallback: if it's just a 22-char alphanumeric string, assume it's a playlist ID
  if (/^[a-zA-Z0-9]{22}$/.test(cleanUrl)) {
    return { type: 'playlist', id: cleanUrl };
  }

  return null;
};

export const SoundSelector: React.FC<SoundSelectorProps> = ({
  isOpen,
  onClose,
  sounds,
  setSounds,
  mode,
}) => {
  const [activeTab, setActiveTab] = React.useState<'ambient' | 'spotify'>('ambient');
  
  // Spotify integration state
  const [spotifyTarget, setSpotifyTarget] = React.useState<{ type: string; id: string }>(() => {
    const saved = localStorage.getItem('pomodoro_spotify_target');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return { type: 'playlist', id: '37i9dQZF1DX8U77mEUfUTg' }; // Default Lofi Beats
  });

  const [spotifyUrlInput, setSpotifyUrlInput] = React.useState('');
  const [spotifyError, setSpotifyError] = React.useState('');

  const toggleSound = (id: string) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === id) {
        const nextState = !sound.isPlaying;
        if (nextState) {
          audioEngine.startSound(sound.id, sound.volume);
        } else {
          audioEngine.stopSound(sound.id);
        }
        return { ...sound, isPlaying: nextState };
      }
      return sound;
    }));
    audioEngine.playSubtleClick();
  };

  const handleVolumeChange = (id: string, volume: number) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === id) {
        audioEngine.setSoundVolume(sound.id, volume);
        return { ...sound, volume };
      }
      return sound;
    }));
  };

  const stopAllSounds = () => {
    setSounds(prev => prev.map(sound => {
      if (sound.isPlaying) {
        audioEngine.stopSound(sound.id);
        return { ...sound, isPlaying: false };
      }
      return sound;
    }));
    audioEngine.playSubtleClick();
  };

  const getSoundIcon = (id: string) => {
    switch (id) {
      case 'rain': return <CloudRain className="w-5 h-5 text-blue-500/80" />;
      case 'forest': return <Trees className="w-5 h-5 text-emerald-500/80" />;
      case 'ocean': return <Waves className="w-5 h-5 text-cyan-500/80" />;
      case 'fireplace': return <Flame className="w-5 h-5 text-amber-500/80" />;
      case 'coffee': return <Coffee className="w-5 h-5 text-orange-500/80" />;
      case 'white':
      case 'brown':
      case 'pink': 
         return <Radio className="w-5 h-5 text-purple-500/80" />;
      case 'studyBeat':
      case 'relaxBeat':
      case 'sleepBeat':
        return <Brain className="w-5 h-5 text-rose-500/80" />;
      default: return <Music className="w-5 h-5 text-gray-500" />;
    }
  };

  const categories = [
    { key: 'nature', name: 'Nature & Atmosphere', icon: <Trees className="w-4 h-4 text-emerald-500" /> },
    { key: 'noise', name: 'Colored Noises', icon: <Radio className="w-4 h-4 text-purple-500" /> },
    { key: 'binaural', name: 'Binaural Beats (Headphones Recommended)', icon: <Brain className="w-4 h-4 text-rose-500" /> },
  ];

  const curatedSpotifyPlaylists = [
    { name: 'Lofi Beats', id: '37i9dQZF1DX8U77mEUfUTg', type: 'playlist', desc: 'Chill study beats' },
    { name: 'Deep Focus', id: '37i9dQZF1DWZeKFB67db6g', type: 'playlist', desc: 'Ambient focus' },
    { name: 'Focus Flow', id: '37i9dQZF1DWZqg96vsh67p', type: 'playlist', desc: 'Uplifting tracks' },
    { name: 'Peaceful Piano', id: '37i9dQZF1DX4sWSpwq3LiO', type: 'playlist', desc: 'Soft piano music' },
  ];

  const handleSelectCurated = (id: string, type: string = 'playlist') => {
    const target = { type, id };
    setSpotifyTarget(target);
    localStorage.setItem('pomodoro_spotify_target', JSON.stringify(target));
    setSpotifyError('');
    audioEngine.playSubtleClick();
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyUrlInput.trim()) return;

    const parsed = parseSpotifyUrl(spotifyUrlInput);
    if (parsed) {
      setSpotifyTarget(parsed);
      localStorage.setItem('pomodoro_spotify_target', JSON.stringify(parsed));
      setSpotifyUrlInput('');
      setSpotifyError('');
      audioEngine.playSubtleClick();
    } else {
      setSpotifyError('Invalid link. Please paste a Spotify playlist, track, or album link.');
    }
  };

  const activeCount = sounds.filter(s => s.isPlaying).length;

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
            id="sounds-backdrop"
          />

          {/* Bottom Sheet Drawer on Mobile, Elegant Modal on Desktop */}
          <motion.div
            id="sounds-container"
            initial={{ opacity: 0, y: 100, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-amber-200/30 dark:border-neutral-800/50 bg-[#FCFAF2]/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl transition-colors duration-300 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-200/20 dark:border-neutral-800/80 px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Focus Sounds
                </h3>
                {activeTab === 'ambient' && activeCount > 0 && (
                  <span className="flex items-center justify-center px-2 py-0.5 text-[10px] font-mono rounded-full bg-amber-100/40 dark:bg-neutral-800 text-amber-900/70 dark:text-neutral-400">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeTab === 'ambient' && activeCount > 0 && (
                  <button
                    onClick={stopAllSounds}
                    className="text-xs font-mono font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 px-2.5 py-1 rounded-md transition-all btn-glass-fluid cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  id="close-sounds-btn"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 btn-glass-fluid cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex px-6 border-b border-amber-200/10 dark:border-neutral-800/40 bg-neutral-50/20 dark:bg-neutral-950/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ambient');
                  audioEngine.playSubtleClick();
                }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider relative transition-colors duration-300 cursor-pointer ${
                  activeTab === 'ambient'
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
                }`}
              >
                <span>Ambient Mixer</span>
                {activeTab === 'ambient' && (
                  <motion.div
                    layoutId="activeSoundTab"
                    className={`absolute bottom-0 left-6 right-6 h-0.5 ${
                      mode === 'focus' ? 'bg-amber-500' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('spotify');
                  audioEngine.playSubtleClick();
                }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider relative transition-colors duration-300 cursor-pointer ${
                  activeTab === 'spotify'
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    mode === 'focus' ? 'bg-amber-500' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />
                  Spotify Focus
                </span>
                {activeTab === 'spotify' && (
                  <motion.div
                    layoutId="activeSoundTab"
                    className={`absolute bottom-0 left-6 right-6 h-0.5 ${
                      mode === 'focus' ? 'bg-amber-500' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[50vh] sm:max-h-[55vh]">
              {activeTab === 'ambient' ? (
                <div className="space-y-6">
                  {categories.map(cat => {
                    const catSounds = sounds.filter(s => s.category === cat.key);
                    return (
                      <div key={cat.key} className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                          {cat.icon}
                          <span>{cat.name}</span>
                        </div>

                        <div className="grid gap-2">
                          {catSounds.map(sound => (
                            <div
                              key={sound.id}
                              className={`group flex flex-col p-3 rounded-xl border transition-all duration-300 ${
                                sound.isPlaying
                                  ? 'border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/30'
                                  : 'border-transparent hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleSound(sound.id)}
                                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 btn-glass-fluid cursor-pointer ${
                                      sound.isPlaying
                                        ? 'bg-neutral-900/95 dark:bg-neutral-100/95 text-white dark:text-neutral-950 shadow-md scale-102 font-bold'
                                        : 'bg-white/40 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 hover:scale-102'
                                    }`}
                                  >
                                    {sound.isPlaying ? (
                                      <VolumeX className="w-4.5 h-4.5" />
                                    ) : (
                                      getSoundIcon(sound.id)
                                    )}
                                  </button>

                                  <div className="text-left">
                                    <h4 className={`text-sm font-medium transition-colors ${
                                      sound.isPlaying 
                                        ? 'text-neutral-950 dark:text-neutral-50' 
                                        : 'text-neutral-850 dark:text-neutral-200'
                                    }`}>
                                      {sound.name}
                                    </h4>
                                    {sound.description && (
                                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans tracking-tight mt-0.5">
                                        {sound.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Minimal state indicator */}
                                <div className="text-right">
                                  {sound.isPlaying && (
                                    <span className="text-[10px] font-mono text-emerald-500/90 font-medium">
                                      Playing
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Sound volume slider container, animated open */}
                              <AnimatePresence>
                                {sound.isPlaying && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex items-center gap-3 px-1">
                                      <Volume1 className="w-3.5 h-3.5 text-neutral-400" />
                                      <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={sound.volume}
                                        onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                                        className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-100 focus:outline-none"
                                      />
                                      <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                                      <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
                                        {Math.round(sound.volume * 100)}%
                                      </span>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-5 py-1">
                  {/* Embedded Spotify Player container with loading state */}
                  <div className="relative rounded-2xl overflow-hidden shadow-sm bg-neutral-950/10 dark:bg-neutral-950/45 h-[152px] w-full flex items-center justify-center border border-neutral-250/60 dark:border-neutral-800/50">
                    <iframe
                      src={`https://open.spotify.com/embed/${spotifyTarget.type}/${spotifyTarget.id}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen={false}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    />
                  </div>

                  {/* Curated Stations */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1 text-[11px] font-mono font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>Curated Focus Stations</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {curatedSpotifyPlaylists.map(playlist => {
                        const isSelected = spotifyTarget.id === playlist.id;
                        return (
                          <button
                            key={playlist.id}
                            type="button"
                            onClick={() => handleSelectCurated(playlist.id, playlist.type)}
                            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-300 active:scale-98 cursor-pointer ${
                              isSelected
                                ? mode === 'focus'
                                  ? 'bg-amber-500/[0.04] border-amber-500/40 dark:border-amber-400/30 shadow-sm'
                                  : mode === 'shortBreak'
                                  ? 'bg-emerald-500/[0.04] border-emerald-500/40 dark:border-emerald-400/30 shadow-sm'
                                  : 'bg-indigo-500/[0.04] border-indigo-500/40 dark:border-indigo-400/30 shadow-sm'
                                : 'bg-white dark:bg-neutral-950/40 border-neutral-200/50 dark:border-neutral-850/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10'
                            }`}
                          >
                            <span className={`text-xs font-semibold ${
                              isSelected ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-800 dark:text-neutral-200'
                            }`}>
                              {playlist.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans mt-0.5">
                              {playlist.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Station Link Loader */}
                  <div className="space-y-2 pt-2 border-t border-neutral-150 dark:border-neutral-800/50">
                    <div className="text-[11px] font-mono font-medium tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                      Load Your Own Playlist / Track
                    </div>
                    <form onSubmit={handleLoadCustomUrl} className="flex gap-2">
                      <input
                        type="text"
                        value={spotifyUrlInput}
                        onChange={(e) => {
                          setSpotifyUrlInput(e.target.value);
                          if (spotifyError) setSpotifyError('');
                        }}
                        placeholder="Paste Spotify track, album, or playlist link..."
                        className={`flex-1 px-3 py-2 rounded-xl border bg-white/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-[11px] focus:outline-none focus:ring-1 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 ${
                          spotifyError
                            ? 'border-rose-400 focus:ring-rose-400'
                            : mode === 'focus'
                            ? 'border-neutral-250 dark:border-neutral-800 focus:ring-amber-500/40 focus:border-amber-500/40'
                            : mode === 'shortBreak'
                            ? 'border-neutral-250 dark:border-neutral-800 focus:ring-emerald-500/40 focus:border-emerald-500/40'
                            : 'border-neutral-250 dark:border-neutral-800 focus:ring-indigo-500/40 focus:border-indigo-500/40'
                        }`}
                      />
                      <button
                        type="submit"
                        className={`px-3.5 py-2 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                          mode === 'focus'
                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                            : mode === 'shortBreak'
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                            : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/10'
                        }`}
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Load</span>
                      </button>
                    </form>
                    {spotifyError ? (
                      <p className="text-[10px] text-rose-500 font-sans">{spotifyError}</p>
                    ) : (
                      <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-sans leading-relaxed">
                        Tip: Open Spotify, share any playlist, click "Copy Link to Playlist", and paste it here!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ambient Footer */}
            <div className="bg-neutral-50/50 dark:bg-neutral-950/20 px-6 py-4 text-center border-t border-gray-100 dark:border-neutral-800/50 shrink-0">
              <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-sans leading-relaxed">
                {activeTab === 'ambient' 
                  ? 'Tip: Mix multiple ambient sounds together to build your custom focus soundscape.' 
                  : 'Log in on the Spotify player above to stream full tracks during your sessions.'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
