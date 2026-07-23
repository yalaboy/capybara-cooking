import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { FoodGraphics } from '../assets/visual/FoodGraphics';

export class PourStep extends BaseStep {
  private anims!: AnimationSystem;
  private container!: Phaser.GameObjects.Graphics;
  private target!: Phaser.GameObjects.Graphics;
  private fillLevel = 0;
  private pouring = false;
  private requiredAmount = 3000;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
  }

  enter(): void {
    const { centerX, scene } = this;
    const vh = scene.scale.height;

    const containerColor = this.visual.sourceColor ?? 0xffcc80;
    const targetColor = this.visual.targetColor ?? 0xbcaaa4;
    const itemName = this.visual.item ?? 'pour';

    // Pour target (bowl/cup) using FoodGraphics
    const targetX = centerX;
    const targetY = vh * 0.6;
    const targetSize = 120;

    const food = FoodGraphics.drawItem(scene, targetX, targetY, itemName, targetSize);
    if (food) {
      this.target = this.addObj(food) as unknown as Phaser.GameObjects.Graphics;
    } else {
      this.target = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
      this.target.fillStyle(targetColor, 1);
      this.target.fillRoundedRect(
        targetX - targetSize / 2,
        targetY - targetSize * 0.3,
        targetSize,
        targetSize * 0.6,
        { tl: 0, tr: 0, bl: 12, br: 12 },
      );
    }

    // Container (to pour from)
    const containerW = 60;
    const containerH = 80;
    const containerX = centerX;
    const containerY = vh * 0.3;

    this.container = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
    this.container.fillStyle(containerColor, 1);
    this.container.fillRoundedRect(
      containerX - containerW / 2,
      containerY - containerH / 2,
      containerW,
      containerH,
      8,
    );
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(
        containerX - containerW / 2,
        containerY - containerH / 2,
        containerW,
        containerH,
      ),
      Phaser.Geom.Rectangle.Contains,
    );

    this.createLabel(itemName, centerX, containerY - containerH, '18px');

    this.anims.popIn(this.container);
    this.anims.popIn(this.target);

    this.container.on('pointerdown', () => {
      this.pouring = true;
      this.container.disableInteractive();
      scene.tweens.add({
        targets: this.container,
        angle: 30,
        duration: 300,
        ease: 'Quad.easeOut',
      });
      audioManager.playSfx(this.feedback.sound ?? 'pour');
    });
  }

  update(_time: number, delta: number): void {
    if (!this.pouring) return;

    this.fillLevel += delta;
    const progress = Math.min(1, this.fillLevel / this.requiredAmount);

    const targetX = this.centerX;
    const targetY = this.scene.scale.height * 0.6;
    const fillH = 60 * progress;

    this.target.clear();
    this.target.fillStyle(0xbcaaa4, 1);
    this.target.fillRoundedRect(targetX - 60, targetY - 18, 120, 36, {
      tl: 0,
      tr: 0,
      bl: 12,
      br: 12,
    });
    this.target.fillStyle(0xffcc80, 0.8);
    this.target.fillRoundedRect(targetX - 55, targetY + 18 - fillH, 110, fillH, 8);

    if (progress >= 1) {
      this.pouring = false;
      audioManager.playSfx('ding');
      this.anims.squash(this.target);
      this.scene.time.delayedCall(200, () => this.complete());
    }
  }
}
