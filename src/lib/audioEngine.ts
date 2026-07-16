/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private activeSources: Map<string, {
    nodes: AudioNode[];
    gainNode: GainNode;
    targetVolume: number;
  }> = new Map();

  constructor() {
    // Proactively initialize and resume on any user gesture to satisfy strict autoplay policies (especially inside iframes)
    if (typeof window !== 'undefined') {
      const resume = () => {
        const ctx = this.initContext();
        if (ctx && ctx.state === 'running') {
          window.removeEventListener('click', resume);
          window.removeEventListener('keydown', resume);
          window.removeEventListener('touchstart', resume);
          window.removeEventListener('mousedown', resume);
        }
      };
      window.addEventListener('click', resume);
      window.addEventListener('keydown', resume);
      window.addEventListener('touchstart', resume);
      window.addEventListener('mousedown', resume);
    }
  }

  public resumeContext() {
    const ctx = this.initContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(err => console.warn("Deferred context resume failed:", err));
    }
    return ctx;
  }

  private initContext() {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        } else {
          console.warn("Web Audio API is not supported in this environment.");
          return null;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(err => console.warn("Failed to resume audio context:", err));
      }
    } catch (e) {
      console.error("Error initializing AudioContext:", e);
      return null;
    }
    return this.ctx;
  }

  // Helper: Create White Noise Buffer
  private createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Helper: Create Pink Noise Buffer
  private createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // rescue clipping
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Helper: Create Brown Noise Buffer
  private createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // compensate volume
    }
    return buffer;
  }

  // Start synthesizing a focus sound
  public startSound(id: string, volume: number) {
    const ctx = this.initContext();
    if (!ctx) return;
    if (this.activeSources.has(id)) {
      this.setSoundVolume(id, volume);
      return;
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const nodes: AudioNode[] = [];

    if (id === 'white' || id === 'pink' || id === 'brown') {
      const noiseNode = ctx.createBufferSource();
      if (id === 'white') noiseNode.buffer = this.createWhiteNoiseBuffer(ctx);
      else if (id === 'pink') noiseNode.buffer = this.createPinkNoiseBuffer(ctx);
      else noiseNode.buffer = this.createBrownNoiseBuffer(ctx);

      noiseNode.loop = true;
      noiseNode.connect(masterGain);
      noiseNode.start();
      nodes.push(noiseNode);

    } else if (id === 'rain') {
      // Pink noise + lowpass band for ambient rumble + random highpass clicks for drops
      const pinkNode = ctx.createBufferSource();
      pinkNode.buffer = this.createPinkNoiseBuffer(ctx);
      pinkNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      pinkNode.connect(filter);
      filter.connect(masterGain);
      pinkNode.start();
      nodes.push(pinkNode, filter);

      // Add gentle random droplets
      const dropletGain = ctx.createGain();
      dropletGain.gain.setValueAtTime(0.05, ctx.currentTime);
      dropletGain.connect(masterGain);

      // Create continuous LFO modulating filter slightly to sound organic
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // very slow
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(200, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      nodes.push(lfo, lfoGain);

    } else if (id === 'ocean') {
      // Pink noise heavily filtered, with LFO modulating volume for waves (no ConstantSourceNode required)
      const pinkNode = ctx.createBufferSource();
      pinkNode.buffer = this.createPinkNoiseBuffer(ctx);
      pinkNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.Q.setValueAtTime(1.0, ctx.currentTime);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.35, ctx.currentTime); // Base wave gain directly

      pinkNode.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(masterGain);
      pinkNode.start();
      nodes.push(pinkNode, filter, waveGain);

      // Wave LFO: ~12 second cycle (0.08Hz)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.25, ctx.currentTime); // Amplitude of wave volume modulation

      lfo.connect(lfoGain);
      lfoGain.connect(waveGain.gain); // Connect LFO to modulate wave gain smoothly

      lfo.start();
      nodes.push(lfo, lfoGain);

    } else if (id === 'forest') {
      // Wind (modulated brown noise) + rustling (very high bandpass white noise)
      const brownNode = ctx.createBufferSource();
      brownNode.buffer = this.createBrownNoiseBuffer(ctx);
      brownNode.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(400, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.7, ctx.currentTime);

      brownNode.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      brownNode.start();
      nodes.push(brownNode, windFilter, windGain);

      // Wind modulation LFO
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.05, ctx.currentTime); // super slow wind cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(windGain.gain);
      lfo.start();
      nodes.push(lfo, lfoGain);

      // Soft leaves rustling
      const whiteNode = ctx.createBufferSource();
      whiteNode.buffer = this.createWhiteNoiseBuffer(ctx);
      whiteNode.loop = true;

      const rustleFilter = ctx.createBiquadFilter();
      rustleFilter.type = 'bandpass';
      rustleFilter.frequency.setValueAtTime(5000, ctx.currentTime);
      rustleFilter.Q.setValueAtTime(2.0, ctx.currentTime);

      const rustleGain = ctx.createGain();
      rustleGain.gain.setValueAtTime(0.02, ctx.currentTime);

      whiteNode.connect(rustleFilter);
      rustleFilter.connect(rustleGain);
      rustleGain.connect(masterGain);
      whiteNode.start();
      nodes.push(whiteNode, rustleFilter, rustleGain);

      // Modulate leaves rustling slightly to match wind
      lfoGain.connect(rustleGain.gain);

    } else if (id === 'coffee') {
      // Coffee Shop: Low brown noise rumble + randomized coffee cup clinks (synthesized resonance)
      const rumbleNode = ctx.createBufferSource();
      rumbleNode.buffer = this.createBrownNoiseBuffer(ctx);
      rumbleNode.loop = true;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(250, ctx.currentTime);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.8, ctx.currentTime);

      rumbleNode.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(masterGain);
      rumbleNode.start();
      nodes.push(rumbleNode, rumbleFilter, rumbleGain);

      // Simulating clinks: let's use an interval to create high-frequency bell-like triggers
      const currentCtx = this.ctx;
      const interval = setInterval(() => {
        if (!currentCtx || currentCtx.state === 'suspended' || !this.activeSources.has(id)) return;
        // 35% chance of a clink every 1.5 seconds
        if (Math.random() > 0.65) {
          const osc = currentCtx.createOscillator();
          const clinkGain = currentCtx.createGain();
          
          osc.type = 'sine';
          const frequencies = [2500, 3200, 4100, 1800, 4800];
          const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
          osc.frequency.setValueAtTime(freq, currentCtx.currentTime);

          clinkGain.gain.setValueAtTime(0, currentCtx.currentTime);
          clinkGain.gain.linearRampToValueAtTime(0.015 * Math.random(), currentCtx.currentTime + 0.01);
          clinkGain.gain.exponentialRampToValueAtTime(0.0001, currentCtx.currentTime + 0.2 + Math.random() * 0.3);

          osc.connect(clinkGain);
          clinkGain.connect(masterGain);
          osc.start();
          osc.stop(currentCtx.currentTime + 1);
        }
      }, 1500);

      // Save interval so we can clear it
      (masterGain as any).customInterval = interval;
      nodes.push(rumbleNode);

    } else if (id === 'fireplace') {
      // Low rumble (brown noise lowpass) + fire crackles (random wood ticks and snaps)
      const rumbleNode = ctx.createBufferSource();
      rumbleNode.buffer = this.createBrownNoiseBuffer(ctx);
      rumbleNode.loop = true;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(150, ctx.currentTime);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.9, ctx.currentTime);

      rumbleNode.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(masterGain);
      rumbleNode.start();
      nodes.push(rumbleNode, rumbleFilter, rumbleGain);

      // Fire Crackles Synthesizer Interval
      const currentCtx = this.ctx;
      const interval = setInterval(() => {
        if (!currentCtx || currentCtx.state === 'suspended' || !this.activeSources.has(id)) return;
        // High probability of tiny pops and crackles
        if (Math.random() > 0.4) {
          const osc = currentCtx.createOscillator();
          const popGain = currentCtx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(80 + Math.random() * 200, currentCtx.currentTime);

          popGain.gain.setValueAtTime(0, currentCtx.currentTime);
          popGain.gain.linearRampToValueAtTime(0.1 * Math.random(), currentCtx.currentTime + 0.002);
          popGain.gain.exponentialRampToValueAtTime(0.0001, currentCtx.currentTime + 0.01 + Math.random() * 0.03);

          // Add a fast highpass noise snap
          const noise = currentCtx.createBufferSource();
          noise.buffer = this.createWhiteNoiseBuffer(currentCtx);
          const noiseFilter = currentCtx.createBiquadFilter();
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.setValueAtTime(6000, currentCtx.currentTime);

          const snapGain = currentCtx.createGain();
          snapGain.gain.setValueAtTime(0, currentCtx.currentTime);
          snapGain.gain.linearRampToValueAtTime(0.04 * Math.random(), currentCtx.currentTime + 0.001);
          snapGain.gain.exponentialRampToValueAtTime(0.0001, currentCtx.currentTime + 0.005 + Math.random() * 0.01);

          noise.connect(noiseFilter);
          noiseFilter.connect(snapGain);
          snapGain.connect(masterGain);

          osc.connect(popGain);
          popGain.connect(masterGain);

          osc.start();
          osc.stop(currentCtx.currentTime + 0.15);
          noise.start();
          noise.stop(currentCtx.currentTime + 0.1);
        }
      }, 150);

      (masterGain as any).customInterval = interval;

    } else if (id.endsWith('Beat')) {
      // Binaural Beats: Study, Relax, Sleep with Stereo Panner safety checks
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();

      const carrierFreq = 160; // 160Hz carrier is warm and non-fatiguing
      let offset = 40; // Default Study: Gamma (40Hz) for memory and attention

      if (id === 'relaxBeat') {
        offset = 10; // Alpha (10Hz) for calm reflection
      } else if (id === 'sleepBeat') {
        offset = 3.5; // Delta (3.5Hz) for deep sleep and wind down
      }

      leftOsc.frequency.setValueAtTime(carrierFreq, ctx.currentTime);
      rightOsc.frequency.setValueAtTime(carrierFreq + offset, ctx.currentTime);

      leftOsc.type = 'sine';
      rightOsc.type = 'sine';

      const beatGain = ctx.createGain();
      beatGain.gain.setValueAtTime(0.5, ctx.currentTime);

      // Robust check for StereoPanner support (e.g. mobile Safari / legacy runtimes)
      if (ctx.createStereoPanner) {
        try {
          const leftPan = ctx.createStereoPanner();
          leftPan.pan.setValueAtTime(-1, ctx.currentTime);

          const rightPan = ctx.createStereoPanner();
          rightPan.pan.setValueAtTime(1, ctx.currentTime);

          leftOsc.connect(leftPan);
          rightOsc.connect(rightPan);

          leftPan.connect(beatGain);
          rightPan.connect(beatGain);

          leftOsc.start();
          rightOsc.start();

          nodes.push(leftOsc, rightOsc, leftPan, rightPan, beatGain);
        } catch (e) {
          leftOsc.connect(beatGain);
          rightOsc.connect(beatGain);
          leftOsc.start();
          rightOsc.start();
          nodes.push(leftOsc, rightOsc, beatGain);
        }
      } else {
        leftOsc.connect(beatGain);
        rightOsc.connect(beatGain);
        leftOsc.start();
        rightOsc.start();
        nodes.push(leftOsc, rightOsc, beatGain);
      }

      beatGain.connect(masterGain);
    }

    // Smooth Fade In (1.5 seconds)
    masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);

    this.activeSources.set(id, {
      nodes,
      gainNode: masterGain,
      targetVolume: volume,
    });
  }

  // Adjust volume of an active sound smoothly
  public setSoundVolume(id: string, volume: number) {
    const source = this.activeSources.get(id);
    if (!source) return;

    source.targetVolume = volume;
    if (this.ctx) {
      try {
        source.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        // Anchor start point cleanly using targetVolume or fallback
        const startVal = source.gainNode.gain.value || volume;
        source.gainNode.gain.setValueAtTime(startVal, this.ctx.currentTime);
        source.gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.3);
      } catch (e) {
        source.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
      }
    } else {
      source.gainNode.gain.setValueAtTime(volume, 0);
    }
  }

  // Stop a specific focus sound smoothly with fade out
  public stopSound(id: string) {
    const source = this.activeSources.get(id);
    if (!source) return;

    const ctx = this.ctx;
    if (ctx) {
      // Smooth Fade Out (1 second)
      try {
        source.gainNode.gain.cancelScheduledValues(ctx.currentTime);
        const startVal = source.targetVolume || 0.5;
        source.gainNode.gain.setValueAtTime(startVal, ctx.currentTime);
        source.gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
      } catch (e) {
        console.warn("Error scheduling fadeout:", e);
        source.gainNode.gain.setValueAtTime(0, ctx.currentTime);
      }

      setTimeout(() => {
        // Only clean up if it wasn't re-started during the fadeout
        const currentSource = this.activeSources.get(id);
        if (currentSource && currentSource.gainNode === source.gainNode) {
          this.cleanupSource(id, source);
        }
      }, 1100);
    } else {
      this.cleanupSource(id, source);
    }
  }

  // Stop all sounds with smooth fade out
  public stopAll() {
    for (const id of this.activeSources.keys()) {
      this.stopSound(id);
    }
  }

  private cleanupSource(id: string, source: any) {
    // Clear any intervals (like clinks or crackles)
    if (source.gainNode.customInterval) {
      clearInterval(source.gainNode.customInterval);
    }

    // Stop and disconnect nodes
    source.nodes.forEach((node: any) => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });

    try {
      source.gainNode.disconnect();
    } catch (e) {}

    this.activeSources.delete(id);
  }

  // Play a beautiful premium chime / notification sound when a timer completes
  public playNotificationSound() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // A gorgeous dual-tone, warm resonant chime (resembles organic soundscape)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    masterGain.connect(ctx.destination);

    // Fundamental chime tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.connect(masterGain);

    // Perfect fifth overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now); // G5
    osc2.connect(masterGain);

    // Warm undertone
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(261.63, now); // C4
    osc3.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 2.6);
    osc2.stop(now + 2.6);
    osc3.stop(now + 2.6);
  }

  // Play a subtle mechanical tick when the timer ticks or gets toggled
  public playSubtleClick() {
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0, now);
    clickGain.gain.linearRampToValueAtTime(0.05, now + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    clickGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.connect(clickGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

// Singleton export
export const audioEngine = new AudioEngine();
