import Phaser from 'phaser';
import { StepSequencer } from '../systems/StepSequencer';
import { FeedbackSystem } from '../systems/FeedbackSystem';
import { Capybara } from '../objects/Capybara';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { audioManager } from '../managers/AudioManager';
import { saveManager } from '../managers/SaveManager';
import { GameEvents } from '../types/events';
import type { RecipeConfig, EmotionType } from '../types/recipe';
import { BackgroundGraphics } from '../assets/visual/BackgroundGraphics';

const CHEER_TEXTS = ['Great!', 'Yay!', 'Nice!', 'Good!', 'Yum!', 'Tasty!', 'Woohoo!'];

export abstract class BaseRecipeScene extends Phaser.Scene {
  protected recipeConfig!: RecipeConfig;
  protected sequencer!: StepSequencer;
  protected feedback!: FeedbackSystem;
  protected capybara!: Capybara;
  protected progressBar!: ProgressBar;
  protected stepLabel!: Phaser.GameObjects.Text;
  protected coinText!: Phaser.GameObjects.Text;
  protected muteButton!: Button;

  constructor(key: string) {
    super({ key });
  }

  abstract getRecipeConfig(): RecipeConfig;

  create(): void {
    audioManager.attach(this);
    this.recipeConfig = this.getRecipeConfig();
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(0xfce4ec);
    this.cameras.main.fadeIn(400, 252, 228, 236);

    this.drawBackground(width, height);

    this.onCreateExtras();

    this.capybara = new Capybara(this, width * 0.15, height * 0.65, 1.2);
    this.data.set('capybara-position', this.capybara.getPosition());

    this.feedback = new FeedbackSystem(this);
    this.feedback.setEmotionCallback((emotion: EmotionType) => {
      this.capybara.setEmotion(emotion);
    });

    this.events.on('capybara-emotion', (emotion: EmotionType) => {
      this.capybara.setEmotion(emotion);
    });

    this.events.on('capybara-bounce', () => {
      this.bounceCapybara();
    });

    this.stepLabel = this.add.text(width / 2, 30, '', {
      fontSize: '22px',
      color: '#8d6e63',
    });
    this.stepLabel.setOrigin(0.5);

    this.progressBar = new ProgressBar(this, width * 0.25, height - 40, width * 0.5, 12);

    this.coinText = this.add.text(width - 120, 26, `\u{1FA99} ${saveManager.getCoins()}`, {
      fontSize: '18px',
      color: '#8d6e63',
    });

    this.muteButton = new Button(this, {
      x: 40,
      y: 30,
      text: audioManager.isMuted() ? '\u{1F507}' : '\u{1F50A}',
      width: 50,
      height: 50,
      color: 0xbcaaa4,
      fontSize: '24px',
      radius: 25,
      onPress: () => {
        const muted = audioManager.toggleMute();
        this.muteButton.setText(muted ? '\u{1F507}' : '\u{1F50A}');
      },
    });

    this.sequencer = new StepSequencer(this);
    this.sequencer.loadSteps(this.recipeConfig.steps);

    this.events.on(GameEvents.STEP_START, (_index: number, total: number) => {
      const current = this.sequencer.getCurrentIndex() + 1;
      this.stepLabel.setText(`${current} / ${total}`);
      this.progressBar.setProgress(current, total);
    });

    this.events.on(GameEvents.STEP_COMPLETE, () => {
      this.showStepSuccess();
    });

    this.events.on(GameEvents.RECIPE_COMPLETE, () => {
      this.onRecipeComplete();
    });

    this.events.emit(GameEvents.RECIPE_START, this.recipeConfig.id);
    this.sequencer.start();
  }

  update(time: number, delta: number): void {
    this.sequencer.update(time, delta);
  }

  protected onCreateExtras(): void {
    // Override for recipe-specific setup
  }

  protected bounceCapybara(): void {
    const c = this.capybara.getContainer();
    const origY = c.y;
    this.tweens.add({
      targets: c,
      y: origY - 8,
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  protected drawBackground(w: number, h: number): void {
    const key = this.recipeConfig.background;
    if (key === 'kitchen-pizza') {
      BackgroundGraphics.kitchenPizza(this, w, h);
    } else {
      BackgroundGraphics.kitchenDefault(this, w, h);
    }
  }

  protected showStepSuccess(): void {
    const { width, height } = this.scale;
    const text = Phaser.Math.RND.pick(CHEER_TEXTS);
    const cheer = this.add.text(width / 2, height * 0.35, text, {
      fontSize: '36px',
      color: '#ff8a80',
      stroke: '#ffffff',
      strokeThickness: 3,
    });
    cheer.setOrigin(0.5);
    cheer.setScale(0);

    this.tweens.add({
      targets: cheer,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: { from: 1, to: 0 },
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => cheer.destroy(),
    });

    this.feedback
      .getAnimations()
      .emitCircleParticles(width / 2, height * 0.35, 'sparkle', 6, 60, 400);

    const current = this.sequencer.getCurrentIndex() + 1;
    const total = this.sequencer.getTotalSteps();
    if (current < total) {
      this.capybara.setEmotion('happy');
    }
  }

  protected onRecipeComplete(): void {
    const { width, height } = this.scale;
    const stars = this.recipeConfig.celebration.stars;

    saveManager.completeRecipe(this.recipeConfig.id, stars);
    saveManager.addCoins(stars * 10);
    this.coinText.setText(`\u{1FA99} ${saveManager.getCoins()}`);

    this.feedback.playCelebration(
      this,
      width / 2,
      height / 2,
      this.recipeConfig.celebration.particles,
      'excited',
    );

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.3);
    overlay.fillRect(0, 0, width, height);
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 300 });

    for (let i = 0; i < stars; i++) {
      const starText = this.add.text(width / 2 + (i - (stars - 1) / 2) * 70, height * 0.35, '\u2B50', {
        fontSize: '56px',
      });
      starText.setOrigin(0.5);
      starText.setScale(0);
      this.tweens.add({
        targets: starText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        delay: 500 + i * 250,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: starText,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Quad.easeIn',
          });
        },
      });
    }

    const doneText = this.add.text(width / 2, height * 0.22, 'Yummy!', {
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#5d4037',
      strokeThickness: 4,
    });
    doneText.setOrigin(0.5);
    doneText.setScale(0);
    this.tweens.add({
      targets: doneText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 400,
      delay: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: doneText,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
        });
      },
    });

    this.time.addEvent({
      delay: 300,
      repeat: 5,
      callback: () => {
        this.feedback
          .getAnimations()
          .emitCircleParticles(
            Phaser.Math.Between(100, width - 100),
            Phaser.Math.Between(50, height * 0.5),
            'confetti',
            5,
            120,
            1500,
          );
      },
    });

    const backBtn = new Button(this, {
      x: width / 2,
      y: height * 0.7,
      text: 'Done',
      width: 160,
      height: 60,
      color: 0xa5d6a7,
      onPress: () => {
        this.sequencer.destroy();
        this.scene.start('TitleScene');
      },
    });
    backBtn.setAlpha(0);
    backBtn.setScale(0);
    this.tweens.add({
      targets: backBtn,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      delay: 1500,
      ease: 'Back.easeOut',
    });
  }

  shutdown(): void {
    this.sequencer?.destroy();
    this.capybara?.destroy();
    this.progressBar?.destroy();
    this.feedback = null as unknown as FeedbackSystem;
  }
}
