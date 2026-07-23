import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { FoodGraphics } from '../assets/visual/FoodGraphics';

export class WaitStep extends BaseStep {
  private anims!: AnimationSystem;
  private waitTime: number;
  private elapsed = 0;
  private display!: Phaser.GameObjects.Graphics;
  private dots: Phaser.GameObjects.Text[] = [];

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
    this.waitTime = this.visual.duration ?? 3000;
  }

  enter(): void {
    const { centerX, centerY, scene } = this;
    const color = this.visual.itemColor ?? 0xffcc80;
    const w = 160;
    const h = 100;
    const itemName = this.visual.item ?? 'cooking...';

    // Cooking display (oven, machine, etc.) using FoodGraphics
    const food = FoodGraphics.drawItem(scene, centerX, centerY, itemName, w);
    if (food) {
      this.display = this.addObj(food) as unknown as Phaser.GameObjects.Graphics;
    } else {
      this.display = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
      this.display.fillStyle(0xbcaaa4, 1);
      this.display.fillRoundedRect(centerX - w / 2, centerY - h / 2, w, h, 12);
      this.display.fillStyle(color, 0.6);
      this.display.fillRoundedRect(centerX - w / 2 + 8, centerY - h / 2 + 8, w - 16, h - 16, 8);
    }

    this.createLabel(itemName, centerX, centerY - h / 2 - 24, '18px');

    // Animated dots
    for (let i = 0; i < 3; i++) {
      const dot = this.scene.add.text(centerX - 20 + i * 20, centerY + h / 2 + 16, '.', {
        fontSize: '24px',
        color: '#8d6e63',
      });
      dot.setOrigin(0.5);
      this.dots.push(this.addObj(dot));

      this.anims.float(dot, 4, 600 + i * 200);
    }

    // Pulsing glow on the cooking area
    this.anims.pulse(this.display, 1.03, 800);

    this.anims.popIn(this.display);

    // Steam particles periodically
    scene.time.addEvent({
      delay: 400,
      repeat: Math.floor(this.waitTime / 400),
      callback: () => {
        audioManager.playSfx(this.feedback.sound ?? 'bubble');
        this.anims.emitCircleParticles(
          centerX + Phaser.Math.Between(-20, 20),
          centerY - h / 2,
          'steam',
          3,
          30,
          500,
        );
      },
    });
  }

  update(_time: number, delta: number): void {
    this.elapsed += delta;
    if (this.elapsed >= this.waitTime) {
      audioManager.playSfx('ding');
      this.anims.squash(this.display);
      this.scene.time.delayedCall(200, () => this.complete());
      this.elapsed = -9999;
    }
  }
}
