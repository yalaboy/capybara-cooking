import Phaser from 'phaser';
import { AnimationSystem } from './AnimationSystem';
import { audioManager } from '../managers/AudioManager';
import type { EmotionType } from '../types/recipe';

export interface FeedbackOptions {
  sound?: string;
  particles?: string;
  emotion?: EmotionType;
  target?: Phaser.GameObjects.GameObject;
  particleX?: number;
  particleY?: number;
}

export class FeedbackSystem {
  private animations: AnimationSystem;
  private onEmotionChange: ((emotion: EmotionType) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.animations = new AnimationSystem(scene);
  }

  setEmotionCallback(cb: (emotion: EmotionType) => void): void {
    this.onEmotionChange = cb;
  }

  playFeedback(scene: Phaser.Scene, options: FeedbackOptions): void {
    const {
      sound,
      particles,
      emotion,
      target,
      particleX = scene.scale.width / 2,
      particleY = scene.scale.height / 2,
    } = options;

    if (target) {
      this.animations.squash(target);
    }

    if (sound) {
      audioManager.playSfx(sound);
    }

    if (particles) {
      this.animations.emitCircleParticles(particleX, particleY, particles, 8, 80, 600);
    }

    if (emotion && this.onEmotionChange) {
      this.onEmotionChange(emotion);
    }
  }

  playSuccess(scene: Phaser.Scene, options: FeedbackOptions): void {
    this.playFeedback(scene, {
      ...options,
      emotion: options.emotion ?? 'happy',
    });
  }

  playCelebration(
    scene: Phaser.Scene,
    x: number,
    y: number,
    particles: string,
    emotion: EmotionType = 'excited',
  ): void {
    this.animations.emitCircleParticles(x, y, particles, 30, 200, 1200);
    audioManager.playSfx('fanfare');
    if (this.onEmotionChange) {
      this.onEmotionChange(emotion);
    }
  }

  getAnimations(): AnimationSystem {
    return this.animations;
  }
}
