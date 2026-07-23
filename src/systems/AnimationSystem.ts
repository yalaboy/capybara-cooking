import Phaser from 'phaser';

export class AnimationSystem {
  constructor(private scene: Phaser.Scene) {}

  popIn(target: Phaser.GameObjects.GameObject, duration = 300): void {
    const obj = target as Phaser.GameObjects.Sprite;
    obj.setScale(0);
    obj.setAlpha(0);
    this.scene.tweens.add({
      targets: obj,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration,
      ease: 'Back.easeOut',
    });
  }

  popOut(target: Phaser.GameObjects.GameObject, duration = 200, onComplete?: () => void): void {
    const obj = target as Phaser.GameObjects.Sprite;
    this.scene.tweens.add({
      targets: obj,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration,
      ease: 'Back.easeIn',
      onComplete,
    });
  }

  bounce(target: Phaser.GameObjects.GameObject, intensity = 10, duration = 400): void {
    const obj = target as Phaser.GameObjects.Sprite;
    const origY = obj.y;
    this.scene.tweens.add({
      targets: obj,
      y: origY - intensity,
      duration: duration / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  squash(target: Phaser.GameObjects.GameObject, scaleX = 1.2, scaleY = 0.8, duration = 150): void {
    const obj = target as Phaser.GameObjects.Sprite;
    const origScaleX = obj.scaleX;
    const origScaleY = obj.scaleY;
    this.scene.tweens.add({
      targets: obj,
      scaleX: origScaleX * scaleX,
      scaleY: origScaleY * scaleY,
      duration: duration / 2,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  float(target: Phaser.GameObjects.GameObject, distance = 8, duration = 1500): void {
    const obj = target as Phaser.GameObjects.Sprite;
    const origY = obj.y;
    this.scene.tweens.add({
      targets: obj,
      y: origY - distance,
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  shake(target: Phaser.GameObjects.GameObject, intensity = 3, duration = 300): void {
    const obj = target as Phaser.GameObjects.Sprite;
    const baseX = obj.x;
    this.scene.tweens.add({
      targets: obj,
      x: baseX + intensity,
      duration: 50,
      yoyo: true,
      repeat: Math.floor(duration / 100),
      ease: 'Sine.easeInOut',
      onComplete: () => { obj.x = baseX; },
    });
  }

  pulse(target: Phaser.GameObjects.GameObject, scale = 1.05, duration = 800): void {
    const obj = target as Phaser.GameObjects.Sprite;
    this.scene.tweens.add({
      targets: obj,
      scaleX: obj.scaleX * scale,
      scaleY: obj.scaleY * scale,
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  moveTo(
    target: Phaser.GameObjects.GameObject,
    x: number,
    y: number,
    duration = 500,
    onComplete?: () => void,
  ): void {
    const obj = target as Phaser.GameObjects.Sprite;
    this.scene.tweens.add({
      targets: obj,
      x,
      y,
      duration,
      ease: 'Quad.easeInOut',
      onComplete,
    });
  }

  fadeIn(target: Phaser.GameObjects.GameObject, duration = 300): void {
    const obj = target as Phaser.GameObjects.Sprite;
    obj.setAlpha(0);
    this.scene.tweens.add({
      targets: obj,
      alpha: 1,
      duration,
    });
  }

  fadeOut(target: Phaser.GameObjects.GameObject, duration = 300, onComplete?: () => void): void {
    const obj = target as Phaser.GameObjects.Sprite;
    this.scene.tweens.add({
      targets: obj,
      alpha: 0,
      duration,
      onComplete,
    });
  }

  emitCircleParticles(
    x: number,
    y: number,
    texture: string,
    count = 10,
    speed = 100,
    lifespan = 600,
  ): void {
    const emitter = this.scene.add.particles(x, y, texture, {
      speed: { min: speed * 0.3, max: speed },
      scale: { start: 0.8, end: 0 },
      lifespan,
      quantity: count,
      emitting: false,
    });
    emitter.explode(count);
    this.scene.time.delayedCall(lifespan + 100, () => emitter.destroy());
  }
}
