import Phaser from 'phaser';

export class ProgressBar {
  private scene: Phaser.Scene;
  private bgBar: Phaser.GameObjects.Graphics;
  private fillBar: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private progress = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.bgBar = scene.add.graphics();
    this.bgBar.fillStyle(0xe0e0e0, 1);
    this.bgBar.fillRoundedRect(x, y, width, height, height / 2);

    this.fillBar = scene.add.graphics();
  }

  setProgress(current: number, total: number): void {
    this.progress = total > 0 ? current / total : 0;
    this.redraw();
  }

  private redraw(): void {
    this.fillBar.clear();
    const fillW = this.width * this.progress;
    if (fillW > 0) {
      this.fillBar.fillStyle(0xff8a80, 1);
      this.fillBar.fillRoundedRect(this.x, this.y, fillW, this.height, this.height / 2);
    }
  }

  destroy(): void {
    this.bgBar.destroy();
    this.fillBar.destroy();
  }
}
