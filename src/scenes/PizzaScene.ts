import Phaser from 'phaser';
import { BaseRecipeScene } from './BaseRecipeScene';
import { FoodGraphics } from '../assets/visual/FoodGraphics';
import { audioManager } from '../managers/AudioManager';
import type { RecipeConfig } from '../types/recipe';
import pizzaData from '../data/recipes/pizza.json';

export class PizzaScene extends BaseRecipeScene {
  constructor() {
    super('PizzaScene');
  }

  getRecipeConfig(): RecipeConfig {
    return pizzaData as RecipeConfig;
  }

  protected override onCreateExtras(): void {
    const { width, height } = this.scale;
    FoodGraphics.cuttingBoard(this, width / 2, height * 0.55, width * 0.5);
    this.createNewDoughButton();
  }

  protected override bounceCapybara(): void {
    const container = this.capybara.getContainer();
    this.tweens.add({
      targets: container,
      y: container.y - 30,
      duration: 200,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  create(): void {
    super.create();
    this.setupCapybaraCheer();
  }

  private createNewDoughButton(): void {
    const { width } = this.scale;

    const container = this.add.container(width / 2 + 100, 30);
    container.setDepth(100);

    const bg = this.add.graphics();
    bg.fillStyle(0xf5deb3, 1);
    bg.fillCircle(0, 0, 32);
    bg.fillStyle(0x000000, 0.06);
    bg.fillCircle(1, 2, 30);
    bg.fillStyle(0xffffff, 0.15);
    bg.fillCircle(-8, -8, 10);
    container.add(bg);

    const text = this.add.text(0, -4, '\u21BA', {
      fontSize: '24px',
      color: '#8d6e63',
    });
    text.setOrigin(0.5);
    container.add(text);

    const label = this.add.text(0, 38, 'New Dough', {
      fontSize: '12px',
      color: '#8d6e63',
    });
    label.setOrigin(0.5);
    container.add(label);

    container.setSize(64, 64);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => {
      audioManager.playSfx('button');
      this.sequencer?.destroy();
      this.scene.restart();
    });
  }

  private setupCapybaraCheer(): void {
    const container = this.capybara.getContainer();

    container.setSize(100, 100);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      if ('speechSynthesis' in window) {
        const phrases = ['Hello Joonsoo', 'Joonsoo Hi'];
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(phrases[Math.floor(Math.random() * phrases.length)]);
        u.lang = 'en-US';
        u.rate = 1.0;
        u.pitch = 1.3;
        window.speechSynthesis.speak(u);
      }

      audioManager.playSfx('fanfare');

      this.tweens.add({
        targets: container,
        y: container.y - 30,
        duration: 200,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      this.capybara.setEmotion('excited');

      this.time.addEvent({
        delay: 400,
        repeat: 2,
        callback: () => {
          this.feedback.getAnimations().emitCircleParticles(
            this.capybara.getPosition().x,
            this.capybara.getPosition().y - 30,
            'confetti',
            8,
            100,
            1000,
          );
        },
      });

      const cheerTexts = ['Awesome!', "You're doing great!", 'Fighting!', 'Looks yummy!'];
      const text = Phaser.Math.RND.pick(cheerTexts);
      const cheer = this.add.text(
        this.capybara.getPosition().x + 60,
        this.capybara.getPosition().y - 50,
        text,
        {
          fontSize: '20px',
          color: '#ff8a80',
          stroke: '#ffffff',
          strokeThickness: 2,
        },
      );
      cheer.setOrigin(0.5);
      this.tweens.add({
        targets: cheer,
        y: cheer.y - 40,
        alpha: 0,
        duration: 1000,
        ease: 'Quad.easeOut',
        onComplete: () => cheer.destroy(),
      });
    });
  }
}
