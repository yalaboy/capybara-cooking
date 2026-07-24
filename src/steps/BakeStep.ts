import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { TOPPING_MAP } from '../data/ToppingData';
import { createNextButton } from '../ui/NextButton';
import { FoodGraphics } from '../assets/visual/FoodGraphics';
import { Capybara } from '../objects/Capybara';
import { speak, stopSpeech } from '../utils/Speech';

export class BakeStep extends BaseStep {
  private anims!: AnimationSystem;
  private baking = false;
  private bakeProgress = 0;
  private bakeDuration = 5000;
  private elapsed = 0;
  private ovenG!: Phaser.GameObjects.Graphics;
  private wavyLines: Phaser.GameObjects.Graphics[] = [];
  private gaugeBg!: Phaser.GameObjects.Graphics;
  private gaugeFill!: Phaser.GameObjects.Graphics;
  private startButton!: Phaser.GameObjects.Container;
  private nextButton: Phaser.GameObjects.Container | null = null;
  private completed = false;
  private bakeLabel!: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;
  private humOsc?: OscillatorNode;
  private humGain?: GainNode;
  private humOsc2?: OscillatorNode;
  private humGain2?: GainNode;
  private speechLoop?: Phaser.Time.TimerEvent;
  private bounceLoop?: Phaser.Time.TimerEvent;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
  }

  private bakeGlow!: Phaser.GameObjects.Graphics;
  private bakedOverlay!: Phaser.GameObjects.Graphics;

  enter(): void {
    const { scene } = this;
    const px = scene.scale.width / 2;
    const py = scene.scale.height * 0.48 + 20;

    this.drawPizza(scene, px, py);
    this.drawOven(scene, px, py);
    this.drawBakeGlow(scene, px, py);
    this.drawStartButton(scene, px, py);
    this.drawGauge(scene);

    scene.events.emit('capybara-emotion', 'focused');
    this.createLabel('Bake the pizza!', px, py - 230, '20px');

    this.nextButton = createNextButton(scene, this, () => this.onNext());
    this.nextButton.setVisible(false);
  }

  private drawPizza(scene: Phaser.Scene, px: number, py: number): void {
    const doughG = FoodGraphics.rolledDough(scene, px, py, 170) as Phaser.GameObjects.Graphics;
    doughG.setDepth(1);
    this.addObj(doughG);

    const sauceG = scene.add.graphics();
    sauceG.setDepth(2);
    const savedSauce = scene.data.get('sauceData') as { positions: { x: number; y: number; color: number; r: number }[] } | null;
    if (savedSauce) {
      savedSauce.positions.forEach((p) => {
        sauceG.fillStyle(p.color, 0.7);
        sauceG.fillCircle(p.x, p.y, p.r);
      });
    }
    this.addObj(sauceG);

    const savedToppings = scene.data.get('toppingData') as { positions: { x: number; y: number; id: string; scale: number }[] } | null;
    if (savedToppings) {
      savedToppings.positions.forEach((p) => {
        const info = TOPPING_MAP[p.id];
        if (info) {
          const icon = info.drawIcon(scene, p.x, p.y);
          icon.setScale(p.scale);
          icon.setDepth(3);
          this.addObj(icon);
        }
      });
    }
  }

  private drawOven(scene: Phaser.Scene, px: number, py: number): void {
    const scale = 1.3;
    const ovenW = Math.round(380 * scale);
    const ovenH = Math.round(340 * scale);
    const ovenX = px - ovenW / 2;
    const ovenY = py - ovenH / 2;

    this.ovenG = scene.add.graphics();
    this.ovenG.setDepth(0);

    // Oven body
    this.ovenG.fillStyle(0x5d4037, 1);
    this.ovenG.fillRoundedRect(ovenX, ovenY, ovenW, ovenH, 16);

    // Window frame
    this.ovenG.fillStyle(0x3e2723, 1);
    this.ovenG.fillRoundedRect(ovenX + 30, ovenY + 30, ovenW - 60, ovenH - 100, 12);

    // Transparent window
    this.ovenG.fillStyle(0x000000, 0.15);
    this.ovenG.fillRoundedRect(ovenX + 40, ovenY + 40, ovenW - 80, ovenH - 120, 8);

    // Window highlight
    this.ovenG.fillStyle(0xffffff, 0.08);
    this.ovenG.fillRoundedRect(ovenX + 45, ovenY + 45, 60, ovenH - 140, 6);

    // Bottom panel
    this.ovenG.fillStyle(0x4e342e, 1);
    this.ovenG.fillRoundedRect(ovenX + 20, ovenY + ovenH - 55, ovenW - 40, 40, 8);

    // Knobs
    for (let i = 0; i < 3; i++) {
      const kx = ovenX + ovenW / 2 - 40 + i * 40;
      const ky = ovenY + ovenH - 35;
      this.ovenG.fillStyle(0x8d6e63, 1);
      this.ovenG.fillCircle(kx, ky, 8);
      this.ovenG.fillStyle(0xffffff, 0.2);
      this.ovenG.fillCircle(kx - 2, ky - 2, 3);
    }

    this.addObj(this.ovenG);
  }

  private drawBakeGlow(scene: Phaser.Scene, px: number, py: number): void {
    this.bakeGlow = scene.add.graphics();
    this.bakeGlow.fillStyle(0xff8c00, 0.25);
    this.bakeGlow.fillCircle(px, py, 170);
    this.bakeGlow.setDepth(4);
    this.bakeGlow.setAlpha(0);
    this.addObj(this.bakeGlow);

    this.bakedOverlay = scene.add.graphics();
    this.bakedOverlay.fillStyle(0xff8c00, 0.18);
    this.bakedOverlay.fillCircle(px, py, 170);
    this.bakedOverlay.setDepth(4);
    this.bakedOverlay.setAlpha(0);
    this.addObj(this.bakedOverlay);
  }

  private drawStartButton(scene: Phaser.Scene, px: number, py: number): void {
    const scale = 1.3;
    const ovenW = Math.round(380 * scale);
    const ovenH = Math.round(340 * scale);
    const bx = px + ovenW / 2 - 50;
    const by = py + ovenH / 2 - 35;

    this.startButton = scene.add.container(bx, by);
    this.startButton.setDepth(10);

    const glow = scene.add.graphics();
    glow.fillStyle(0xe53935, 0.3);
    glow.fillCircle(0, 0, 48);
    this.startButton.add(glow);

    const bg = scene.add.graphics();
    bg.fillStyle(0xe53935, 1);
    bg.fillCircle(0, 0, 36);
    bg.fillStyle(0xffffff, 0.3);
    bg.fillCircle(-4, -4, 8);
    this.startButton.add(bg);

    const text = scene.add.text(0, 0, 'Start', {
      fontSize: '21px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);
    this.startButton.add(text);

    this.startButton.setSize(84, 84);
    this.startButton.setInteractive({ useHandCursor: true });
    this.startButton.on('pointerdown', () => this.onStartBake());

    scene.tweens.add({
      targets: glow,
      alpha: { from: 0.2, to: 0.7 },
      scaleX: { from: 1, to: 1.4 },
      scaleY: { from: 1, to: 1.4 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.addObj(this.startButton);
  }

  private drawGauge(scene: Phaser.Scene): void {
    const { height } = scene.scale;
    const gx = scene.scale.width - 65;
    const gy = height * 0.12;
    const gw = 29;
    const gh = height * 0.66;

    this.gaugeBg = scene.add.graphics();
    this.gaugeBg.fillStyle(0x3e2723, 1);
    this.gaugeBg.fillRoundedRect(gx - 2, gy - 2, gw + 4, gh + 4, 8);
    this.gaugeBg.fillStyle(0xbcaaa4, 1);
    this.gaugeBg.fillRoundedRect(gx, gy, gw, gh, 6);
    this.gaugeBg.setDepth(8);
    this.gaugeBg.setVisible(false);
    this.addObj(this.gaugeBg);

    this.gaugeFill = scene.add.graphics();
    this.gaugeFill.setDepth(9);
    this.gaugeFill.setVisible(false);
    this.addObj(this.gaugeFill);

    // Label
    this.bakeLabel = scene.add.text(gx + gw / 2, gy - 16, '0%', {
      fontSize: '14px',
      color: '#5d4037',
    });
    this.bakeLabel.setOrigin(0.5);
    this.bakeLabel.setDepth(9);
    this.bakeLabel.setVisible(false);
  }

  private updateGauge(progress: number): void {
    const { height } = this.scene.scale;
    const gx = this.scene.scale.width - 65;
    const gy = height * 0.12;
    const gw = 29;
    const gh = height * 0.66;

    const fillH = gh * progress;
    this.gaugeFill.clear();
    if (fillH > 0) {
      const color = progress < 0.5 ? 0xffcc80 : progress < 0.8 ? 0xff8a80 : 0xa5d6a7;
      this.gaugeFill.fillStyle(color, 1);
      this.gaugeFill.fillRoundedRect(gx, gy + gh - fillH, gw, fillH, 6);
    }
    this.bakeLabel.setText(`${Math.floor(progress * 100)}%`);
  }

  private addWavyLine(scene: Phaser.Scene, px: number, py: number): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.setDepth(11);
    g.setAlpha(0);

    const lineLen = 50;
    const waveCount = 4;

    g.lineStyle(3.5, 0xffffff, 0.6);
    g.beginPath();
    for (let i = 0; i <= waveCount * 4; i++) {
      const t = i / (waveCount * 4);
      const wave = Math.sin(t * waveCount * Math.PI) * 5;
      const x = px + wave;
      const y = py - t * lineLen;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokePath();

    this.wavyLines.push(g);

    this.scene.tweens.add({
      targets: g,
      alpha: 0.7,
      duration: 300,
    });

    this.scene.tweens.add({
      targets: g,
      x: g.x + Phaser.Math.Between(-2, 2),
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return g;
  }

  private onStartBake(): void {
    if (this.baking || this.completed) return;
    this.baking = true;
    this.elapsed = 0;

    this.startButton.setVisible(false);

    this.gaugeBg.setVisible(true);
    this.gaugeFill.setVisible(true);
    this.bakeLabel.setVisible(true);
    this.updateGauge(0);

    this.startHum();

    this.scene.tweens.add({
      targets: this.bakeGlow,
      alpha: { from: 0.2, to: 0.7 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.timerEvent = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => this.updateBake(),
    });
  }

  private updateBake(): void {
    if (!this.baking) return;
    this.elapsed += 50;
    this.bakeProgress = Math.min(1, this.elapsed / this.bakeDuration);

    this.updateGauge(this.bakeProgress);

    // Add wavy lines progressively (vertical steam on pizza)
    const lineCount = Math.floor(this.bakeProgress * 18);
    while (this.wavyLines.length < lineCount) {
      const { width, height } = this.scene.scale;
      const px = width / 2;
      const py = height * 0.48 + 20;
      const offsetX = Phaser.Math.Between(-110, 110);
      const offsetY = Phaser.Math.Between(-60, 60);
      this.addWavyLine(this.scene, px + offsetX, py + offsetY);
    }

    // Capybara emotion
    if (this.bakeProgress > 0.7) {
      this.scene.events.emit('capybara-emotion', 'drool');
    } else if (this.bakeProgress > 0.3) {
      this.scene.events.emit('capybara-emotion', 'excited');
    }

    if (this.bakeProgress >= 1) {
      this.onBakeComplete();
    }
  }

  private onBakeComplete(): void {
    this.baking = false;
    this.timerEvent?.remove();
    this.stopHum();
    this.scene.tweens.killTweensOf(this.bakeGlow);
    this.bakeGlow.setAlpha(0);

    this.scene.tweens.add({
      targets: this.bakedOverlay,
      alpha: 1,
      duration: 1000,
      ease: 'Sine.easeIn',
    });

    this.scene.events.emit('capybara-emotion', 'excited');

    // Repeating speech loop
    const phrases = ['It is ready!', 'Let\'s eat pizza!'];
    let phraseIdx = 0;
    const speakNext = () => {
      if (this.completed) return;
      speak(phrases[phraseIdx]);
      phraseIdx = (phraseIdx + 1) % phrases.length;
    };
    speakNext();
    this.speechLoop = this.scene.time.addEvent({
        delay: 2500,
        loop: true,
        callback: speakNext,
      });

    // Repeating capybara bounce to random positions
    const baseScene = this.scene as unknown as { capybara: Capybara };
    if (baseScene.capybara) {
      const c = baseScene.capybara.getContainer();
      const baseX = c.x;
      const baseY = c.y;
      const jumpToRandom = () => {
        if (this.completed) return;
        const offsetX = Phaser.Math.Between(-50, 50);
        const offsetY = Phaser.Math.Between(-15, 15);
        this.scene.tweens.add({
          targets: c,
          x: baseX + offsetX,
          y: baseY + offsetY,
          duration: 350,
          ease: 'Back.easeOut',
        });
        this.scene.events.emit('capybara-bounce');
      };
      jumpToRandom();
      this.bounceLoop = this.scene.time.addEvent({
        delay: 600,
        loop: true,
        callback: jumpToRandom,
      });
    }

    audioManager.playSfx('ding');

    if (this.nextButton) {
      this.nextButton.setVisible(true);
      this.anims.popIn(this.nextButton);
    }
  }

  private startHum(): void {
    const sm = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (!sm.context) return;
    const ctx = sm.context;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 60;
    osc.connect(gain);
    osc.start();

    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = 120;
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.04;
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();

    this.humOsc = osc;
    this.humGain = gain;
    this.humOsc2 = osc2;
    this.humGain2 = gain2;
  }

  private stopHum(): void {
    if (this.humOsc) {
      this.humOsc.stop();
      this.humOsc = undefined;
    }
    if (this.humGain) {
      this.humGain.disconnect();
      this.humGain = undefined;
    }
    if (this.humOsc2) { this.humOsc2.stop(); this.humOsc2 = undefined; }
    if (this.humGain2) { this.humGain2.disconnect(); this.humGain2 = undefined; }
  }

  private onNext(): void {
    if (this.completed) return;
    this.completed = true;
    this.speechLoop?.remove();
    this.bounceLoop?.remove();
    stopSpeech();
    audioManager.playSfx('ding');
    this.scene.time.delayedCall(300, () => this.complete());
  }

  exit(): void {
    this.timerEvent?.remove();
    this.stopHum();
    this.wavyLines.forEach((g) => g.destroy());
    this.wavyLines = [];
    super.exit();
  }
}
