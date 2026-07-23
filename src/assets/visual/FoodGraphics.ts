import Phaser from 'phaser';

export class FoodGraphics {
  static doughBall(scene: Phaser.Scene, x: number, y: number, r = 40, color = 0xf5deb3): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.08);
    g.fillCircle(x + 3, y + 4, r);
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r);
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(x - r * 0.2, y - r * 0.25, r * 0.35);
    return g;
  }

  static rolledDough(scene: Phaser.Scene, x: number, y: number, r = 70, color = 0xf5deb3): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.08);
    g.fillCircle(x + 3, y + 4, r + 4);
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r);
    g.fillStyle(0x000000, 0.04);
    for (let i = 0; i < 6; i++) {
      const dx = Phaser.Math.Between(-r + 10, r - 10);
      const dy = Phaser.Math.Between(-r + 5, r - 5);
      g.fillCircle(x + dx, y + dy, 3);
    }
    return g;
  }

  static sauceSplat(scene: Phaser.Scene, x: number, y: number, r = 50, color = 0xe53935): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(color, 0.9);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = r * (0.7 + Math.random() * 0.3);
      g.fillCircle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, r * 0.4 + Math.random() * 0.2 * r);
    }
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r * 0.5);
    g.fillStyle(0x000000, 0.08);
    g.fillCircle(x + 2, y + 3, r * 0.5);
    return g;
  }

  static cheeseShreds(scene: Phaser.Scene, x: number, y: number, count = 8, color = 0xffe082): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      const lx = x + Math.cos(angle) * dist;
      const ly = y + Math.sin(angle) * dist;
      g.fillStyle(color, 0.7 + Math.random() * 0.3);
      g.fillRect(lx, ly, 20 + Math.random() * 10, 4 + Math.random() * 3);
    }
    return g;
  }

  static pepperoni(scene: Phaser.Scene, x: number, y: number, count = 8, color = 0xbf360c): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 35;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const size = 8 + Math.random() * 6;
      g.fillStyle(0x000000, 0.1);
      g.fillCircle(px + 1, py + 2, size);
      g.fillStyle(color, 1);
      g.fillCircle(px, py, size);
      g.fillStyle(color - 0x221100, 1);
      g.fillCircle(px, py, size * 0.4);
    }
    return g;
  }

  static pizzaBaked(scene: Phaser.Scene, x: number, y: number, r = 70, crustColor = 0xffcc80): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.1);
    g.fillCircle(x + 3, y + 5, r);
    g.fillStyle(crustColor, 1);
    g.fillCircle(x, y, r);
    g.fillStyle(0xe53935, 0.9);
    g.fillCircle(x, y, r * 0.75);
    g.fillStyle(0xffe082, 0.8);
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r * 0.5;
      g.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 8 + Math.random() * 6, 3 + Math.random() * 2);
    }
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2 - Math.PI / 2;
      const d = 10 + Math.random() * 30;
      g.fillStyle(0xbf360c, 1);
      g.fillCircle(x + Math.cos(a) * d, y + Math.sin(a) * d, 8);
    }
    return g;
  }

  static bottomBun(scene: Phaser.Scene, x: number, y: number, w = 120, h = 35, color = 0xe8c37e): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.08);
    g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 5, w, h, { tl: 4, tr: 4, bl: 10, br: 10 });
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, { tl: 4, tr: 4, bl: 10, br: 10 });
    return g;
  }

  static tortilla(scene: Phaser.Scene, x: number, y: number, r = 55, color = 0xe8c37e): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.08);
    g.fillCircle(x + 2, y + 4, r);
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r);
    g.fillStyle(0x000000, 0.05);
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r * 0.6;
      g.fillCircle(x + Math.cos(a) * d, y + Math.sin(a) * d, 5 + Math.random() * 4);
    }
    return g;
  }

  static cuttingBoard(scene: Phaser.Scene, x: number, y: number, size = 200, color = 0xd7ccc8): Phaser.GameObjects.Graphics {
    const s = size;
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.08);
    g.fillRoundedRect(x - s / 2 + 3, y - s / 2 + 5, s, s, 10);
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 10);
    g.fillStyle(color - 0x110000, 0.3);
    for (let i = 0; i < 6; i++) {
      const ly = y - s / 2 + 15 + i * (s / 7);
      g.fillRect(x - s / 2 + 12, ly, s - 24, 3);
    }
    g.fillStyle(0x000000, 0.03);
    for (let i = 0; i < 3; i++) {
      g.fillCircle(x - s / 4 + i * (s / 4), y + s / 8, 4 + Math.random() * 3);
    }
    return g;
  }

  static rollingPin(scene: Phaser.Scene, x: number, y: number, color = 0xd7ccc8, handleColor = 0xa1887f): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.08);
    g.fillRoundedRect(x - 26, y - 8 + 3, 52, 16, 6);
    g.fillStyle(handleColor, 1);
    g.fillRoundedRect(x - 38, y - 5, 12, 10, 3);
    g.fillRoundedRect(x + 26, y - 5, 12, 10, 3);
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - 24, y - 8, 48, 16, 6);
    g.lineStyle(1, 0x000000, 0.06);
    g.lineBetween(x - 18, y, x + 18, y);
    return g;
  }

  static whisk(scene: Phaser.Scene, x: number, y: number, color = 0xbdbdbd, handleColor = 0x8d6e63): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.06);
    g.fillRect(x + 1, y + 3, 24, 6);
    g.fillStyle(handleColor, 1);
    g.fillRoundedRect(x, y, 24, 6, 3);
    g.lineStyle(2, color, 0.8);
    for (let i = 0; i < 4; i++) {
      const ox = 24 + i * 4;
      g.beginPath();
      g.arc(x + ox, y + 3, 10 + i * 2, -0.6, 0.6);
      g.strokePath();
    }
    return g;
  }

  static bonfire(scene: Phaser.Scene, x: number, y: number, scale = 1): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const s = scale;

    g.fillStyle(0x5d4037, 1);
    g.fillRect(x - 30 * s, y + 5, 60 * s, 8 * s);
    g.fillRect(x - 20 * s, y - 2, 40 * s, 8 * s);

    g.fillStyle(0xe53935, 0.8);
    g.beginPath();
    g.moveTo(x - 22 * s, y);
    g.lineTo(x, y - 50 * s);
    g.lineTo(x + 22 * s, y);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xff6d00, 0.9);
    g.beginPath();
    g.moveTo(x - 14 * s, y);
    g.lineTo(x - 2 * s, y - 38 * s);
    g.lineTo(x + 5 * s, y - 42 * s);
    g.lineTo(x + 14 * s, y);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xffd54f, 1);
    g.beginPath();
    g.moveTo(x - 6 * s, y);
    g.lineTo(x, y - 28 * s);
    g.lineTo(x + 6 * s, y);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xfff9c4, 1);
    g.fillEllipse(x, y - 8 * s, 6 * s, 14 * s);

    return g;
  }

  static fan(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics();
    const s = 2;

    g.fillStyle(0x8d6e63, 1);
    g.fillRoundedRect(x - 2 * s, y, 4 * s, 28 * s, 2);

    g.fillStyle(0xffcc80, 1);
    g.fillCircle(x, y, 20 * s);

    g.lineStyle(1.5, 0x8d6e63, 0.5);
    for (let i = -3; i <= 3; i++) {
      const angle = (i / 3) * Phaser.Math.DegToRad(80);
      g.lineBetween(x, y, x + Math.sin(angle) * 20 * s, y - Math.cos(angle) * 20 * s);
    }

    g.fillStyle(0x8d6e63, 1);
    g.fillCircle(x, y, 3 * s);

    return g;
  }

  static drawItem(scene: Phaser.Scene, x: number, y: number, item: string, size = 60): Phaser.GameObjects.Graphics | null {
    const lower = item.toLowerCase();
    if (lower.includes('dough') || lower.includes('roll')) return FoodGraphics.doughBall(scene, x, y, size * 0.5);
    if (lower.includes('sauce')) return FoodGraphics.sauceSplat(scene, x, y, size * 0.45);
    if (lower.includes('cheese')) return FoodGraphics.cheeseShreds(scene, x, y, 8);
    if (lower.includes('pepperoni')) return FoodGraphics.pepperoni(scene, x, y, 8);
    if (lower.includes('pizza') || lower.includes('bake') || lower.includes('done') || lower.includes('oven'))
      return FoodGraphics.pizzaBaked(scene, x, y, size * 0.5);
    return null;
  }
}
