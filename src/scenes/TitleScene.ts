import Phaser from 'phaser';
import { Capybara } from '../objects/Capybara';
import { Button } from '../ui/Button';
import { BackgroundGraphics } from '../assets/visual/BackgroundGraphics';
import { saveManager } from '../managers/SaveManager';
import { audioManager } from '../managers/AudioManager';
import { speak } from '../utils/Speech';

const FOOD_FLOATS = [
  { icon: '🍕', x: 0.12, y: 0.6, delay: 0 },
  { icon: '🍔', x: 0.88, y: 0.55, delay: 300 },
  { icon: '🥗', x: 0.1, y: 0.3, delay: 600 },
  { icon: '🍰', x: 0.9, y: 0.25, delay: 200 },
  { icon: '🥚', x: 0.08, y: 0.8, delay: 500 },
  { icon: '🥕', x: 0.92, y: 0.78, delay: 400 },
];

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  private speechEvent?: Phaser.Time.TimerEvent;

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0xfce4ec);

    audioManager.attach(this);
    audioManager.playBgm('bgm-title');

    this.createBackground(width, height);
    this.createFloatingFood(width, height);
    this.createTitle(width, height);
    this.createCapybara(width, height);
    this.createPlayButton(width, height);
    this.createResetButton(width, height);
    this.createCelebrationParticles(width, height);

    this.playTitleSpeech();
    this.speechEvent = this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => this.playTitleSpeech(),
    });
  }

  private playTitleSpeech(): void {
    if (!('speechSynthesis' in window)) return;
    const phrases = ['Capybara Cooking', 'Lets go Joonsoo'];
    speak(phrases[Math.floor(Math.random() * phrases.length)]);
  }

  private createBackground(w: number, h: number): void {
    BackgroundGraphics.kitchenDefault(this, w, h);
  }

  private createTitle(w: number, h: number): void {
    const title = this.add.text(w / 2, h * 0.18, 'Capybara\nCooking', {
      fontSize: '56px',
      color: '#5d4037',
      align: 'center',
      lineSpacing: 6,
      stroke: '#efebe9',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    // Pop-in animation
    title.setScale(0);
    this.tweens.add({
      targets: title,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: 'Back.easeOut',
    });

    // Subtle idle float
    this.tweens.add({
      targets: title,
      y: title.y - 4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 800,
    });

    // Subtitle
    const subtitle = this.add.text(w / 2, h * 0.3, 'with the capybara chef', {
      fontSize: '16px',
      color: '#a1887f',
    });
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);
    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 400,
      delay: 600,
    });
  }

  private createCapybara(w: number, h: number): void {
    const capy = new Capybara(this, w / 2, h * 0.58, 1.8);
    capy.setEmotion('happy');

    // Gentle appearance
    capy.getContainer().setAlpha(0);
    this.tweens.add({
      targets: capy.getContainer(),
      alpha: 1,
      duration: 500,
      delay: 400,
    });
  }

  private createPlayButton(w: number, h: number): void {
    const btn = new Button(this, {
      x: w / 2,
      y: h * 0.82,
      text: 'Play',
      width: 180,
      height: 64,
      color: 0xff8a80,
      fontSize: '36px',
      radius: 20,
      onPress: () => {
        speak('yay', 1.2, 1.2);
        this.cameras.main.fadeOut(300, 252, 228, 300);
        this.time.delayedCall(500, () => {
          this.scene.start('PizzaScene');
        });
      },
    });

    // Pulse animation
    this.tweens.add({
      targets: btn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1000,
    });

    btn.setAlpha(0);
    this.tweens.add({
      targets: btn,
      alpha: 1,
      duration: 400,
      delay: 800,
    });
  }

  private createFloatingFood(w: number, h: number): void {
    FOOD_FLOATS.forEach((food) => {
      const icon = this.add.text(w * food.x, h * food.y, food.icon, {
        fontSize: '28px',
      });
      icon.setOrigin(0.5);
      icon.setAlpha(0.8);

      this.tweens.add({
        targets: icon,
        y: icon.y - 15,
        duration: 2500 + food.delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: food.delay,
      });

      this.tweens.add({
        targets: icon,
        angle: { from: -5, to: 5 },
        duration: 3000 + food.delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: food.delay,
      });
    });
  }

  private createResetButton(w: number, h: number): void {
    const resetText = this.add.text(w - 12, h - 12, 'Reset', {
      fontSize: '12px',
      color: '#bcaaa4',
    });
    resetText.setOrigin(1, 1);
    resetText.setAlpha(0.5);
    resetText.setInteractive({ useHandCursor: true });

    resetText.on('pointerover', () => resetText.setAlpha(1));
    resetText.on('pointerout', () => resetText.setAlpha(0.5));
    resetText.on('pointerup', () => {
      saveManager.reset();
      resetText.disableInteractive();
      resetText.setText('Cleared!');
      resetText.setColor('#a5d6a7');
      resetText.setAlpha(0.8);
      this.time.delayedCall(2000, () => {
        resetText.setText('Reset');
        resetText.setColor('#bcaaa4');
        resetText.setAlpha(0.5);
        resetText.setInteractive({ useHandCursor: true });
      });
    });
  }

  private createCelebrationParticles(w: number, _h: number): void {
    this.time.addEvent({
      delay: 600,
      repeat: 5,
      callback: () => {
        this.add
          .particles(Phaser.Math.Between(0, w), -10, 'confetti', {
            speed: { min: 40, max: 120 },
            angle: { min: 70, max: 110 },
            scale: { start: 0.8, end: 0 },
            lifespan: 3000,
            quantity: 2,
            emitting: false,
            tint: [0xff8a80, 0xa5d6a7, 0xffe082, 0x80deea],
          })
          .explode(2);
      },
    });
  }
}
