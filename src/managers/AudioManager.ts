import Phaser from 'phaser';
import { saveManager } from './SaveManager';
import { playSynth, playBgmSynth, stopBgmSynth, resumeAudioContext } from '../assets/audio/SynthSounds';

class AudioManager {
  private bgm: Phaser.Sound.BaseSound | null = null;
  private scene: Phaser.Scene | null = null;
  private currentBgmKey = '';

  attach(scene: Phaser.Scene): void {
    this.scene = scene;
    resumeAudioContext(scene);
  }

  playBgm(key: string, volume?: number): void {
    if (!this.scene) return;
    if (this.currentBgmKey === key && this.bgm?.isPlaying) return;

    this.stopBgm();
    this.currentBgmKey = key;

    const vol = volume ?? saveManager.getBgmVolume();

    if (this.scene.cache.audio.exists(key)) {
      this.bgm = this.scene.sound.add(key, {
        loop: true,
        volume: saveManager.getMuted() ? 0 : vol,
      });
      this.bgm.play();
    } else {
      playBgmSynth(this.scene, key, saveManager.getMuted() ? 0 : vol);
    }
  }

  stopBgm(fadeMs = 500): void {
    if (this.bgm) {
      const sound = this.bgm;
      if (fadeMs > 0 && this.scene) {
        this.scene.tweens.add({
          targets: sound,
          volume: 0,
          duration: fadeMs,
          onComplete: () => {
            sound.stop();
            sound.destroy();
          },
        });
      } else {
        sound.stop();
        sound.destroy();
      }
      this.bgm = null;
      this.currentBgmKey = '';
    } else {
      stopBgmSynth();
      this.currentBgmKey = '';
    }
  }

  playSfx(key: string, volume?: number): void {
    if (!this.scene || saveManager.getMuted()) return;
    const vol = volume ?? saveManager.getSfxVolume();

    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { volume: vol });
    } else {
      playSynth(this.scene, key, vol);
    }
  }

  setMuted(muted: boolean): void {
    saveManager.setMuted(muted);
    if (this.bgm) {
      (this.bgm as Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound).setVolume(
        muted ? 0 : saveManager.getBgmVolume(),
      );
    } else {
      stopBgmSynth();
      if (!muted) {
        playBgmSynth(this.scene!, this.currentBgmKey, saveManager.getBgmVolume());
      }
    }
  }

  toggleMute(): boolean {
    const muted = !saveManager.getMuted();
    this.setMuted(muted);
    return muted;
  }

  isMuted(): boolean {
    return saveManager.getMuted();
  }

  detach(): void {
    this.stopBgm();
    this.scene = null;
  }
}

export const audioManager = new AudioManager();
