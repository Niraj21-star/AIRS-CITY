export type SFX = 'open' | 'close' | 'switch' | 'travel';

class AudioEngine {
  context: AudioContext | null = null;
  masterGain: GainNode | null = null;
  bgmGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  currentBGM: AudioBufferSourceNode | null = null;
  muted = false;
  initialized = false;

  constructor() {
    this.muted = localStorage.getItem('airs_mute') === 'true';
  }

  init() {
    if (this.initialized) return;
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.bgmGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    
    this.bgmGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    
    this.applyMuteState();
    this.initialized = true;
  }

  async resume() {
    if (!this.initialized) this.init();
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  async suspend() {
    if (this.context?.state === 'running') {
      await this.context.suspend();
    }
  }

  setMute(mute: boolean) {
    this.muted = mute;
    localStorage.setItem('airs_mute', mute.toString());
    this.applyMuteState();
  }

  private applyMuteState() {
    if (!this.masterGain || !this.context) return;
    this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 1, this.context.currentTime, 0.1);
  }

  // Fallback UI sounds (retaining existing procedural SFX for AirsLink)
  cue(type: SFX) {
    if (!this.initialized || !this.context || !this.sfxGain || this.muted) return;
    const tone = this.context.createOscillator();
    const gain = this.context.createGain();
    tone.connect(gain).connect(this.sfxGain);
    
    const now = this.context.currentTime;
    if (type === 'switch') {
      tone.frequency.setValueAtTime(480, now);
      tone.frequency.exponentialRampToValueAtTime(720, now + 0.13);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      tone.start(now); tone.stop(now + 0.4);
    } else if (type === 'open') {
      tone.frequency.setValueAtTime(600, now);
      tone.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      tone.start(now); tone.stop(now + 0.5);
    } else if (type === 'close') {
      tone.frequency.setValueAtTime(1200, now);
      tone.frequency.exponentialRampToValueAtTime(600, now + 0.2);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      tone.start(now); tone.stop(now + 0.5);
    } else if (type === 'travel') {
      tone.type = 'triangle';
      tone.frequency.setValueAtTime(110, now);
      tone.frequency.exponentialRampToValueAtTime(55, now + 1.5);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      tone.start(now); tone.stop(now + 1.6);
    }
    tone.onended = () => { tone.disconnect(); gain.disconnect(); };
  }

  async playBGM(url: string | null) {
    if (!this.initialized) this.init();
    if (!this.context || !this.bgmGain) return;

    // Crossfade out existing BGM
    if (this.currentBGM) {
      const existing = this.currentBGM;
      this.currentBGM = null; // Clear reference immediately
      const currentGain = this.context.createGain();
      currentGain.gain.value = 1;
      existing.disconnect();
      existing.connect(currentGain).connect(this.bgmGain);
      currentGain.gain.setTargetAtTime(0, this.context.currentTime, 0.4);
      setTimeout(() => {
        try { existing.stop(); } catch {}
        existing.disconnect();
        currentGain.disconnect();
      }, 1500);
    }

    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) return;
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      const source = this.context.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      
      const fadeNode = this.context.createGain();
      fadeNode.gain.setValueAtTime(0, this.context.currentTime);
      fadeNode.gain.setTargetAtTime(1, this.context.currentTime, 0.5); // fade in
      
      source.connect(fadeNode).connect(this.bgmGain);
      source.start();
      
      this.currentBGM = source;
    } catch (e) {
      console.warn("Failed to load BGM:", e);
    }
  }
}

export const audio = new AudioEngine();
