export type SFX = 'open' | 'close' | 'switch' | 'travel';

class AudioEngine {
  context: AudioContext | null = null;
  masterGain: GainNode | null = null;
  bgmGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  currentBGM: AudioBufferSourceNode | null = null;
  currentGainNode: GainNode | null = null;
  currentUrl: string | null = null;
  bufferCache = new Map<string, AudioBuffer>();
  pendingFetch = new Map<string, Promise<AudioBuffer | null>>();
  muted = false;
  initialized = false;

  constructor() {
    try {
      this.muted = localStorage.getItem('airs_mute') === 'true';
    } catch {
      this.muted = false;
    }
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new AudioCtx();
      this.masterGain = this.context.createGain();
      this.bgmGain = this.context.createGain();
      this.sfxGain = this.context.createGain();

      this.bgmGain.gain.value = 0.85;
      this.sfxGain.gain.value = 0.65;

      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);

      this.applyMuteState();
      this.initialized = true;

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (!this.initialized || !this.context || !this.bgmGain) return;
          if (document.hidden) {
            this.setBgmVolume(0, 0.6);
          } else {
            this.setBgmVolume(0.85, 0.6);
          }
        });
      }
    } catch (e) {
      console.warn("AudioEngine initialization failed:", e);
    }
  }

  async resume() {
    if (!this.initialized) this.init();
    if (this.context?.state === 'suspended') {
      try {
        await this.context.resume();
      } catch (e) {
        console.warn("AudioContext resume failed:", e);
      }
    }
  }

  async suspend() {
    if (this.context?.state === 'running') {
      try {
        await this.context.suspend();
      } catch (e) {
        console.warn("AudioContext suspend failed:", e);
      }
    }
  }

  setMute(mute: boolean) {
    this.muted = mute;
    try {
      localStorage.setItem('airs_mute', mute.toString());
    } catch {
      // storage unavailable
    }
    this.applyMuteState();
  }

  private applyMuteState() {
    if (!this.masterGain || !this.context) return;
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 1, now, 0.05);
  }

  setBgmVolume(volume: number, duration = 0.4) {
    if (!this.bgmGain || !this.context) return;
    const now = this.context.currentTime;
    const target = Math.max(0, Math.min(1, volume));
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setTargetAtTime(target, now, duration / 3);
  }

  // Tactical UI feedback sounds for interaction cues
  cue(type: SFX) {
    if (!this.initialized || !this.context || !this.sfxGain || this.muted) return;
    const tone = this.context.createOscillator();
    const gain = this.context.createGain();
    tone.connect(gain).connect(this.sfxGain);

    const now = this.context.currentTime;
    if (type === 'switch') {
      tone.frequency.setValueAtTime(480, now);
      tone.frequency.exponentialRampToValueAtTime(720, now + 0.12);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      tone.start(now); tone.stop(now + 0.35);
    } else if (type === 'open') {
      tone.frequency.setValueAtTime(600, now);
      tone.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      tone.start(now); tone.stop(now + 0.4);
    } else if (type === 'close') {
      tone.frequency.setValueAtTime(1100, now);
      tone.frequency.exponentialRampToValueAtTime(550, now + 0.18);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      tone.start(now); tone.stop(now + 0.4);
    } else if (type === 'travel') {
      tone.type = 'triangle';
      tone.frequency.setValueAtTime(110, now);
      tone.frequency.exponentialRampToValueAtTime(55, now + 1.4);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      tone.start(now); tone.stop(now + 1.5);
    }
    tone.onended = () => {
      try {
        tone.disconnect();
        gain.disconnect();
      } catch {}
    };
  }

  private async fetchAndDecode(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }
    if (this.pendingFetch.has(url)) {
      return this.pendingFetch.get(url)!;
    }

    const promise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        if (!this.context) return null;
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.bufferCache.set(url, audioBuffer);
        return audioBuffer;
      } catch (e) {
        console.warn("Failed to decode audio asset:", e);
        return null;
      } finally {
        this.pendingFetch.delete(url);
      }
    })();

    this.pendingFetch.set(url, promise);
    return promise;
  }

  async playBGM(url: string | null) {
    if (!this.initialized) this.init();
    if (!this.context || !this.bgmGain) return;

    // Continuous music check: if already playing this exact track, preserve continuity!
    if (url && this.currentUrl === url && this.currentBGM) {
      return;
    }

    const now = this.context.currentTime;

    // Crossfade out existing BGM cleanly without audible pops
    if (this.currentBGM && this.currentGainNode) {
      const oldBGM = this.currentBGM;
      const oldGain = this.currentGainNode;
      this.currentBGM = null;
      this.currentGainNode = null;

      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setTargetAtTime(0, now, 0.35);
      setTimeout(() => {
        try {
          oldBGM.stop();
          oldBGM.disconnect();
          oldGain.disconnect();
        } catch {}
      }, 1200);
    }

    if (!url) {
      this.currentUrl = null;
      return;
    }

    this.currentUrl = url;

    try {
      const audioBuffer = await this.fetchAndDecode(url);
      if (!audioBuffer || this.currentUrl !== url || !this.context || !this.bgmGain) return;

      const source = this.context.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;

      const fadeNode = this.context.createGain();
      const startTime = this.context.currentTime;
      fadeNode.gain.setValueAtTime(0, startTime);
      fadeNode.gain.setTargetAtTime(1, startTime, 0.4);

      source.connect(fadeNode).connect(this.bgmGain);
      source.start();

      this.currentBGM = source;
      this.currentGainNode = fadeNode;
    } catch (e) {
      console.warn("Failed to initiate BGM:", e);
      this.currentUrl = null;
    }
  }
}

export const audio = new AudioEngine();
