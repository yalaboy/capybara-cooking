import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { FoodGraphics } from '../assets/visual/FoodGraphics';
import { TOPPINGS, type ToppingInfo } from '../data/ToppingData';
import { createNextButton } from '../ui/NextButton';

export class ToppingStep extends BaseStep {
  private anims!: AnimationSystem;
  private doughCenter: { x: number; y: number } = { x: 0, y: 0 };
  private dough!: Phaser.GameObjects.Graphics;
  private sauceG!: Phaser.GameObjects.Graphics;
  private toppingsG!: Phaser.GameObjects.Graphics;
  private toppingItems: { container: Phaser.GameObjects.Container; info: ToppingInfo; highlight: Phaser.GameObjects.Graphics }[] = [];
  private selectedTopping: ToppingInfo | null = null;
  private toppingTapCount = 0;
  private lastDragPos: { x: number; y: number } | null = null;
  private toppingPositions: { x: number; y: number; id: string; scale: number }[] = [];
  private nextButton: Phaser.GameObjects.Container | null = null;
  private completed = false;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
  }

  enter(): void {
    const { scene } = this;
    const { width, height } = scene.scale;
    const px = width / 2;
    const py = height * 0.52;

    this.doughCenter = { x: px, y: py };

    this.dough = this.addObj(FoodGraphics.rolledDough(scene, px, py, 170)) as Phaser.GameObjects.Graphics;
    this.dough.setDepth(1);
    this.anims.popIn(this.dough);

    const doughZone = this.addObj(
      scene.add.circle(px, py, 170, 0x000000, 0).setInteractive({ useHandCursor: true }),
    ) as Phaser.GameObjects.Arc;
    doughZone.setDepth(1);
    doughZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.selectedTopping || this.completed) return;
      this.lastDragPos = { x: pointer.x, y: pointer.y };
      this.applyTopping(pointer.x, pointer.y);
    });

    doughZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.selectedTopping || this.completed) return;
      if (!pointer.isDown) return;
      const last = this.lastDragPos;
      if (last && Math.hypot(pointer.x - last.x, pointer.y - last.y) < 100) return;
      this.lastDragPos = { x: pointer.x, y: pointer.y };
      this.applyTopping(pointer.x, pointer.y);
    });

    doughZone.on('pointerup', () => {
      this.lastDragPos = null;
    });

    this.sauceG = this.addObj(scene.add.graphics()) as Phaser.GameObjects.Graphics;
    this.sauceG.setDepth(2);
    this.restoreSauce();

    this.toppingsG = this.addObj(scene.add.graphics()) as Phaser.GameObjects.Graphics;
    this.toppingsG.setDepth(3);

    this.createLabel('Pick a topping, then drag on the pizza!', px, py - 210, '20px');

    this.createToppingIcons();

    this.nextButton = createNextButton(scene, this, () => this.onNext());
    this.nextButton.setVisible(false);
  }

  private restoreSauce(): void {
    const { scene } = this;
    const g = this.sauceG;
    const savedData = scene.data.get('sauceData') as { positions: { x: number; y: number; color: number; r: number }[] } | null;
    if (savedData) {
      savedData.positions.forEach((p) => {
        g.fillStyle(p.color, 0.7);
        g.fillCircle(p.x, p.y, p.r);
      });
    }
  }

  private createToppingIcons(): void {
    const { scene } = this;
    const { height } = scene.scale;
    const rightX = scene.scale.width - 80;
    const col2X = scene.scale.width - 180;
    const startY = height * 0.25;

    TOPPINGS.forEach((info, i) => {
      const col = i < 3 ? 0 : 1;
      const bx = col === 0 ? col2X : rightX;
      const by = startY + (i % 3) * 110;

      const container = scene.add.container(bx, by);
      container.setDepth(5);

      const highlight = scene.add.graphics();
      highlight.lineStyle(3, 0xffffff, 0);
      highlight.strokeRoundedRect(-24, -24, 48, 48, 8);
      container.add(highlight);

      const iconG = info.drawIcon(scene, 0, 0);
      iconG.setScale(1.4);
      container.add(iconG);

      const label = scene.add.text(0, 30, info.id.charAt(0).toUpperCase() + info.id.slice(1), {
        fontSize: '14px',
        color: '#5d4037',
      });
      label.setOrigin(0.5);
      container.add(label);

      container.setSize(50, 60);
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => this.selectTopping(info, container, highlight));

      this.anims.popIn(container);
      scene.tweens.add({
        targets: container,
        y: by + 6,
        duration: 1500 + i * 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.toppingItems.push({ container, info, highlight });
      this.addObj(container);
    });
  }

  private selectTopping(info: ToppingInfo, container: Phaser.GameObjects.Container, highlight: Phaser.GameObjects.Graphics): void {
    const { scene } = this;
    audioManager.playSfx('button');

    this.toppingItems.forEach((b) => {
      b.highlight.clear();
      b.highlight.lineStyle(3, 0xffffff, 0);
      b.highlight.strokeRoundedRect(-24, -24, 48, 48, 8);
      scene.tweens.add({
        targets: b.container,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    this.selectedTopping = info;
    highlight.clear();
    highlight.lineStyle(4, 0xffd54f, 1);
    highlight.strokeRoundedRect(-26, -26, 52, 52, 8);

    scene.tweens.add({
      targets: container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      ease: 'Back.easeOut',
    });

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = info.liked ? `${info.label} yummy` : `${info.label} nono`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.6;
      window.speechSynthesis.speak(utterance);
    }

    scene.events.emit('capybara-emotion', 'idle');
    scene.time.delayedCall(100, () => {
      scene.events.emit('capybara-emotion', info.liked ? 'happy' : 'spicy');
    });
  }

  private applyTopping(tapX: number, tapY: number): void {
    if (!this.selectedTopping) return;
    const { scene } = this;
    const info = this.selectedTopping;

    this.toppingTapCount++;
    if (this.toppingTapCount >= 5 && this.nextButton) {
      this.nextButton.setVisible(true);
      this.anims.popIn(this.nextButton);
    }

    const iconC = info.drawIcon(scene, tapX, tapY);
    const iconScale = 1.0 + Math.random() * 0.5;
    iconC.setScale(iconScale);
    iconC.setDepth(4);
    this.addObj(iconC);

    this.toppingPositions.push({ x: tapX, y: tapY, id: info.id, scale: iconScale });

    audioManager.playSfx(info.liked ? 'ding' : 'splat');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = info.liked ? `${info.label} yummy` : `${info.label} nono`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.5;
      window.speechSynthesis.speak(utterance);
    }
    scene.events.emit('capybara-emotion', 'idle');
    scene.time.delayedCall(100, () => {
      scene.events.emit('capybara-emotion', info.liked ? 'happy' : 'spicy');
    });

    const flash = scene.add.graphics();
    flash.fillStyle(info.color, 0.35);
    flash.fillCircle(tapX, tapY, 18);
    flash.setDepth(10);
    scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  private onNext(): void {
    if (this.completed) return;
    this.completed = true;
    const { scene } = this;

    scene.data.set('toppingData', { positions: this.toppingPositions });

    audioManager.playSfx('ding');
    scene.time.delayedCall(300, () => this.complete());
  }

  exit(): void {
    super.exit();
  }
}
