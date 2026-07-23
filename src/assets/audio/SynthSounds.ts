import Phaser from 'phaser';

type SynthFn = (ctx: AudioContext, dest: AudioNode) => void;

let bgmNode: AudioBufferSourceNode | null = null;
let bgmGain: GainNode | null = null;

export function resumeAudioContext(scene: Phaser.Scene): void {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager)?.context;
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function playSynth(scene: Phaser.Scene, key: string, volume: number): void {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager)?.context;
  if (!ctx || ctx.state === 'closed') return;
  if (ctx.state === 'suspended') ctx.resume();

  const vol = Math.min(1, volume);

  const SOUNDS: Record<string, SynthFn> = {
    pop: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.15;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 600 - t * 3000;
        d[i] = Math.sin(2 * Math.PI * freq * t) * Math.max(0, 1 - t * 7) * 0.3;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    plop: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.25;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 400 - t * 1200;
        d[i] = (Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.3)
          * Math.max(0, 1 - t * 5) * 0.3;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    ding: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.4;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        d[i] = (
          Math.sin(2 * Math.PI * 880 * t) * 0.4 +
          Math.sin(2 * Math.PI * 1320 * t) * 0.2 +
          Math.sin(2 * Math.PI * 1760 * t) * 0.1
        ) * Math.max(0, 1 - t * 3) * 0.3;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    sprinkle: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.3;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        d[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t * 4) * 0.15;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    stir: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.6;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 200 + Math.sin(t * 20) * 100;
        d[i] = Math.sin(2 * Math.PI * freq * t) * 0.1 * Math.max(0, 1 - t * 1.5);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    pour: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.5;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const noise = (Math.random() * 2 - 1) * 0.06;
        const tone = Math.sin(2 * Math.PI * (100 + t * 200) * t) * 0.08;
        d[i] = (noise + tone) * Math.max(0, 1 - t * 2);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    bubble: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.3;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 300 + Math.sin(t * 40) * 200;
        d[i] = Math.sin(2 * Math.PI * freq * t) * 0.2 * Math.max(0, 1 - t * 4);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    sizzle: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.4;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        d[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t * 2.5) * 0.08;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    button: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.08;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        d[i] = Math.sin(2 * Math.PI * 800 * t) * Math.max(0, 1 - t * 15) * 0.25;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    fanfare: (_ctx, dest) => {
      const notes = [523, 659, 784, 1047];
      const noteLen = 0.2;
      const totalLen = notes.length * noteLen;
      const bufSize = ctx.sampleRate * totalLen;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let n = 0; n < notes.length; n++) {
        const freq = notes[n];
        for (let i = 0; i < bufSize; i++) {
          const t = i / ctx.sampleRate;
          const localT = t - n * noteLen;
          if (localT < 0 || localT >= noteLen) continue;
          const env = Math.max(0, 1 - localT / noteLen);
          d[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.25;
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.7;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    'i-like-ketchup': (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.8;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      const notes = [660, 880, 1047];
      for (let n = 0; n < notes.length; n++) {
        const freq = notes[n];
        for (let i = 0; i < bufSize; i++) {
          const t = i / ctx.sampleRate;
          const localT = t - n * 0.25;
          if (localT < 0 || localT >= 0.25) continue;
          const env = Math.max(0, 1 - localT / 0.25);
          d[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.2;
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.8;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    'yummy-yummy': (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.9;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      const notes = [784, 988, 784, 988];
      for (let n = 0; n < notes.length; n++) {
        const freq = notes[n];
        for (let i = 0; i < bufSize; i++) {
          const t = i / ctx.sampleRate;
          const localT = t - n * 0.2;
          if (localT < 0 || localT >= 0.22) continue;
          const env = Math.max(0, 1 - localT / 0.22);
          d[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.22;
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.8;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    'yay-ketchup': (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.7;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      const notes = [523, 659, 784];
      for (let n = 0; n < notes.length; n++) {
        const freq = notes[n];
        for (let i = 0; i < bufSize; i++) {
          const t = i / ctx.sampleRate;
          const localT = t - n * 0.2;
          if (localT < 0 || localT >= 0.22) continue;
          const env = Math.max(0, 1 - localT / 0.22);
          d[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.2;
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.8;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    coin: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.15;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        d[i] = (Math.sin(2 * Math.PI * 1200 * t) + Math.sin(2 * Math.PI * 1800 * t) * 0.3)
          * Math.max(0, 1 - t * 8) * 0.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    hold: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 0.8;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 440 + Math.sin(t * 4) * 40;
        d[i] = Math.sin(2 * Math.PI * freq * t) * Math.min(1, t * 4) * Math.max(0, 1 - (t - 0.5) * 2) * 0.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    unlock: (_ctx, dest) => {
      const notes = [660, 880, 1100, 1320];
      const noteLen = 0.15;
      const totalLen = notes.length * noteLen;
      const bufSize = ctx.sampleRate * totalLen;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let n = 0; n < notes.length; n++) {
        const freq = notes[n];
        for (let i = 0; i < bufSize; i++) {
          const t = i / ctx.sampleRate;
          const localT = t - n * noteLen;
          if (localT < 0 || localT >= noteLen) continue;
          const env = Math.max(0, 1 - localT / noteLen);
          d[i] += Math.sin(2 * Math.PI * freq * t) * env * 0.2;
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },

    scream: (_ctx, dest) => {
      const bufSize = ctx.sampleRate * 1.2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 800 + Math.sin(t * 30) * 200 + t * 200;
        const env = Math.min(1, t * 10) * Math.max(0, 1 - (t - 0.8) * 5);
        d[i] = (Math.sin(2 * Math.PI * freq * t) * 0.3 + (Math.random() - 0.5) * 0.15) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(dest);
      src.start();
    },
  };

  const fn = SOUNDS[key];
  if (fn) {
    fn(ctx, ctx.destination);
  }
}

export function isWebAudio(scene: Phaser.Scene): boolean {
  try {
    return (scene.sound as Phaser.Sound.WebAudioSoundManager).context !== undefined;
  } catch {
    return false;
  }
}

function generateBgmTitle(ctx: AudioContext): Float32Array {
  const bpm = 100;
  const beatSec = 60 / bpm;
  const beats = 8;
  const totalSec = beats * beatSec;
  const sampleRate = ctx.sampleRate;
  const bufSize = Math.floor(sampleRate * totalSec);
  const d = new Float32Array(bufSize);

  const melody = [
    { note: 523, beat: 0, dur: 1.5 }, // C5
    { note: 659, beat: 1, dur: 1 },   // E5
    { note: 784, beat: 2, dur: 1.5 }, // G5
    { note: 1047, beat: 3, dur: 1.5 },// C6
    { note: 784, beat: 4, dur: 1.5 }, // G5
    { note: 659, beat: 5, dur: 1 },   // E5
    { note: 523, beat: 6, dur: 2 },   // C5
    { note: 0, beat: 7, dur: 1 },     // rest
  ] as const;

  for (const m of melody) {
    if (m.note === 0) continue;
    const startSample = Math.floor(m.beat * beatSec * sampleRate);
    const endSample = Math.floor((m.beat * beatSec + m.dur) * sampleRate);
    for (let i = startSample; i < Math.min(endSample, bufSize); i++) {
      const t = (i - startSample) / sampleRate;
      const env = Math.max(0, 1 - t / m.dur);
      d[i] += Math.sin(2 * Math.PI * m.note * t) * env * 0.15;
    }
  }

  // Harmony pad (soft strings)
  const chords = [
    { note: 262, beat: 0 }, // C4
    { note: 330, beat: 0 }, // E4
    { note: 392, beat: 0 }, // G4
  ];
  for (const c of chords) {
    for (let i = 0; i < bufSize; i++) {
      const t = i / sampleRate;
      const beatPos = t / beatSec;
      if (beatPos > 7) break;
      d[i] += Math.sin(2 * Math.PI * c.note * t) * 0.04;
    }
  }

  // Bass line
  const bass = [
    { note: 131, beat: 0, dur: 4 }, // C3
    { note: 98, beat: 4, dur: 4 },  // G2
  ];
  for (const b of bass) {
    const startSample = Math.floor(b.beat * beatSec * sampleRate);
    const endSample = Math.floor((b.beat * beatSec + b.dur) * sampleRate);
    for (let i = startSample; i < Math.min(endSample, bufSize); i++) {
      const t = (i - startSample) / sampleRate;
      d[i] += Math.sin(2 * Math.PI * b.note * t * 0.5) * 0.06;
    }
  }

  return d;
}

function generateBgmHappy(ctx: AudioContext): Float32Array {
  const bpm = 130;
  const beatSec = 60 / bpm;
  const beats = 8;
  const totalSec = beats * beatSec;
  const sampleRate = ctx.sampleRate;
  const bufSize = Math.floor(sampleRate * totalSec);
  const d = new Float32Array(bufSize);

  const melody = [
    { note: 523, beat: 0, dur: 0.5 },
    { note: 659, beat: 0.5, dur: 0.5 },
    { note: 784, beat: 1, dur: 0.5 },
    { note: 1047, beat: 1.5, dur: 1 },
    { note: 784, beat: 2.5, dur: 0.5 },
    { note: 659, beat: 3, dur: 0.5 },
    { note: 523, beat: 3.5, dur: 0.5 },
    { note: 659, beat: 4, dur: 0.5 },
    { note: 784, beat: 4.5, dur: 0.5 },
    { note: 1047, beat: 5, dur: 1 },
    { note: 784, beat: 6, dur: 0.5 },
    { note: 523, beat: 6.5, dur: 1.5 },
  ];

  for (const m of melody) {
    const startSample = Math.floor(m.beat * beatSec * sampleRate);
    const endSample = Math.floor((m.beat * beatSec + m.dur) * sampleRate);
    for (let i = startSample; i < Math.min(endSample, bufSize); i++) {
      const t = (i - startSample) / sampleRate;
      const env = Math.max(0, 1 - t / m.dur) * Math.min(1, t * 20);
      d[i] += Math.sin(2 * Math.PI * m.note * t) * env * 0.15;
    }
  }

  const bass = [
    { note: 131, beat: 0, dur: 2 },
    { note: 165, beat: 2, dur: 2 },
    { note: 196, beat: 4, dur: 2 },
    { note: 131, beat: 6, dur: 2 },
  ];
  for (const b of bass) {
    const startSample = Math.floor(b.beat * beatSec * sampleRate);
    const endSample = Math.floor((b.beat * beatSec + b.dur) * sampleRate);
    for (let i = startSample; i < Math.min(endSample, bufSize); i++) {
      const t = (i - startSample) / sampleRate;
      d[i] += Math.sin(2 * Math.PI * b.note * t * 0.5) * 0.08;
    }
  }

  return d;
}

function generateBgmDanger(ctx: AudioContext): Float32Array {
  const bpm = 160;
  const beatSec = 60 / bpm;
  const beats = 8;
  const totalSec = beats * beatSec;
  const sampleRate = ctx.sampleRate;
  const bufSize = Math.floor(sampleRate * totalSec);
  const d = new Float32Array(bufSize);

  const melody = [
    { note: 330, beat: 0, dur: 0.3 },
    { note: 311, beat: 0.3, dur: 0.3 },
    { note: 294, beat: 0.6, dur: 0.3 },
    { note: 330, beat: 1, dur: 0.5 },
    { note: 294, beat: 1.5, dur: 0.5 },
    { note: 262, beat: 2, dur: 0.3 },
    { note: 247, beat: 2.3, dur: 0.3 },
    { note: 262, beat: 2.6, dur: 0.4 },
    { note: 294, beat: 3, dur: 0.5 },
    { note: 330, beat: 3.5, dur: 0.5 },
    { note: 294, beat: 4, dur: 0.3 },
    { note: 262, beat: 4.3, dur: 0.3 },
    { note: 247, beat: 4.6, dur: 0.4 },
    { note: 220, beat: 5, dur: 1 },
    { note: 247, beat: 6, dur: 0.5 },
    { note: 262, beat: 6.5, dur: 1.5 },
  ];

  for (const m of melody) {
    const startSample = Math.floor(m.beat * beatSec * sampleRate);
    const endSample = Math.floor((m.beat * beatSec + m.dur) * sampleRate);
    for (let i = startSample; i < Math.min(endSample, bufSize); i++) {
      const t = (i - startSample) / sampleRate;
      const env = Math.max(0, 1 - t / m.dur) * Math.min(1, t * 30);
      d[i] += (Math.sin(2 * Math.PI * m.note * t) * 0.12 + Math.sin(2 * Math.PI * m.note * 2 * t) * 0.04) * env;
    }
  }

  const bass = [
    { note: 110, beat: 0, dur: 2 },
    { note: 123, beat: 2, dur: 2 },
    { note: 110, beat: 4, dur: 2 },
    { note: 98, beat: 6, dur: 2 },
  ];
  for (const b of bass) {
    const startSample = Math.floor(b.beat * beatSec * sampleRate);
    const endSample = Math.floor((b.beat * beatSec + b.dur) * sampleRate);
    for (let i = startSample; i < Math.min(endSample, bufSize); i++) {
      const t = (i - startSample) / sampleRate;
      d[i] += Math.sin(2 * Math.PI * b.note * t * 0.5) * 0.1;
    }
  }

  return d;
}

function generateBgmSad(ctx: AudioContext): Float32Array {
  const bpm = 70;
  const beatSec = 60 / bpm;
  const beats = 8;
  const totalSec = beats * beatSec;
  const sampleRate = ctx.sampleRate;
  const bufSize = Math.floor(sampleRate * totalSec);
  const d = new Float32Array(bufSize);

  const melody = [
    { note: 392, beat: 0, dur: 2 },
    { note: 370, beat: 2, dur: 1 },
    { note: 349, beat: 3, dur: 1.5 },
    { note: 330, beat: 4.5, dur: 1.5 },
    { note: 349, beat: 6, dur: 1 },
    { note: 330, beat: 7, dur: 1 },
  ];

  for (const m of melody) {
    const startSample = Math.floor(m.beat * beatSec * sampleRate);
    const endSample = Math.floor((m.beat * beatSec + m.dur) * sampleRate);
    for (let i = startSample; i < Math.min(endSample, bufSize); i++) {
      const t = (i - startSample) / sampleRate;
      const env = Math.max(0, 1 - t / m.dur) * Math.min(1, t * 5);
      d[i] += Math.sin(2 * Math.PI * m.note * t) * env * 0.12;
    }
  }

  const pad = [
    { note: 196, beat: 0 },
    { note: 262, beat: 0 },
    { note: 330, beat: 0 },
  ];
  for (const p of pad) {
    for (let i = 0; i < bufSize; i++) {
      const t = i / sampleRate;
      d[i] += Math.sin(2 * Math.PI * p.note * t) * 0.025;
    }
  }

  return d;
}

export function playBgmSynth(scene: Phaser.Scene, key: string, volume: number): void {
  const ctx = (scene.sound as Phaser.Sound.WebAudioSoundManager)?.context;
  if (!ctx || ctx.state === 'closed') return;
  if (ctx.state === 'suspended') ctx.resume();

  if (bgmNode) stopBgmSynth();

  const sampleRate = ctx.sampleRate;
  let data: Float32Array | null = null;

  if (key === 'bgm-title') {
    data = generateBgmTitle(ctx);
  } else if (key === 'bgm-happy') {
    data = generateBgmHappy(ctx);
  } else if (key === 'bgm-danger') {
    data = generateBgmDanger(ctx);
  } else if (key === 'bgm-sad') {
    data = generateBgmSad(ctx);
  }

  if (!data) return;

  const buf = ctx.createBuffer(1, data.length, sampleRate);
  buf.getChannelData(0).set(data);

  bgmGain = ctx.createGain();
  bgmGain.gain.value = volume * 0.8;

  bgmNode = ctx.createBufferSource();
  bgmNode.buffer = buf;
  bgmNode.loop = true;
  bgmNode.connect(bgmGain);
  bgmGain.connect(ctx.destination);
  bgmNode.start();
}

export function stopBgmSynth(): void {
  try {
    bgmNode?.stop();
    bgmNode?.disconnect();
    bgmGain?.disconnect();
  } catch { /* ignore */ }
  bgmNode = null;
  bgmGain = null;
}
