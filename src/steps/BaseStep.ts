import Phaser from 'phaser';
import type { StepConfig, FeedbackConfig } from '../types/recipe';

export interface StepContext {
  scene: Phaser.Scene;
  config: StepConfig;
  onComplete: () => void;
  centerX: number;
  centerY: number;
}

export abstract class BaseStep {
  protected scene: Phaser.Scene;
  protected config: StepConfig;
  protected onComplete: () => void;
  protected centerX: number;
  protected centerY: number;
  protected objects: Phaser.GameObjects.GameObject[] = [];

  constructor(ctx: StepContext) {
    this.scene = ctx.scene;
    this.config = ctx.config;
    this.onComplete = ctx.onComplete;
    this.centerX = ctx.centerX;
    this.centerY = ctx.centerY;
  }

  abstract enter(): void;

  update(_time: number, _delta: number): void {
    // Override if needed
  }

  exit(): void {
    this.objects.forEach((obj) => obj.destroy());
    this.objects = [];
  }

  protected complete(): void {
    this.onComplete();
  }

  protected get visual() {
    return this.config.visual;
  }

  protected get feedback(): FeedbackConfig {
    return this.config.feedback;
  }

  protected addObj<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.objects.push(obj);
    return obj;
  }

  protected createLabel(
    text: string,
    x: number,
    y: number,
    fontSize = '28px',
  ): Phaser.GameObjects.Text {
    const label = this.scene.add.text(x, y, text, {
      fontSize,
      color: '#5d4037',
      align: 'center',
    });
    label.setOrigin(0.5);
    return this.addObj(label);
  }

  protected createPlaceholder(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    radius = 12,
  ): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);
    return this.addObj(g) as unknown as Phaser.GameObjects.Graphics;
  }
}
