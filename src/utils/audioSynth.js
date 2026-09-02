// MINEGUARD AI — Web Audio API Synthesizer
// Synthetic siren, warning chime, click feedback — no external audio files

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.sirenInterval = null;
    this.sirenOscillator = null;
    this.sirenGain = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stopSiren();
    }
  }

  getIsMuted() {
    return this.isMuted;
  }

  /** Short click feedback for UI interactions */
  playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  /** Triangle wave alert chime for warnings */
  playWarning() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.setValueAtTime(850, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  /** Ascending C-E-G chord for success/resolution */
  playSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);     // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.2); // G5

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {}
  }

  /** Continuous sawtooth emergency siren (550-950Hz oscillation) */
  startSiren() {
    if (this.isMuted || this.sirenInterval) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      let high = false;
      this.sirenOscillator = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOscillator.type = 'sawtooth';
      this.sirenOscillator.frequency.setValueAtTime(550, this.ctx.currentTime);
      this.sirenGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.sirenOscillator.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);
      this.sirenOscillator.start();

      this.sirenInterval = setInterval(() => {
        if (!this.ctx || !this.sirenOscillator) return;
        high = !high;
        const targetFreq = high ? 950 : 550;
        this.sirenOscillator.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.4);
      }, 500);
    } catch (e) {}
  }

  /** Stop the emergency siren */
  stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
      } catch (e) {}
      this.sirenOscillator = null;
    }
  }
}

export const audioSynth = new AudioSynthesizer();
