import Phaser from 'phaser';

export class UIStyles {
  static chefHat(scene: Phaser.Scene, x: number, y: number, size = 20, color = 0xffffff): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - size * 0.5, y - size * 0.1, size, size * 0.3, 4);
    g.fillStyle(color, 1);
    g.fillCircle(x - size * 0.25, y - size * 0.25, size * 0.3);
    g.fillCircle(x + size * 0.25, y - size * 0.25, size * 0.3);
    g.fillCircle(x, y - size * 0.35, size * 0.32);
    g.lineStyle(1, 0xe0e0e0, 0.8);
    g.strokeCircle(x - size * 0.25, y - size * 0.25, size * 0.3);
    g.strokeCircle(x + size * 0.25, y - size * 0.25, size * 0.3);
    g.strokeCircle(x, y - size * 0.35, size * 0.32);
    return g;
  }
}
