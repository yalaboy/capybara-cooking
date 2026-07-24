import Phaser from 'phaser';
import { BaseStep, type StepContext } from './BaseStep';
import { AnimationSystem } from '../systems/AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import { FoodGraphics } from '../assets/visual/FoodGraphics';
import { TOPPING_MAP } from '../data/ToppingData';
import { createNextButton } from '../ui/NextButton';
import { Capybara } from '../objects/Capybara';

const BITE_RADIUS = 35;
const BOARD_COLOR = 0xc19a6b;
const DEATH_BITE = 7;

function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 1.0;
  u.pitch = 1.3;
  window.speechSynthesis.speak(u);
}

export class EatStep extends BaseStep {
  private anims!: AnimationSystem;
  private sauceG!: Phaser.GameObjects.Graphics;
  private toppingObjs: Phaser.GameObjects.GameObject[] = [];
  private bakedOverlay!: Phaser.GameObjects.Graphics;
  private capybara!: Capybara;
  private capyOrigX = 0;
  private capyOrigY = 0;
  private eating = false;
  private biteCount = 0;
  private nextButton: Phaser.GameObjects.Container | null = null;
  private completed = false;
  private nextReady = false;
  private dead = false;
  private px: number;
  private py: number;
  private deathObjs: Phaser.GameObjects.GameObject[] = [];
  private currentPhase = '';
  private faceRedness!: Phaser.GameObjects.Graphics;

  constructor(ctx: StepContext) {
    super(ctx);
    this.anims = new AnimationSystem(ctx.scene);
    this.px = ctx.scene.scale.width / 2;
    this.py = ctx.scene.scale.height * 0.48 + 20;
  }

  enter(): void {
    const { scene } = this;

    const baseScene = scene as unknown as { capybara: Capybara };
    this.capybara = baseScene.capybara;
    const c = this.capybara.getContainer();
    c.setDepth(20);
    this.capyOrigX = c.x;
    this.capyOrigY = c.y;

    // Red face overlay
    this.faceRedness = this.scene.add.graphics();
    this.faceRedness.fillStyle(0xff0000, 0.35);
    this.faceRedness.fillCircle(0, -15, 30);
    this.faceRedness.setDepth(25);
    this.faceRedness.setAlpha(0);
    c.add(this.faceRedness);

    this.drawCuttingBoard();
    this.drawPizza();
    this.drawBakedOverlay();
    this.makePizzaInteractive();

    scene.events.emit('capybara-emotion', 'drool');
    this.createLabel('Tap the pizza to eat!', this.px, this.py - 230, '20px');

    this.nextButton = createNextButton(scene, this, () => this.onNext());
    this.nextButton.setVisible(false);

    this.setPhase('happy');
  }

  private setPhase(phase: string): void {
    if (this.currentPhase === phase) return;
    this.currentPhase = phase;
    audioManager.playBgm(`bgm-${phase}`, 1.2);
  }

  private drawCuttingBoard(): void {
    const g = this.scene.add.graphics();
    g.setDepth(0);
    g.fillStyle(BOARD_COLOR, 1);
    g.fillRoundedRect(this.px - 200, this.py - 175, 400, 350, 20);
    g.lineStyle(4, 0xa07850, 0.6);
    g.strokeRoundedRect(this.px - 200, this.py - 175, 400, 350, 20);
    g.fillStyle(0xffffff, 0.06);
    g.fillRoundedRect(this.px - 195, this.py - 170, 390, 340, 16);
    this.addObj(g);
  }

  private drawPizza(): void {
    const { scene } = this;

    const doughG = FoodGraphics.rolledDough(scene, this.px, this.py, 170) as Phaser.GameObjects.Graphics;
    doughG.setDepth(1);
    this.addObj(doughG);

    this.sauceG = scene.add.graphics();
    this.sauceG.setDepth(2);
    const savedSauce = scene.data.get('sauceData') as { positions: { x: number; y: number; color: number; r: number }[] } | null;
    if (savedSauce) {
      savedSauce.positions.forEach((p) => {
        this.sauceG.fillStyle(p.color, 0.7);
        this.sauceG.fillCircle(p.x, p.y, p.r);
      });
    }
    this.addObj(this.sauceG);

    const savedToppings = scene.data.get('toppingData') as { positions: { x: number; y: number; id: string; scale: number }[] } | null;
    if (savedToppings) {
      savedToppings.positions.forEach((p) => {
        const info = TOPPING_MAP[p.id];
        if (info) {
          const icon = info.drawIcon(scene, p.x, p.y);
          icon.setScale(p.scale);
          icon.setDepth(3);
          this.toppingObjs.push(icon);
          this.addObj(icon);
        }
      });
    }
  }

