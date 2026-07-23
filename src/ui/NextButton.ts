import Phaser from 'phaser';
import type { BaseStep } from '../steps/BaseStep';

export function createNextButton(scene: Phaser.Scene, step: BaseStep, onClick: () => void): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;

  const container = scene.add.container(width - 120, height - 100);
  container.setDepth(6);

  // Glow ring
  const glow = scene.add.graphics();
  glow.fillStyle(0xa5d6a7, 0.3);
  glow.fillCircle(0, 0, 42);
  container.add(glow);

  const bg = scene.add.graphics();
  bg.fillStyle(0xa5d6a7, 1);
  bg.fillCircle(0, 0, 28);
  bg.fillStyle(0xffffff, 0.9);
  bg.fillTriangle(-8, -8, -8, 8, 8, 0);
  container.add(bg);

  container.setSize(56, 56);
  container.setInteractive({ useHandCursor: true });
  container.on('pointerdown', onClick);

  // Pulse glow
  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.2, to: 1 },
    scaleX: { from: 1, to: 1.6 },
    scaleY: { from: 1, to: 1.6 },
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  // Shake
  scene.tweens.add({
    targets: container,
    angle: { from: -8, to: 8 },
    duration: 100,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  (step as unknown as { addObj: <T extends Phaser.GameObjects.GameObject>(obj: T) => T }).addObj(container);
  return container;
}
