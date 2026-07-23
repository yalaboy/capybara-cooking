import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { normalizeAngle } from '../utils/MathUtils';
import { FoodGraphics } from '../assets/visual/FoodGraphics';

export class StirStep extends BaseStep {
  private anims!: AnimationSystem;
  private bowl!: Phaser.GameObjects.Graphics;
  private tool!: Phaser.GameObjects.Graphics;
  private rotationAccum = 0;
  private requiredRotation = Math.PI * 4;
  private lastAngle = 0;
  private tracking = false;
  private isRolling = false;
  private strokes = 0;
  private requiredStrokes = 10;
  private lastY = 0;
  private lastDirection = 0;
  private strokeDist = 0;
  private totalDist = 0;
  private completed = false;
  private onPointerMove?: (p: Phaser.Input.Pointer) => void;
  private onPointerUp?: () => void;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
  }

  private get posX(): number { return this.visual.to?.x ?? this.centerX; }
  private get posY(): number { return this.visual.to?.y ?? this.centerY; }

  enter(): void {
    const { scene } = this;
    const px = this.posX;
    const py = this.posY;
    const bowlColor = this.visual.itemColor ?? 0xbcaaa4;
    const bowlSize = 120;
    const itemName = this.visual.item ?? 'stir';
    const toolName = this.visual.tool ?? '';
    this.isRolling = toolName.toLowerCase().includes('roll') || toolName.toLowerCase().includes('pin');

    if (this.isRolling) {
      this.bowl = this.addObj(FoodGraphics.doughBall(scene, 0, 0, 40)) as unknown as Phaser.GameObjects.Graphics;
      this.bowl.setPosition(px, py);
      this.bowl.setScale(0);
      this.bowl.setAlpha(0);
      scene.tweens.add({
        targets: this.bowl,
        scaleX: 0.525,
        scaleY: 0.525,
        alpha: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });

      const pinG = FoodGraphics.rollingPin(scene, 0, 0);
      this.tool = this.addObj(pinG) as unknown as Phaser.GameObjects.Graphics;
      this.tool.setPosition(px, py);

      const hint = this.addObj(scene.add.text(px, py + 70, '\u2B06  Move up & down  \u2B07', {
        fontSize: '14px',
        color: '#8d6e63',
      })) as unknown as Phaser.GameObjects.Text;
      hint.setOrigin(0.5);
      hint.setAlpha(0);
      scene.tweens.add({
        targets: hint,
        alpha: 0.8,
        duration: 400,
        delay: 600,
      });

      const arrowUp = this.addObj(scene.add.text(px - 50, py - 20, '\u2B06', {
        fontSize: '20px',
        color: '#a5d6a7',
      })) as unknown as Phaser.GameObjects.Text;
      arrowUp.setOrigin(0.5);
      const arrowDown = this.addObj(scene.add.text(px - 50, py + 20, '\u2B07', {
        fontSize: '20px',
        color: '#a5d6a7',
      })) as unknown as Phaser.GameObjects.Text;
      arrowDown.setOrigin(0.5);

      scene.tweens.add({
        targets: arrowUp,
        y: arrowUp.y - 8,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 800,
      });
      scene.tweens.add({
        targets: arrowDown,
        y: arrowDown.y + 8,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 800,
      });
    } else {
      const food = FoodGraphics.drawItem(scene, px, py, itemName, bowlSize);
      if (food) {
        this.bowl = this.addObj(food) as unknown as Phaser.GameObjects.Graphics;
      } else {
        this.bowl = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
        this.bowl.fillStyle(bowlColor, 1);
        this.bowl.fillEllipse(px, py, bowlSize, bowlSize * 0.7);
        this.bowl.fillStyle(0xd7ccc8, 1);
        this.bowl.fillEllipse(px, py, bowlSize * 0.8, bowlSize * 0.55);
      }

      const isWhisk = toolName.toLowerCase().includes('whisk');
      if (isWhisk) {
        this.tool = this.addObj(FoodGraphics.whisk(scene, 0, 0)) as unknown as Phaser.GameObjects.Graphics;
        this.tool.setPosition(px + 15, py);
      } else {
        const spoonColor = this.visual.toolColor ?? 0xffffff;
        this.tool = this.addObj(scene.add.graphics()) as unknown as Phaser.GameObjects.Graphics;
        this.tool.fillStyle(spoonColor, 1);
        this.tool.fillCircle(0, 0, 15);
        this.tool.fillRect(0, -4, 50, 8);
        this.tool.setPosition(px + 20, py);
      }
    }

    this.anims.popIn(this.bowl);
    this.createLabel(this.visual.item ?? 'stir', px, py - bowlSize * 0.5 - 20, '18px');

    const zone = this.addObj(
      scene.add.zone(px, py, bowlSize * 1.5, bowlSize * 1.5).setInteractive(),
    ) as unknown as Phaser.GameObjects.Zone;

    zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.tracking = true;
      if (this.isRolling) {
        this.lastY = p.y;
      } else {
        this.lastAngle = Math.atan2(p.y - py, p.x - px);
      }
    });

    this.onPointerMove = (p: Phaser.Input.Pointer) => {
      if (!this.tracking || !p.isDown) return;

      if (this.isRolling) {
        const dir = p.y > this.lastY ? 1 : -1;
        const dy = Math.abs(p.y - this.lastY);
        this.strokeDist += dy;
        this.totalDist += dy;
        this.lastY = p.y;

        this.tool.y = Phaser.Math.Clamp(p.y, py - 80, py + 80);

        if (dir !== this.lastDirection && this.lastDirection !== 0 && this.strokeDist > 20) {
          this.strokes++;
          this.strokeDist = 0;
          audioManager.playSfx(this.feedback.sound ?? 'stir');
        }
        this.lastDirection = dir;

        const distTarget = this.requiredStrokes * 160;
        const progress = Math.min(1, this.totalDist / distTarget);
        const scale = 0.525 + progress * 3.075;
        this.bowl.setScale(scale);

        if (this.strokes >= this.requiredStrokes && !this.completed) {
          this.completed = true;
          this.tracking = false;
          audioManager.playSfx('ding');
          this.anims.squash(this.bowl);
          scene.time.delayedCall(200, () => this.complete());
        }
      } else {
        const angle = Math.atan2(p.y - py, p.x - px);
        const delta = normalizeAngle(angle - this.lastAngle);
        this.rotationAccum += Math.abs(delta);
        this.lastAngle = angle;

        this.tool.x = px + Math.cos(angle) * 30;
        this.tool.y = py + Math.sin(angle) * 20;

        if (
          Math.floor(this.rotationAccum / (Math.PI * 2)) >
          Math.floor((this.rotationAccum - Math.abs(delta)) / (Math.PI * 2))
        ) {
          audioManager.playSfx(this.feedback.sound ?? 'stir');
        }
      }
    };

    this.onPointerUp = () => {
      this.tracking = false;
    };

    scene.input.on('pointermove', this.onPointerMove);
    scene.input.on('pointerup', this.onPointerUp);
  }

  update(): void {
    if (this.isRolling) return;
    const progress = Math.min(1, this.rotationAccum / this.requiredRotation);
    if (progress >= 1 && !this.completed) {
      this.completed = true;
      audioManager.playSfx('ding');
      this.anims.squash(this.bowl);
      this.scene.time.delayedCall(200, () => this.complete());
    }
  }

  exit(): void {
    if (this.onPointerMove) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      this.scene.input.off('pointermove', this.onPointerMove as Function);
    }
    if (this.onPointerUp) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      this.scene.input.off('pointerup', this.onPointerUp as Function);
    }
    super.exit();
  }
}