  private drawBakedOverlay(): void {
    this.bakedOverlay = this.scene.add.graphics();
    this.bakedOverlay.fillStyle(0xff8c00, 0.18);
    this.bakedOverlay.fillCircle(this.px, this.py, 170);
    this.bakedOverlay.setDepth(4);
    this.addObj(this.bakedOverlay);
  }

  private makePizzaInteractive(): void {
    const hitZone = this.scene.add.zone(this.px, this.py, 340, 340);
    hitZone.setInteractive({ useHandCursor: true });
    hitZone.setDepth(5);
    hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onPizzaTap(pointer.x, pointer.y);
    });
    this.addObj(hitZone);
  }

  private getSpeechText(): string {
    if (this.biteCount >= 4) {
      return this.biteCount % 2 === 0 ? 'I\'m full!' : 'No more!';
    }
    return this.biteCount % 2 === 0 ? 'Yummy!' : 'So good!';
  }

  private onPizzaTap(tx: number, ty: number): void {
    if (this.eating || this.completed || this.dead) return;

    const dist = Phaser.Math.Distance.Between(tx, ty, this.px, this.py);
    if (dist > 170) return;

    this.eating = true;
    this.biteCount++;

    if (this.biteCount >= DEATH_BITE) {
      this.onDeath(tx, ty);
      return;
    }

    // Update phase
    if (this.biteCount >= 4) {
      this.setPhase('danger');
      this.scene.events.emit('capybara-emotion', 'spicy');
    }

    // Redden face progressively (max at bite 7)
    const redAlpha = Math.min(0.8, this.biteCount * 0.12);
    this.scene.tweens.add({
      targets: this.faceRedness,
      alpha: redAlpha,
      duration: 300,
    });

    // Show Next button after 5th bite
    if (this.biteCount >= 5 && this.nextButton) {
      this.nextReady = true;
      this.nextButton.setVisible(true);
      this.anims.popIn(this.nextButton);
    }

    // Draw bite mark (exact board color with matching highlight)
    const mark = this.scene.add.graphics();
    mark.fillStyle(BOARD_COLOR, 1);
    mark.fillCircle(tx, ty, BITE_RADIUS);
    mark.fillStyle(0xffffff, 0.06);
    mark.fillCircle(tx, ty, BITE_RADIUS);
    mark.setDepth(6);

    // Hide toppings within bite radius
    this.toppingObjs.forEach((obj) => {
      if ('x' in obj && 'y' in obj && 'setVisible' in obj) {
        const d = Phaser.Math.Distance.Between(tx, ty, (obj as { x: number }).x, (obj as { y: number }).y);
        if (d < BITE_RADIUS) {
          (obj as Phaser.GameObjects.GameObject & { setVisible(v: boolean): void }).setVisible(false);
        }
      }
    });

    // Jump capybara to bite position
    const c = this.capybara.getContainer();
    this.scene.tweens.add({
      targets: c,
      x: tx,
      y: ty + 40,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (this.biteCount < 4) {
          this.scene.events.emit('capybara-emotion', 'excited');
        } else {
          this.scene.events.emit('capybara-emotion', 'spicy');
        }
        audioManager.playSfx('hold');
        speak(this.getSpeechText());

        // Chew animation
        let chewCount = 0;
        const chewEvent = this.scene.time.addEvent({
          delay: 200,
          repeat: 4,
          callback: () => {
            chewCount++;
            this.scene.tweens.add({
              targets: c,
              scaleY: { from: c.scaleY, to: c.scaleY * 0.92 },
              duration: 80,
              yoyo: true,
            });
            if (chewCount % 2 === 0) {
              audioManager.playSfx('pop', 0.4);
            }
          },
        });

        // After eating, jump back
        this.scene.time.delayedCall(1000, () => {
          chewEvent.remove();
          if (this.biteCount < 4) {
            this.scene.events.emit('capybara-emotion', 'drool');
          } else {
            this.scene.events.emit('capybara-emotion', 'spicy');
          }
          this.scene.tweens.add({
            targets: c,
            x: this.capyOrigX,
            y: this.capyOrigY,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
              this.eating = false;
            },
          });
        });
      },
    });
  }

  private onDeath(tx: number, ty: number): void {
    this.dead = true;
    const c = this.capybara.getContainer();

    this.scene.tweens.add({
      targets: c,
      x: tx,
      y: ty + 40,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.setPhase('sad');
        speak('Oh no... too much...');
        this.scene.events.emit('capybara-emotion', 'surprised');

        this.scene.time.delayedCall(600, () => {
          audioManager.playSfx('scream');
          this.scene.events.emit('capybara-emotion', 'spicy');

          // Vomit effect
          const vomit = this.scene.add.graphics();
          vomit.fillStyle(0x8bc34a, 0.8);
          for (let i = 0; i < 6; i++) {
            vomit.fillCircle(
              c.x + Phaser.Math.Between(-20, 20),
              c.y + 20 + Phaser.Math.Between(0, 30),
              Phaser.Math.Between(4, 8),
            );
          }
          vomit.setDepth(25);
          this.deathObjs.push(vomit);

          this.scene.tweens.add({
            targets: vomit,
            alpha: 0,
            duration: 1500,
            delay: 500,
          });

          // Death: X eyes + angel ring
          this.scene.time.delayedCall(1200, () => {
            this.drawDeathFace(c);
          });
        });
      },
    });
  }

  private drawDeathFace(c: Phaser.GameObjects.Container): void {
    const xEyeG = this.scene.add.graphics();
    xEyeG.lineStyle(3, 0x3e2723, 1);
    xEyeG.lineBetween(-4, -4, 4, 4);
    xEyeG.lineBetween(4, -4, -4, 4);

    const leftX = this.scene.add.container(-13, -26);
    leftX.add(xEyeG);
    leftX.setDepth(30);
    c.add(leftX);
    this.deathObjs.push(leftX);

    const xEyeG2 = this.scene.add.graphics();
    xEyeG2.lineStyle(3, 0x3e2723, 1);
    xEyeG2.lineBetween(-4, -4, 4, 4);
    xEyeG2.lineBetween(4, -4, -4, 4);

    const rightX = this.scene.add.container(13, -26);
    rightX.add(xEyeG2);
    rightX.setDepth(30);
    c.add(rightX);
    this.deathObjs.push(rightX);

    // Angel ring
    const ring = this.scene.add.graphics();
    ring.lineStyle(3, 0xffeb3b, 0.9);
    ring.strokeEllipse(0, -45, 30, 12);
    ring.fillStyle(0xffeb3b, 0.3);
    ring.fillEllipse(0, -45, 30, 12);
    ring.setDepth(30);
    c.add(ring);
    this.deathObjs.push(ring);

    this.scene.tweens.add({
      targets: ring,
      y: ring.y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.scene.tweens.add({
      targets: c,
      angle: 90,
      duration: 500,
      ease: 'Back.easeOut',
    });
  }

  private onNext(): void {
    if (this.completed || !this.nextReady) return;
    this.completed = true;

    speak('Thank you!');
    audioManager.stopBgm();

    const c = this.capybara.getContainer();

    if (this.dead) {
      // Fly to heaven
      this.scene.tweens.killTweensOf(c);

      const ring = this.scene.add.graphics();
      ring.lineStyle(3, 0xffeb3b, 0.9);
      ring.strokeEllipse(0, -45, 30, 12);
      ring.fillStyle(0xffeb3b, 0.3);
      ring.fillEllipse(0, -45, 30, 12);
      ring.setDepth(30);
      c.add(ring);

      this.scene.tweens.add({
        targets: ring,
        y: ring.y - 5,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.scene.tweens.add({
        targets: c,
        y: c.y - 500,
        alpha: 0,
        duration: 1500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.scene.time.delayedCall(500, () => {
            this.scene.scene.start('TitleScene');
          });
        },
      });
    } else {
      // Pre-death: move to center, happy, jump 3x, white fade
      this.scene.events.emit('capybara-emotion', 'happy');
      this.scene.tweens.killTweensOf(c);

      const centerX = this.scene.scale.width / 2;
      const centerY = this.scene.scale.height * 0.65;

      this.scene.tweens.add({
        targets: c,
        x: centerX,
        y: centerY,
        angle: 0,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          let jumpCount = 0;
          const doJump = () => {
            if (jumpCount >= 3) {
              // White fade
              const { width, height } = this.scene.scale;
              const white = this.scene.add.graphics();
              white.fillStyle(0xffffff, 1);
              white.fillRect(0, 0, width, height);
              white.setDepth(100);
              white.setAlpha(0);

              this.scene.tweens.add({
                targets: white,
                alpha: 1,
                duration: 1000,
                onComplete: () => {
                  this.scene.scene.start('TitleScene');
                },
              });
              return;
            }
            jumpCount++;
            this.scene.tweens.add({
              targets: c,
              y: centerY - 30,
              duration: 150,
              yoyo: true,
              ease: 'Quad.easeOut',
              onComplete: doJump,
            });
          };
          doJump();
        },
      });
    }
  }

  exit(): void {
    audioManager.stopBgm();
    this.deathObjs.forEach((o) => o.destroy());
    this.deathObjs = [];
    this.toppingObjs = [];
    super.exit();
  }
}
