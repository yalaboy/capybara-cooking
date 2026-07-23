import type { SaveData, RecipeSaveData } from '../types/recipe';

const STORAGE_KEY = 'capybara-cooking-save';
const CURRENT_VERSION = 1;

const DEFAULT_SAVE: SaveData = {
  version: CURRENT_VERSION,
  coins: 0,
  settings: {
    muted: false,
    bgmVolume: 0.4,
    sfxVolume: 0.7,
  },
  recipes: {},
};

const DEFAULT_RECIPE: RecipeSaveData = {
  unlocked: false,
  completed: false,
  stars: 0,
  timesCooked: 0,
};

class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };

      const parsed = JSON.parse(raw) as SaveData;
      return this.migrate(parsed);
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  private migrate(data: SaveData): SaveData {
    if (data.version < CURRENT_VERSION) {
      data.version = CURRENT_VERSION;
    }
    return data;
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }

  getCoins(): number {
    return this.data.coins;
  }

  addCoins(amount: number): void {
    this.data.coins += amount;
    this.save();
  }

  spendCoins(amount: number): boolean {
    if (this.data.coins < amount) return false;
    this.data.coins -= amount;
    this.save();
    return true;
  }

  getMuted(): boolean {
    return this.data.settings.muted;
  }

  setMuted(muted: boolean): void {
    this.data.settings.muted = muted;
    this.save();
  }

  getBgmVolume(): number {
    return this.data.settings.bgmVolume;
  }

  getSfxVolume(): number {
    return this.data.settings.sfxVolume;
  }

  setVolumes(bgm: number, sfx: number): void {
    this.data.settings.bgmVolume = bgm;
    this.data.settings.sfxVolume = sfx;
    this.save();
  }

  getRecipe(id: string): RecipeSaveData {
    if (!this.data.recipes[id]) {
      this.data.recipes[id] = { ...DEFAULT_RECIPE };
    }
    return this.data.recipes[id];
  }

  isRecipeUnlocked(id: string): boolean {
    return this.getRecipe(id).unlocked;
  }

  unlockRecipe(id: string): void {
    const recipe = this.getRecipe(id);
    recipe.unlocked = true;
    this.save();
  }

  completeRecipe(id: string, stars: number): void {
    const recipe = this.getRecipe(id);
    recipe.completed = true;
    recipe.stars = Math.max(recipe.stars, stars);
    recipe.timesCooked += 1;
    this.save();
  }

  getAllRecipes(): Record<string, RecipeSaveData> {
    return { ...this.data.recipes };
  }

  reset(): void {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }
}

export const saveManager = new SaveManager();
