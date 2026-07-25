import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { FoodGraphics } from '../assets/visual/FoodGraphics';
import type { EmotionType } from '../types/recipe';
import { createNextButton } from '../ui/NextButton';
import { speak } from '../utils/Speech';

interface SauceInfo {
  id: string;
  color: number;
  emotion: EmotionType;
  speeches: string[];
  bottleDraw: (scene: Phaser.Scene, x: number, y: number) => Phaser.GameObjects.Graphics;
}

const SAUCES: SauceInfo[] = [
  {
    id: 'ketchup',
    color: 0xe53935,
    emotion: 'happy',
    speeches: ['I like ketchup'],
    bottleDraw: (scene, x, y) => {
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.08);
      g.fillEllipse(x + 2, y - 18, 26, 8);
      g.fillStyle(0xe53935, 1);
      g.beginPath();
      g.moveTo(x - 12, y - 14);
      g.lineTo(x + 12, y - 14);
      g.lineTo(x + 12, y + 8);
      g.lineTo(x + 8, y + 14);
      g.lineTo(x + 8, y + 22);
      g.lineTo(x - 8, y + 22);
      g.lineTo(x - 8, y + 14);
      g.lineTo(x - 12, y + 8);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xbdbdbd, 1);
      g.fillRoundedRect(x - 8, y + 20, 16, 8, 2);
      g.fillStyle(0xffffff, 0.9);
      g.fillRoundedRect(x - 9, y + 2, 18, 14, 2);
      g.fillStyle(0xe53935, 0.8);
      g.fillCircle(x, y + 9, 4);
      g.fillStyle(0xd32f2f, 1);
      g.fillCircle(x, y + 5, 3);
      g.fillStyle(0x4caf50, 1);
      g.fillRect(x - 1, y + 1, 2, 3);
      return g;
    },
  },
  {
    id: 'mayo',
    color: 0xfff9c4,
    emotion: 'drool' as EmotionType,
    speeches: ['i like mayonnaise'],
    bottleDraw: (scene, x, y) => {
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.08);
      g.fillEllipse(x + 2, y - 20, 34, 8);
      g.fillStyle(0xf5f5f5, 1);
      g.beginPath();
      g.moveTo(x - 16, y - 16);
      g.lineTo(x + 16, y - 16);
      g.lineTo(x + 16, y + 6);
      g.lineTo(x + 12, y + 12);
      g.lineTo(x + 12, y + 24);
      g.lineTo(x - 12, y + 24);
      g.lineTo(x - 12, y + 12);
      g.lineTo(x - 16, y + 6);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x90a4ae, 1);
      g.fillRoundedRect(x - 10, y + 22, 20, 8, 3);
      g.fillStyle(0xfff176, 0.9);
      g.fillRoundedRect(x - 12, y + 0, 24, 16, 3);
      g.fillStyle(0xf9a825, 0.8);
      g.fillCircle(x, y + 8, 5);
      g.fillStyle(0xfff8e1, 1);
      g.fillEllipse(x - 3, y + 4, 8, 10);
      g.fillEllipse(x + 3, y + 4, 8, 10);
      return g;
    },
  },
  {
    id: 'hotsauce',
    color: 0xff6f00,
    emotion: 'spicy' as EmotionType,
    speeches: ['No hot sauce No', 'Spicy'],
    bottleDraw: (scene, x, y) => {
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.08);
      g.fillEllipse(x + 2, y - 12, 24, 6);
      g.fillStyle(0xbf360c, 1);
      g.beginPath();
      g.moveTo(x - 10, y - 8);
      g.lineTo(x + 10, y - 8);
      g.lineTo(x + 10, y + 12);
      g.lineTo(x + 6, y + 18);
      g.lineTo(x + 6, y + 26);
      g.lineTo(x - 6, y + 26);
      g.lineTo(x - 6, y + 18);
      g.lineTo(x - 10, y + 12);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x424242, 1);
      g.fillRoundedRect(x - 7, y + 24, 14, 6, 2);
      g.fillStyle(0xffab00, 0.9);
      g.fillRoundedRect(x - 7, y + 2, 14, 14, 2);
      g.fillStyle(0xd32f2f, 1);
      g.fillEllipse(x, y + 5, 5, 10);
      g.fillStyle(0x4caf50, 1);
      g.fillRect(x - 1, y - 1, 2, 3);
      return g;
    },
  },
];

export class SauceStep extends BaseStep {
  private anims!: AnimationSystem;
  private dough!: Phaser.GameObjects.Graphics;
  private sauceG!: Phaser.GameObjects.Graphics;
  private bottles: { container: Phaser.GameObjects.Container; info: SauceInfo; highlight: Phaser.GameObjects.Graphics }[] = [];
  private selectedSauce: SauceInfo | null = null;
  private sauceTapCount = 0;
  private nextButton: Phaser.GameObjects.Container | null = null;
  private completed = false;
  private saucePositions: { x: number; y: number; color: number; r: number }[] = [];
  private sauceColor: number = 0;
  private lastDragPos: { x: number; y: number } | null = null;
  private soundPlayedForDrag = false;

