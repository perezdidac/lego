/**
 * Procedural Web Audio Sound Synthesizer for BlockStory Català
 * 100% synthesized in-browser with zero external audio assets.
 */
export class SoundSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private chuffTimer: number | null = null;
  private currentChuffInterval: number = 600;
  private isChuffing: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopChuff();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Tactile toy brick click/snap sound
   */
  public playBrickSnap(pitchShift: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Fast plastic transient impulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // High resonance bandpass filter mimics plastic brick cavity
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1900 * pitchShift, t);
    filter.Q.setValueAtTime(8, t);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 * pitchShift, t);
    osc.frequency.exponentialRampToValueAtTime(80 * pitchShift, t + 0.04);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);

    // Second layer: tiny high click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(2400 * pitchShift, t);
    clickOsc.frequency.exponentialRampToValueAtTime(400, t + 0.02);

    clickGain.gain.setValueAtTime(0.4, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(t);
    clickOsc.stop(t + 0.02);
  }

  /**
   * Brick removal/delete pop sound
   */
  public playBrickRemove(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Harmonized Steam Train Whistle (D5 + F#5 chords with steam hiss)
   */
  public playWhistle(duration: number = 1.2): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, t);
    masterGain.gain.linearRampToValueAtTime(0.65, t + 0.12);
    masterGain.gain.setValueAtTime(0.65, t + duration - 0.2);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    masterGain.connect(ctx.destination);

    // Two harmonized whistle tones: D5 (587Hz) and F#5 (740Hz)
    const freqs = [587.33, 739.99, 880.0];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      
      // Slight pitch wobble / vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 6.0; // 6Hz vibrato
      lfoGain.gain.value = 4.5;
      lfo.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + duration);

      osc.frequency.setValueAtTime(freq * (1 + (idx - 1) * 0.003), t);
      gain.gain.value = idx === 2 ? 0.25 : 0.45;

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + duration);
    });

    // Steam noise breath component
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, t);
    noiseFilter.Q.setValueAtTime(3.5, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.18, t + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);
  }

  /**
   * Steam locomotive chuff sound (burst of shaped white noise + sub thud)
   */
  public triggerChuff(intensity: number = 0.5): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const dur = 0.12;

    // Noise component (steam puff)
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 + intensity * 600, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35 * Math.min(intensity + 0.2, 1.0), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + dur);

    // Mechanical bass thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    oscGain.gain.setValueAtTime(0.3 * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Update train speed to modulate chuffing rhythm
   * speed is 0.0 to 1.0
   */
  public updateTrainSpeed(speedRatio: number): void {
    if (speedRatio <= 0.03) {
      this.stopChuff();
      return;
    }

    // Interval from 700ms down to 140ms
    const interval = Math.max(130, Math.floor(650 - speedRatio * 510));
    this.currentChuffInterval = interval;

    if (!this.isChuffing) {
      this.isChuffing = true;
      this.runChuffLoop();
    }
  }

  private runChuffLoop(): void {
    if (!this.isChuffing) return;
    this.triggerChuff(0.4 + (650 - this.currentChuffInterval) / 800);
    this.chuffTimer = window.setTimeout(() => {
      this.runChuffLoop();
    }, this.currentChuffInterval);
  }

  public stopChuff(): void {
    this.isChuffing = false;
    if (this.chuffTimer !== null) {
      clearTimeout(this.chuffTimer);
      this.chuffTimer = null;
    }
  }

  /**
   * Brake squeal sound
   */
  public playBrake(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.linearRampToValueAtTime(1400, t + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.Q.setValueAtTime(12, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  /**
   * Playful mission victory fanfare (ascending major arpeggio with sparkling chimes)
   */
  public playFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [
      { f: 523.25, time: 0.00, dur: 0.18 }, // C5
      { f: 659.25, time: 0.16, dur: 0.18 }, // E5
      { f: 783.99, time: 0.32, dur: 0.18 }, // G5
      { f: 1046.50, time: 0.48, dur: 0.55 }, // C6
      { f: 1318.51, time: 0.65, dur: 0.60 }  // E6
    ];

    const t = ctx.currentTime;

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.time);

      gain.gain.setValueAtTime(0.001, t + note.time);
      gain.gain.linearRampToValueAtTime(0.35, t + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + note.time);
      osc.stop(t + note.time + note.dur);
    });
  }

  /**
   * UI touch click / beep
   */
  public playUIBeep(freq: number = 600): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }
}

export const soundSynth = new SoundSynth();
