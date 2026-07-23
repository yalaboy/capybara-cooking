import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { FoodGraphics } from '../assets/visual/FoodGraphics';

export class TapStep extends BaseStep {
  private anims!: AnimationSystem;
  private target!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
  }

  enter(): void {
    const { centerX, centerY, scene } = this;
    const color = this.visual.itemColor ?? 0xffcc80;
    const itemName = this.visual.item ?? 'item';

    const food = FoodGraphics.drawItem(scene, centerX, centerY, itemName, 120);
    if (food) {
      this.target = this.addObj(food) as unknown as Phaser.GameObjects.Graphics;
    } else {
      const size = 120;
      this.target = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
      this.target.fillStyle(color, 1);
      this.target.fillRoundedRect(centerX - size / 2, centerY - size / 2, size, size, 16);
    }

    this.target.setInteractive(
      new Phaser.Geom.Rectangle(centerX - 60, centerY - 60, 120, 120),
      Phaser.Geom.Rectangle.Contains,
    );

    this.label = this.createLabel(itemName, centerX, centerY, '20px');

    this.anims.popIn(this.target);
    this.anims.float(this.target);

    this.target.on('pointerdown', () => {
      this.target.disableInteractive();
      audioManager.playSfx(this.feedback.sound ?? 'pop');
      this.anims.squash(this.target);
      scene.time.delayedCall(200, () => this.complete());
    });
  }
}
