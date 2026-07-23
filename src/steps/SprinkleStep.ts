import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { randomRange } from '../utils/MathUtils';
import { FoodGraphics } from '../assets/visual/FoodGraphics';

export class SprinkleStep extends BaseStep {
  private anims!: AnimationSystem;
  private target!: Phaser.GameObjects.Graphics;
  private tapCount = 0;
  private requiredTaps: number;
  private progressDots: Phaser.GameObjects.Graphics[] = [];

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
    this.requiredTaps = this.visual.taps ?? 6;
  }

  enter(): void {
    const { centerX, centerY, scene } = this;
    const color = this.visual.itemColor ?? 0xffcc80;
    const size = 140;
    const itemName = this.visual.item ?? 'sprinkle';

    // Food item to sprinkle on
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

    this.createLabel(itemName, centerX, centerY - size / 2 - 20, '18px');

    // Progress dots
    const dotSpacing = 24;
    const dotsStartX = centerX - ((this.requiredTaps - 1) * dotSpacing) / 2;
    const dotsY = centerY + size / 2 + 24;

    for (let i = 0; i < this.requiredTaps; i++) {
      const dot = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
      dot.fillStyle(0xe0e0e0, 1);
      dot.fillCircle(dotsStartX + i * dotSpacing, dotsY, 8);
      this.progressDots.push(dot);
    }

    this.anims.popIn(this.target);

    this.target.on('pointerdown', () => {
      this.tapCount++;
      audioManager.playSfx(this.feedback.sound ?? 'sprinkle');

      // Update progress dot
      const idx = Math.min(this.tapCount - 1, this.requiredTaps - 1);
      const dot = this.progressDots[idx];
      dot.clear();
      dot.fillStyle(0xa5d6a7, 1);
      dot.fillCircle(
        this.centerX - ((this.requiredTaps - 1) * 24) / 2 + idx * 24,
        this.centerY + 70 + 24,
        8,
      );

      // Scatter particles on each tap
      for (let j = 0; j < 3; j++) {
        const px = this.target.x + randomRange(-40, 40);
        const py = this.target.y + randomRange(-30, 30);
        this.anims.emitCircleParticles(px, py, 'sparkle', 2, 40, 400);
      }

      this.anims.squash(this.target);

      if (this.tapCount >= this.requiredTaps) {
        this.target.disableInteractive();
        audioManager.playSfx('ding');
        this.scene.time.delayedCall(300, () => this.complete());
      }
    });
  }
}
