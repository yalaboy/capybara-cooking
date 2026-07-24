import Phaser from 'phaser';
import type { BaseStep } from '../steps/BaseStep';

export function createNextButton(scene: Phaser.Scene, step: BaseStep, onClick: () => void): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;

  const container = scene.add.container(width - 130, height - 110);
  container.setDepth(6);

  // Glow ring
  const glow = scene.add.graphics();
  glow.fillStyle(0xa5d6a7, 0.5);
  glow.fillCircle(0, 0, 58);
  container.add(glow);

  const bg = scene.add.graphics();
  bg.fillStyle(0xa5d6a7, 1);
  bg.fillCircle(0, 0, 38);
  bg.fillStyle(0xffffff, 0.9);
  bg.fillTriangle(-10, -10, -10, 10, 10, 0);
  container.add(bg);

  // Finger pointer
  const finger = scene.add.graphics();
  finger.fillStyle(0xffe0b2, 1);
  finger.fillRoundedRect(28, -8, 22, 12, 4);
  finger.fillRoundedRect(44, -10, 10, 16, 4);
  finger.fillRoundedRect(46, -14, 8, 8, 4);
  finger.fillStyle(0xffcc80, 1);
  finger.fillRoundedRect(30, -6, 18, 8, 3);
  container.add(finger);

  container.setSize(76, 76);
  container.setInteractive({ useHandCursor: true });
  container.on('pointerdown', onClick);

  // Pulse glow
  scene.tweens.add({
    targets: glow,
    alpha: { from: 0.4, to: 1 },
    scaleX: { from: 1, to: 1.7 },
    scaleY: { from: 1, to: 1.7 },
    duration: 700,
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

  // Float
  scene.tweens.add({
    targets: container,
    y: container.y - 6,
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  (step as unknown as { addObj: <T extends Phaser.GameObjects.GameObject>(obj: T) => T }).addObj(container);
  return container;
}
