import Phaser from 'phaser';
import { AnimationSystem } from '../systems/AnimationSystem';
import type { EmotionType } from '../types/recipe';
import { UIStyles } from '../assets/visual/UIStyles';

const EMOTION_COLORS: Record<EmotionType, { face: number; cheek: number }> = {
  idle: { face: 0xbcaaa4, cheek: 0xf48fb1 },
  happy: { face: 0xbcaaa4, cheek: 0xf48fb1 },
  focused: { face: 0xa1887f, cheek: 0xf48fb1 },
  excited: { face: 0xbcaaa4, cheek: 0xef5350 },
  surprised: { face: 0xbcaaa4, cheek: 0xf48fb1 },
  proud: { face: 0xbcaaa4, cheek: 0xf48fb1 },
  drool: { face: 0xbcaaa4, cheek: 0xf48fb1 },
  spicy: { face: 0xef9a9a, cheek: 0xef5350 },
};

export class Capybara {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private anims: AnimationSystem;
  private body!: Phaser.GameObjects.Graphics;
  private leftEye!: Phaser.GameObjects.Container;
  private rightEye!: Phaser.GameObjects.Container;
  private mouth!: Phaser.GameObjects.Graphics;
  private leftCheek!: Phaser.GameObjects.Graphics;
  private rightCheek!: Phaser.GameObjects.Graphics;
  private chefHat!: Phaser.GameObjects.Graphics;
  private whiskers!: Phaser.GameObjects.Graphics;
  private blinkTimer: Phaser.Time.TimerEvent | null = null;
  private currentEmotion: EmotionType = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, scale = 1) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setScale(scale);
    this.anims = new AnimationSystem(scene);

    this.drawBody();
    this.drawFace('idle');
    this.drawHat();
    this.startIdleAnimation();
    this.startBlinking();
  }

  private drawBody(): void {
    const g = this.scene.add.graphics();
    this.body = g;

    // Shadow
    g.fillStyle(0x000000, 0.06);
    g.fillEllipse(3, 48, 80, 20);

    // Body
    g.fillStyle(0xbcaaa4, 1);
    g.fillEllipse(0, 10, 100, 80);

    // Belly highlight
    g.fillStyle(0xefebe9, 0.4);
    g.fillEllipse(0, 18, 60, 50);

    // Arms
    g.fillStyle(0xa1887f, 1);
    g.fillEllipse(-42, 5, 16, 30);
    g.fillEllipse(42, 5, 16, 30);

    // Head
    g.fillStyle(0xbcaaa4, 1);
    g.fillEllipse(0, -22, 74, 64);

    // Ears
    g.fillStyle(0xa1887f, 1);
    g.fillEllipse(-26, -50, 20, 16);
    g.fillEllipse(26, -50, 20, 16);

    // Inner ears
    g.fillStyle(0xf48fb1, 0.5);
    g.fillEllipse(-26, -50, 12, 9);
    g.fillEllipse(26, -50, 12, 9);

    // Nose
    g.fillStyle(0x6d4c41, 1);
    g.fillEllipse(0, -18, 16, 12);

    // Nose highlight
    g.fillStyle(0x8d6e63, 0.3);
    g.fillEllipse(3, -20, 6, 5);

    this.container.add(g);
  }

  private sweatDrops: Phaser.GameObjects.Graphics | null = null;

  private drawHat(): void {
    this.chefHat = UIStyles.chefHat(this.scene, 0, -62, 30, 0xffffff);
    this.chefHat.setScale(0.85);
    this.container.add(this.chefHat);
  }

  private drawFace(emotion: EmotionType): void {
    if (this.leftEye) this.leftEye.destroy();
    if (this.rightEye) this.rightEye.destroy();
    if (this.mouth) this.mouth.destroy();
    if (this.leftCheek) this.leftCheek.destroy();
    if (this.rightCheek) this.rightCheek.destroy();
    if (this.whiskers) this.whiskers.destroy();
    if (this.sweatDrops) this.sweatDrops.destroy();

    const colors = EMOTION_COLORS[emotion];
    const g = this.scene.add.graphics();

    // Eyes (wrapped in containers so scale origin is at center)
    const leftEyeG = this.scene.add.graphics();
    leftEyeG.fillStyle(0x3e2723, 1);
    leftEyeG.fillCircle(0, 0, 5);
    leftEyeG.fillStyle(0xffffff, 1);
    leftEyeG.fillCircle(2, -2, 2);

    const rightEyeG = this.scene.add.graphics();
    rightEyeG.fillStyle(0x3e2723, 1);
    rightEyeG.fillCircle(0, 0, 5);
    rightEyeG.fillStyle(0xffffff, 1);
    rightEyeG.fillCircle(2, -2, 2);

    this.leftEye = this.scene.add.container(-13, -26);
    this.leftEye.add(leftEyeG);

    this.rightEye = this.scene.add.container(13, -26);
    this.rightEye.add(rightEyeG);

    // Eyebrows
    g.lineStyle(2, 0x5d4037, 0.6);
    if (emotion === 'focused') {
      g.lineBetween(-20, -36, -6, -34);
      g.lineBetween(6, -34, 20, -36);
    } else if (emotion === 'surprised') {
      g.lineBetween(-22, -38, -6, -36);
      g.lineBetween(6, -36, 22, -38);
    }

    // Mouth
    this.mouth = this.scene.add.graphics();
    this.mouth.lineStyle(2, 0x5d4037, 1);

    switch (emotion) {
      case 'happy':
      case 'excited':
      case 'proud':
        this.mouth.beginPath();
        this.mouth.arc(0, -12, 10, 0.1, Math.PI - 0.1, false);
        this.mouth.strokePath();
        if (emotion === 'excited' || emotion === 'proud') {
          this.mouth.fillStyle(0x5d4037, 0.6);
          this.mouth.fillCircle(0, -10, 4);
        }
        break;
      case 'surprised':
        this.mouth.fillStyle(0x5d4037, 1);
        this.mouth.fillCircle(0, -10, 6);
        break;
      case 'focused':
        this.mouth.beginPath();
        this.mouth.arc(0, -12, 6, 0.2, Math.PI - 0.2, false);
        this.mouth.strokePath();
        break;
      case 'drool':
        this.mouth.lineStyle(2, 0x5d4037, 1);
        this.mouth.beginPath();
        this.mouth.arc(0, -12, 12, 0.1, Math.PI - 0.1, false);
        this.mouth.strokePath();
        this.mouth.fillStyle(0x5d4037, 0.4);
        this.mouth.fillCircle(0, -8, 4);
        //口水 drops
        this.mouth.fillStyle(0x42a5f5, 0.7);
        this.mouth.fillCircle(-4, 2, 3);
        this.mouth.fillCircle(2, 5, 4);
        this.mouth.fillCircle(6, 1, 2.5);
        this.mouth.fillStyle(0x90caf9, 0.4);
        this.mouth.fillCircle(-4, 6, 2);
        this.mouth.fillCircle(3, 10, 2.5);
        break;
      case 'spicy':
        this.mouth.fillStyle(0x5d4037, 1);
        this.mouth.fillCircle(0, -10, 6);
        this.mouth.fillStyle(0xef5350, 0.7);
        this.mouth.fillEllipse(0, -6, 10, 6);
        break;
      default:
        this.mouth.beginPath();
        this.mouth.arc(0, -14, 8, 0.2, Math.PI - 0.2, false);
        this.mouth.strokePath();
    }

    // Cheeks
    this.leftCheek = this.scene.add.graphics();
    this.rightCheek = this.scene.add.graphics();
    this.leftCheek.fillStyle(colors.cheek, 0.45);
    this.leftCheek.fillCircle(-24, -14, 9);
    this.rightCheek.fillStyle(colors.cheek, 0.45);
    this.rightCheek.fillCircle(24, -14, 9);

    // Whiskers
    this.whiskers = this.scene.add.graphics();
    this.whiskers.lineStyle(1.5, 0x8d6e63, 0.5);
    this.whiskers.lineBetween(-32, -22, -16, -18);
    this.whiskers.lineBetween(-32, -16, -16, -16);
    this.whiskers.lineBetween(-32, -10, -16, -14);
    this.whiskers.lineBetween(32, -22, 16, -18);
    this.whiskers.lineBetween(32, -16, 16, -16);
    this.whiskers.lineBetween(32, -10, 16, -14);

    // Sweat drops for spicy
    if (emotion === 'spicy') {
      this.sweatDrops = this.scene.add.graphics();
      this.sweatDrops.fillStyle(0x81d4fa, 0.7);
      this.sweatDrops.fillEllipse(-22, -40, 6, 9);
      this.sweatDrops.fillEllipse(24, -42, 5, 8);
      this.sweatDrops.fillEllipse(30, -36, 4, 6);
      this.container.add(this.sweatDrops);
    }

    this.container.add([this.leftEye, this.rightEye, this.mouth, this.leftCheek, this.rightCheek, this.whiskers]);
    g.destroy();
  }

  setEmotion(emotion: EmotionType): void {
    if (this.currentEmotion === emotion) return;
    this.currentEmotion = emotion;
    this.drawFace(emotion);

    if (emotion === 'happy' || emotion === 'excited' || emotion === 'proud') {
      this.anims.bounce(this.container, 8, 300);
    } else if (emotion === 'spicy' || emotion === 'surprised') {
      this.anims.bounce(this.container, 6, 250);
    } else if (emotion === 'drool') {
      this.anims.bounce(this.container, 4, 400);
    } else if (emotion === 'focused') {
      this.anims.bounce(this.container, 3, 200);
    }
  }

  private startIdleAnimation(): void {
    this.anims.float(this.container, 5, 2000);
    this.scene.tweens.add({
      targets: this.chefHat,
      y: -2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private startBlinking(): void {
    this.blinkTimer = this.scene.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => this.blink(),
    });
  }

  private blink(): void {
    this.leftEye.setScale(1, 0.1);
    this.rightEye.setScale(1, 0.1);
    this.scene.time.delayedCall(150, () => {
      this.leftEye.setScale(1, 1);
      this.rightEye.setScale(1, 1);
    });
  }

  getPosition(): { x: number; y: number } {
    return { x: this.container.x, y: this.container.y };
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  destroy(): void {
    this.blinkTimer?.destroy();
    this.container.destroy();
  }
}
