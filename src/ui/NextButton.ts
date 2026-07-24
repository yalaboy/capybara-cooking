import Phaser from 'phaser';
import type { BaseStep } from '../steps/BaseStep';

export function createNextButton(scene: Phaser.Scene, step: BaseStep, onClick: () => void): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;

  const container = scene.add.container(width - 250, height - 140);
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

  const nextLabel = scene.add.text(0, 58, 'NEXT', {
    fontSize: '20px',
    color: '#4caf50',
    fontStyle: 'bold',
  });
  nextLabel.setOrigin(0.5);
  container.add(nextLabel);

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
    targets: [glow, bg],
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
