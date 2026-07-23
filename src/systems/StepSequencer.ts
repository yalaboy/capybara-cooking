import Phaser from 'phaser';
import { BaseStep } from '../steps/BaseStep';
import { createStep } from '../steps/StepFactory';
import { GameEvents } from '../types/events';
import type { StepConfig } from '../types/recipe';

export class StepSequencer {
  private scene: Phaser.Scene;
  private steps: StepConfig[] = [];
  private currentIndex = -1;
  private currentStep: BaseStep | null = null;
  private centerX: number;
  private centerY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.centerX = scene.scale.width / 2;
    this.centerY = scene.scale.height / 2;
  }

  loadSteps(steps: StepConfig[]): void {
    this.steps = steps;
    this.currentIndex = -1;
  }

  start(): void {
    this.next();
  }

  private next(): void {
    this.currentIndex++;

    if (this.currentIndex >= this.steps.length) {
      this.scene.events.emit(GameEvents.RECIPE_COMPLETE);
      return;
    }

    if (this.currentStep) {
      this.currentStep.exit();
      this.currentStep = null;
    }

    const config = this.steps[this.currentIndex];
    this.scene.events.emit(GameEvents.STEP_START, this.currentIndex, this.steps.length);

    if (config.speech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(config.speech);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }

    this.currentStep = createStep({
      scene: this.scene,
      config,
      onComplete: () => this.onStepComplete(),
      centerX: this.centerX,
      centerY: this.centerY,
    });

    this.currentStep.enter();
  }

  private onStepComplete(): void {
    this.scene.events.emit(GameEvents.STEP_COMPLETE, this.currentIndex, this.steps.length);
    this.scene.time.delayedCall(300, () => this.next());
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalSteps(): number {
    return this.steps.length;
  }

  update(time: number, delta: number): void {
    if (this.currentStep) {
      this.currentStep.update(time, delta);
    }
  }

  destroy(): void {
    if (this.currentStep) {
      this.currentStep.exit();
      this.currentStep = null;
    }
    this.steps = [];
  }
}
