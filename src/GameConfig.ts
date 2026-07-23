export const GameConfig = {
  width: 1024,
  height: 768,
  minWidth: 640,
  minHeight: 480,
  maxWidth: 2048,
  maxHeight: 1536,

  backgroundColor: '#fce4ec',
  backgroundColorNumber: 0xfce4ec,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  input: {
    activePointers: 4,
    touch: {
      capture: true,
    },
  },

  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    transparent: false,
  },

  fps: {
    target: 60,
    forceSetTimeOut: false,
  },

  banner: false,
  audio: {
    disableWebAudio: false,
  },
} as Phaser.Types.Core.GameConfig;
