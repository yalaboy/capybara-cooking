import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { FoodGraphics } from '../assets/visual/FoodGraphics';

export class HoldStep extends BaseStep {
  private anims!: AnimationSystem;
  private target!: Phaser.GameObjects.Graphics;
  private progressBg!: Phaser.GameObjects.Graphics;
  private progressFill!: Phaser.GameObjects.Graphics;
  private holding = false;
  private holdTime = 0;
  private requiredTime: number;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
    this.requiredTime = this.visual.duration ?? 2000;
  }

  enter(): void {
    const { centerX, centerY, scene } = this;
    const color = this.visual.itemColor ?? 0xffcc80;
    const itemName = this.visual.item ?? 'hold';
    const size = 140;
    const barWidth = 160;
    const barHeight = 16;

    // Hold target
    const food = FoodGraphics.drawItem(scene, centerX, centerY, itemName, size);
    if (food) {
      this.target = this.addObj(food) as unknown as Phaser.GameObjects.Graphics;
    } else {
      this.target = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
      this.target.fillStyle(color, 1);
      this.target.fillRoundedRect(centerX - size / 2, centerY - size / 2, size, size, 16);
    }
    this.target.setInteractive(
      new Phaser.Geom.Rectangle(centerX - size / 2, centerY - size / 2, size, size),
      Phaser.Geom.Rectangle.Contains,
    );

    // Progress bar background
    this.progressBg = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
    this.progressBg.fillStyle(0xe0e0e0, 1);
    this.progressBg.fillRoundedRect(
      centerX - barWidth / 2,
      centerY + size / 2 + 16,
      barWidth,
      barHeight,
      8,
    );

    // Progress bar fill
    this.progressFill = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
    this.progressFill.fillStyle(0xa5d6a7, 1);

    this.createLabel(this.visual.item ?? 'hold', centerX, centerY - 40, '18px');

    this.anims.popIn(this.target);

    this.target.on('pointerdown', () => {
      this.holding = true;
      audioManager.playSfx(this.feedback.sound ?? 'hold');
    });

    this.target.on('pointerup', () => {
      this.holding = false;
    });

    this.target.on('pointerout', () => {
      this.holding = false;
    });
  }

  update(_time: number, delta: number): void {
    if (!this.holding) {
      this.holdTime = Math.max(0, this.holdTime - delta * 0.5);
    } else {
      this.holdTime += delta;
    }

    const progress = Math.min(1, this.holdTime / this.requiredTime);
    const barWidth = 160;
    const barHeight = 16;
    const barX = this.centerX - barWidth / 2;
    const barY = this.centerY + 70 + 16;

    this.progressFill.clear();
    this.progressFill.fillStyle(0xa5d6a7, 1);
    this.progressFill.fillRoundedRect(barX, barY, barWidth * progress, barHeight, 8);

    if (progress >= 1) {
      this.target.disableInteractive();
      this.holding = false;
      audioManager.playSfx('ding');
      this.anims.squash(this.target);
      this.scene.time.delayedCall(200, () => this.complete());
    }
  }
}
