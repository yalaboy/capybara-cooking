import Phaser from 'phaser';
import { GameConfig } from './GameConfig';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { PizzaScene } from './scenes/PizzaScene';

const config: Phaser.Types.Core.GameConfig = {
  ...GameConfig,
  parent: 'game-container',
  scene: [BootScene, TitleScene, PizzaScene],
};

new Phaser.Game(config);

// Lock to landscape on supported devices
const orient = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
if (orient.lock) {
  orient.lock('landscape').catch(() => {
    // Silently ignore — not all browsers support this
  });
}
