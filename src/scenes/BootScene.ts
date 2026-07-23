import Phaser from 'phaser';

interface ParticleDef {
  key: string;
  color: number;
  size: number;
  shape: 'circle' | 'square' | 'star';
}

const PARTICLE_DEFS: ParticleDef[] = [
  { key: 'star', color: 0xffe082, size: 12, shape: 'star' },
  { key: 'sparkle', color: 0xffffff, size: 8, shape: 'star' },
  { key: 'confetti', color: 0xff8a80, size: 10, shape: 'square' },
  { key: 'flour-puff', color: 0xfff9c4, size: 14, shape: 'circle' },
  { key: 'flour-dust', color: 0xfff9c4, size: 6, shape: 'circle' },
  { key: 'sauce-splat', color: 0xe53935, size: 8, shape: 'circle' },
  { key: 'cheese-shred', color: 0xffe082, size: 10, shape: 'square' },
  { key: 'pepperoni', color: 0xbf360c, size: 10, shape: 'circle' },
  { key: 'steam', color: 0xffffff, size: 8, shape: 'circle' },
  { key: 'flame-orange', color: 0xff6d00, size: 10, shape: 'circle' },
  { key: 'flame-yellow', color: 0xffd54f, size: 7, shape: 'circle' },
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.generateParticleTextures();
    this.scene.start('TitleScene');
  }

  private generateParticleTextures(): void {
    PARTICLE_DEFS.forEach((def) => {
      const size = def.size;
      const g = this.make.graphics({ x: 0, y: 0 }, false);

      if (def.shape === 'circle') {
        g.fillStyle(def.color, 1);
        g.fillCircle(size / 2, size / 2, size / 2);
      } else if (def.shape === 'square') {
        g.fillStyle(def.color, 1);
        g.fillRect(0, 0, size, size);
      } else if (def.shape === 'star') {
        this.drawStar(g, size / 2, size / 2, size / 4, size / 2, 5, def.color);
      }

      g.generateTexture(def.key, size, size);
      g.destroy();
    });
  }

  private drawStar(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    points: number,
    color: number,
  ): void {
    g.fillStyle(color, 1);
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
  }
}
