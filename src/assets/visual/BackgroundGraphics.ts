import Phaser from 'phaser';

export class BackgroundGraphics {
  static kitchenDefault(scene: Phaser.Scene, w: number, h: number): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0xfce4ec, 1);
    g.fillRect(0, 0, w, h);

    const tileY = h * 0.1;
    const tileH = h * 0.35;
    g.fillStyle(0xf8bbd0, 0.15);
    for (let tx = 0; tx < w; tx += 50) {
      for (let ty = tileY; ty < tileY + tileH; ty += 30) {
        g.lineStyle(1, 0xf48fb1, 0.08);
        g.strokeRect(tx, ty, 48, 28);
      }
    }

    const counterY = h * 0.6;
    const counterH = h * 0.25;
    g.fillStyle(0xfff3e0, 1);
    g.fillRect(0, counterY, w, counterH);
    g.lineStyle(3, 0xd7ccc8, 0.5);
    g.lineBetween(0, counterY, w, counterY);

    g.fillStyle(0xefebe9, 1);
    g.fillRect(0, counterY + counterH, w, h - (counterY + counterH));
    g.lineStyle(1, 0xd7ccc8, 0.3);
    g.lineBetween(w / 2, counterY + counterH, w / 2, h);

    g.fillStyle(0xfbe9e7, 1);
    g.fillRect(0, h - 20, w, 20);

    return g;
  }

  static kitchenPizza(scene: Phaser.Scene, w: number, h: number): Phaser.GameObjects.Graphics {
    const g = this.kitchenDefault(scene, w, h);
    g.fillStyle(0xfff9c4, 0.3);
    g.fillEllipse(w * 0.3, h * 0.65, 160, 40);
    g.fillStyle(0xfff9c4, 0.15);
    for (let i = 0; i < 8; i++) {
      g.fillCircle(
        w * 0.2 + Math.random() * w * 0.2,
        h * 0.6 + Math.random() * h * 0.15,
        3 + Math.random() * 5,
      );
    }
    return g;
  }
}
