export function createAmbience() {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const hum = context.createOscillator();
  hum.type = 'sine';
  hum.frequency.value = 55;
  const humGain = context.createGain();
  humGain.gain.value = .055;
  hum.connect(humGain).connect(master);
  hum.start();
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .06;
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 340;
  noise.connect(lowpass).connect(master);
  noise.start();
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    async enable(enabled: boolean) {
      clearTimeout(timer);
      if (enabled) {
        await context.resume();
        master.gain.setTargetAtTime(.65, context.currentTime, .3);
      } else {
        master.gain.setTargetAtTime(0, context.currentTime, .12);
        timer = setTimeout(() => { void context.suspend(); }, 650);
      }
    },
    cue() {
      if (context.state !== 'running') return;
      const tone = context.createOscillator(), gain = context.createGain();
      tone.frequency.setValueAtTime(480, context.currentTime);
      tone.frequency.exponentialRampToValueAtTime(720, context.currentTime + .13);
      gain.gain.setValueAtTime(.025, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .35);
      tone.connect(gain).connect(master);
      tone.start(); tone.stop(context.currentTime + .4);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    },
    close() { clearTimeout(timer); hum.stop(); noise.stop(); void context.close(); },
  };
}
