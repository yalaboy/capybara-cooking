import Phaser from 'phaser';

export interface ToppingInfo {
  id: string;
  color: number;
  liked: boolean;
  label: string;
  drawIcon: (scene: Phaser.Scene, x: number, y: number) => Phaser.GameObjects.Container;
}

export const TOPPINGS: ToppingInfo[] = [
  {
    id: 'olive', color: 0x212121, liked: false, label: 'olive',
    drawIcon: (scene, x, y) => {
      const c = scene.add.container(x, y);
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.08);
      g.fillEllipse(1, 3, 26, 18);
      g.fillStyle(0x212121, 1);
      g.fillEllipse(0, 0, 26, 18);
      g.fillStyle(0x424242, 1);
      g.fillEllipse(0, 0, 14, 10);
      g.fillStyle(0x000000, 0.6);
      g.fillEllipse(0, 0, 8, 6);
      g.fillStyle(0xffffff, 0.1);
      g.fillEllipse(-4, -3, 4, 3);
      c.add(g);
      return c;
    },
  },
  {
    id: 'pineapple', color: 0xffd600, liked: true, label: 'pineapple',
    drawIcon: (scene, x, y) => {
      const c = scene.add.container(x, y);
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.08);
      g.fillStyle(0xffd600, 1);
      g.beginPath();
      g.moveTo(-10, -2);
      g.lineTo(10, -2);
      g.lineTo(8, 10);
      g.lineTo(-12, 10);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffab00, 0.3);
      g.fillRect(-12, -1, 8, 10);
      g.fillRect(2, -1, 8, 10);
      g.fillStyle(0x000000, 0.05);
      g.fillRect(-10, 1, 20, 2);
      g.fillRect(-10, 5, 20, 2);
      c.add(g);
      return c;
    },
  },
  {
    id: 'ham', color: 0xbf360c, liked: false, label: 'ham',
    drawIcon: (scene, x, y) => {
      const c = scene.add.container(x, y);
      const g = scene.add.graphics();
      g.fillStyle(0x000000, 0.08);
      g.fillCircle(1, 2, 13);
      g.fillStyle(0xbf360c, 1);
      g.fillCircle(0, 0, 13);
      g.fillStyle(0x8d0000, 0.5);
      g.fillCircle(-2, -2, 5);
      c.add(g);
      return c;
    },
  },
  {
    id: 'cheese', color: 0xfff176, liked: true, label: 'cheese',
    drawIcon: (scene, x, y) => {
      const c = scene.add.container(x, y);
      const g = scene.add.graphics();
      for (let i = 0; i < 36; i++) {
        const cx = Math.random() * 40 - 20;
        const cy = Math.random() * 32 - 16;
        g.fillStyle(0xfff176, 0.7 + Math.random() * 0.3);
        g.fillRect(cx, cy, 5 + Math.random() * 4, 2 + Math.random() * 2);
      }
      c.add(g);
      return c;
    },
  },
  {
    id: 'potato', color: 0xf5deb3, liked: true, label: 'potato',
    drawIcon: (scene, x, y) => {
      const c = scene.add.container(x, y);
      const g = scene.add.graphics();
      for (let i = 0; i < 5; i++) {
        const fx = Math.random() * 12 - 6;
        const fy = Math.random() * 10 - 5;
        g.fillStyle(0xf5c842, 1);
        g.fillRect(fx, fy, 4 + Math.random() * 3, 18 + Math.random() * 10);
        g.fillStyle(0xd49a3d, 0.6);
        g.fillRect(fx + 1, fy + 1, 2, 10 + Math.random() * 6);
        g.fillStyle(0xffffff, 0.2);
        g.fillRect(fx + 1, fy + 1, 1, 4);
      }
      c.add(g);
      return c;
    },
  },
  {
    id: 'broccoli', color: 0x388e3c, liked: false, label: 'broccoli',
    drawIcon: (scene, x, y) => {
      const c = scene.add.container(x, y);
      const g = scene.add.graphics();
      g.fillStyle(0x66bb6a, 1);
      g.fillRect(-2, 4, 4, 10);
      g.fillStyle(0x388e3c, 1);
      g.fillCircle(0, -2, 8);
      g.fillCircle(-6, 1, 7);
      g.fillCircle(6, 1, 7);
      g.fillCircle(0, -8, 7);
      g.fillCircle(-4, -5, 6);
      g.fillCircle(4, -5, 6);
      g.fillStyle(0x2e7d32, 0.5);
      g.fillCircle(-2, -6, 3);
      g.fillCircle(3, -3, 3);
      c.add(g);
      return c;
    },
  },
];

export const TOPPING_MAP: Record<string, ToppingInfo> = {};
TOPPINGS.forEach((t) => { TOPPING_MAP[t.id] = t; });