  private playSauceSound(): void {
    if (!this.selectedSauce) return;
    const phrases = this.selectedSauce.speeches;
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    if (this.selectedSauce.id === 'hotsauce') {
      speak(text, 1.3, 3.0);
    } else {
      speak(text);
    }
  }

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
  }

  private get posX(): number { return this.visual.to?.x ?? this.centerX; }
  private get posY(): number { return this.visual.to?.y ?? this.centerY; }

  enter(): void {
    const { scene } = this;
    const px = scene.scale.width / 2;
    const py = scene.scale.height * 0.52;

    this.dough = this.addObj(FoodGraphics.rolledDough(scene, px, py, 170)) as Phaser.GameObjects.Graphics;
    this.dough.setDepth(1);
    this.anims.popIn(this.dough);

    this.sauceG = this.addObj(scene.add.graphics()) as Phaser.GameObjects.Graphics;
    this.sauceG.setDepth(2);

    this.createLabel('Pick a sauce, then drag on the dough!', px, py - 210, '20px');

    this.createSauceBottles();

    this.setupDoughTap(px, py);

    this.nextButton = createNextButton(scene, this, () => this.onNext());
    this.nextButton.setVisible(false);
  }

  private createSauceBottles(): void {
    const { scene } = this;
    const { width, height } = scene.scale;
    const bx = width - 120;
    const startY = height * 0.32;

    SAUCES.forEach((info, i) => {
      const by = startY + i * 120;

      const container = scene.add.container(bx, by);
      container.setDepth(5);

      const highlight = scene.add.graphics();
      highlight.lineStyle(3, 0xffffff, 0);
      highlight.strokeRoundedRect(-34, -40, 68, 80, 10);
      container.add(highlight);

      const bottleG = info.bottleDraw(scene, 0, 0);
      bottleG.setScale(1.8);
      container.add(bottleG);

      const bottleLabel = info.id === 'ketchup' ? 'Ketchup' : info.id === 'mayo' ? 'Mayo' : 'Hot Sauce';
      const label = scene.add.text(0, 64, bottleLabel, {
        fontSize: '27px',
        color: '#5d4037',
      });
      label.setOrigin(0.5);
      container.add(label);

      container.setSize(70, 90);
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => this.selectSauce(info, container, highlight, i));

      this.anims.popIn(container);
      scene.tweens.add({
        targets: container,
        y: by + 8,
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.bottles.push({ container, info, highlight });
      this.addObj(container);
    });
  }

  private resetAllBottles(): void {
    const { scene } = this;
    this.bottles.forEach((b) => {
      scene.tweens.killTweensOf(b.container);
      scene.tweens.killTweensOf(b.highlight);
      b.highlight.clear();
      b.highlight.lineStyle(3, 0xffffff, 0);
      b.highlight.strokeRoundedRect(-34, -40, 68, 80, 10);
      b.highlight.setAlpha(1);
      b.container.setScale(1);
      b.container.setAngle(0);
    });
  }

  private selectSauce(info: SauceInfo, container: Phaser.GameObjects.Container, highlight: Phaser.GameObjects.Graphics, _index: number): void {
    const { scene } = this;
    audioManager.playSfx('button');

    this.resetAllBottles();

    this.selectedSauce = info;
    highlight.clear();
    highlight.lineStyle(4, 0xffd54f, 1);
    highlight.strokeRoundedRect(-36, -42, 72, 84, 10);

    scene.tweens.add({
      targets: container,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Shake selected
    scene.tweens.add({
      targets: container,
      angle: { from: -5, to: 5 },
      duration: 80,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow selected highlight
    scene.tweens.add({
      targets: highlight,
      alpha: { from: 0.6, to: 1 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.events.emit('capybara-emotion', 'idle');
    scene.time.delayedCall(100, () => {
      scene.events.emit('capybara-emotion', info.emotion);
    });
    this.playSauceSound();
  }

  private setupDoughTap(px: number, py: number): void {
    const { scene } = this;

    const zone = this.addObj(
      scene.add.zone(px, py, 380, 380).setInteractive({ useHandCursor: true, draggable: true }),
    ) as unknown as Phaser.GameObjects.Zone;

    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.selectedSauce || this.completed) return;
      this.lastDragPos = { x: pointer.x, y: pointer.y };
      this.soundPlayedForDrag = false;
      scene.events.emit('capybara-bounce');
      this.applySauce(pointer.x, pointer.y);
    });

    zone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.selectedSauce || this.completed) return;
      if (!pointer.isDown) return;
      const last = this.lastDragPos;
      if (last && Math.hypot(pointer.x - last.x, pointer.y - last.y) < 15) return;
      this.lastDragPos = { x: pointer.x, y: pointer.y };
      this.applySauce(pointer.x, pointer.y);
    });

    zone.on('pointerup', () => {
      this.soundPlayedForDrag = false;
    });
  }

  private applySauce(tapX: number, tapY: number): void {
    if (!this.selectedSauce) return;
    const { scene } = this;

    this.sauceTapCount++;
    this.sauceColor = this.selectedSauce.color;
    const r = 10 + Math.random() * 8;
    this.saucePositions.push({ x: tapX, y: tapY, color: this.selectedSauce.color, r });
    if (this.sauceTapCount <= 2) {
      scene.events.emit('capybara-emotion', 'idle');
      scene.time.delayedCall(100, () => {
        scene.events.emit('capybara-emotion', this.selectedSauce!.emotion);
      });
    }
    if (this.sauceTapCount >= 5 && this.nextButton) {
      this.nextButton.setVisible(true);
      this.anims.popIn(this.nextButton);
    }

    const color = this.selectedSauce.color;
    this.sauceG.fillStyle(color, 0.7);
    this.sauceG.fillCircle(tapX, tapY, r);

    if (!this.soundPlayedForDrag) {
      this.soundPlayedForDrag = true;
      this.playSauceSound();
    }
  }

  private onNext(): void {
    if (this.completed) return;
    this.completed = true;
    const { scene } = this;

    scene.data.set('sauceData', { color: this.sauceColor, positions: this.saucePositions });

    audioManager.playSfx('ding');
    this.anims.squash(this.dough);
    scene.time.delayedCall(300, () => this.complete());
  }

}
