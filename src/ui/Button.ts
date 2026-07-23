import Phaser from 'phaser';

export interface ButtonConfig {
  x: number;
  y: number;
  text?: string;
  icon?: string;
  width?: number;
  height?: number;
  color?: number;
  textColor?: string;
  fontSize?: string;
  radius?: number;
  onPress: () => void;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text | null = null;
  private config: ButtonConfig;
  private normalColor: number;
  private pressColor: number;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    super(scene, config.x, config.y);
    scene.add.existing(this);

    this.config = config;
    this.normalColor = config.color ?? 0xff8a80;
    this.pressColor = this.darken(this.normalColor, 0.8);

    const w = config.width ?? 200;
    const h = config.height ?? 70;
    const r = config.radius ?? 16;

    this.bg = scene.add.graphics();
    this.drawBg(this.normalColor, w, h, r);
    this.add(this.bg);

    if (config.text) {
      this.label = scene.add.text(0, 0, config.text, {
        fontSize: config.fontSize ?? '32px',
        color: config.textColor ?? '#ffffff',
      });
      this.label.setOrigin(0.5);
      this.add(this.label);
    }

    this.setSize(w, h);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', () => {
      scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Quad.easeOut',
      });
    });

    this.on('pointerout', () => {
      this.drawBg(this.normalColor, w, h, r);
      scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Quad.easeOut',
      });
    });

    this.on('pointerdown', () => {
      this.drawBg(this.pressColor, w, h, r);
      scene.tweens.add({
        targets: this,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: false,
        ease: 'Quad.easeOut',
      });
    });

    this.on('pointerup', () => {
      this.drawBg(this.normalColor, w, h, r);
      scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeOut',
        onComplete: () => config.onPress(),
      });
    });
  }

  private drawBg(color: number, w: number, h: number, r: number): void {
    this.bg.clear();
    // Shadow
    this.bg.fillStyle(0x000000, 0.1);
    this.bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, r);
    // Main
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  }

  private darken(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xff) * factor);
    const g = Math.floor(((color >> 8) & 0xff) * factor);
    const b = Math.floor((color & 0xff) * factor);
    return (r << 16) | (g << 8) | b;
  }

  setText(text: string): void {
    this.label?.setText(text);
  }
}
