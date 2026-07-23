import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { distance } from '../utils/MathUtils';
import { FoodGraphics } from '../assets/visual/FoodGraphics';

export class DragStep extends BaseStep {
  private anims!: AnimationSystem;
  private dragObj!: Phaser.GameObjects.Graphics;
  private fromX = 0;
  private fromY = 0;
  private toX = 0;
  private toY = 0;
  private hitRadius = 60;
  private onDrag?: (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => void;
  private onDragEnd?: (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => void;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
  }

  enter(): void {
    const { scene } = this;
    const vw = scene.scale.width;
    const vh = scene.scale.height;
    const color = this.visual.itemColor ?? 0xffcc80;
    const itemName = this.visual.item ?? 'item';

    this.fromX = this.visual.from?.x ?? vw * 0.25;
    this.fromY = this.visual.from?.y ?? vh * 0.5;
    this.toX = this.visual.to?.x ?? vw * 0.75;
    this.toY = this.visual.to?.y ?? vh * 0.5;

    const lowerItem = itemName.toLowerCase();
    if (lowerItem.includes('dough')) {
      this.hitRadius = 150;
    } else if (lowerItem.includes('patty')) {
      this.addObj(FoodGraphics.bottomBun(scene, this.toX, this.toY, 140, 50));
      this.hitRadius = 80;
    } else if (lowerItem.includes('meat')) {
      this.addObj(FoodGraphics.tortilla(scene, this.toX, this.toY, 65));
      this.hitRadius = 80;
    } else {
      const target = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
      target.fillStyle(0xc8e6c9, 0.5);
      target.fillRoundedRect(this.toX - 50, this.toY - 50, 100, 100, 12);
      target.lineStyle(2, 0xa5d6a7, 0.8);
      target.strokeRoundedRect(this.toX - 50, this.toY - 50, 100, 100, 12);
    }

    const size = 80;
    const food = FoodGraphics.drawItem(scene, 0, 0, itemName, size);
    if (food) {
      this.dragObj = this.addObj(food) as unknown as Phaser.GameObjects.Graphics;
    } else {
      this.dragObj = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
      this.dragObj.fillStyle(color, 1);
      this.dragObj.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
    }
    this.dragObj.setPosition(this.fromX, this.fromY);
    this.dragObj.setInteractive(
      new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
      Phaser.Geom.Rectangle.Contains,
    );
    scene.input.setDraggable(this.dragObj);

    const label = this.createLabel(itemName, 0, 0, '16px');
    label.setPosition(this.fromX, this.fromY);

    if (lowerItem.includes('dough')) {
      this.dragObj.setScale(0);
      this.dragObj.setAlpha(0);
      scene.tweens.add({
        targets: this.dragObj,
        scaleX: 0.525,
        scaleY: 0.525,
        alpha: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });

      const arrow = this.addObj(scene.add.text(this.fromX, this.fromY - 45, '\u2B07', {
        fontSize: '20px',
        color: '#ff8a80',
      })) as unknown as Phaser.GameObjects.Text;
      arrow.setOrigin(0.5);
      scene.tweens.add({
        targets: arrow,
        y: arrow.y + 8,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 400,
      });
    } else {
      this.anims.popIn(this.dragObj);
    }

    this.onDrag = (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      if (obj !== this.dragObj) return;
      this.dragObj.x = p.x;
      this.dragObj.y = p.y;
      label.setPosition(p.x, p.y);
    };

    this.onDragEnd = (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      if (obj !== this.dragObj) return;
      const dist = distance(this.dragObj.x, this.dragObj.y, this.toX, this.toY);
      if (dist < this.hitRadius) {
        this.dragObj.disableInteractive();
        audioManager.playSfx(this.feedback.sound ?? 'plop');
        this.anims.squash(this.dragObj);
        scene.time.delayedCall(200, () => this.complete());
      } else {
        scene.tweens.add({
          targets: [this.dragObj, label],
          x: this.fromX,
          y: this.fromY,
          duration: 200,
          ease: 'Back.easeOut',
        });
      }
    };

    scene.input.on('drag', this.onDrag);
    scene.input.on('dragend', this.onDragEnd);
  }

  exit(): void {
    if (this.onDrag) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      this.scene.input.off('drag', this.onDrag as Function);
    }
    if (this.onDragEnd) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      this.scene.input.off('dragend', this.onDragEnd as Function);
    }
    super.exit();
  }
}
