export interface RecipeConfig {
  id: string;
  name: string;
  icon: string;
  background: string;
  steps: StepConfig[];
  celebration: CelebrationConfig;
}

export interface StepConfig {
  type: StepType;
  label: string;
  speech?: string;
  visual: StepVisualConfig;
  feedback: FeedbackConfig;
}

export type StepType = 'tap' | 'drag' | 'hold' | 'stir' | 'pour' | 'sprinkle' | 'wait' | 'sauce' | 'topping' | 'bake' | 'eat';

export interface StepVisualConfig {
  item?: string;
  itemColor?: number;
  tool?: string;
  toolColor?: number;
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  duration?: number;
  taps?: number;
  sourceColor?: number;
  targetColor?: number;
}

export interface FeedbackConfig {
  sound?: string;
  particles?: string;
  emotion?: EmotionType;
}

export type EmotionType = 'happy' | 'focused' | 'excited' | 'surprised' | 'proud' | 'idle' | 'drool' | 'spicy';

export interface CelebrationConfig {
  emotion: EmotionType;
  particles: string;
  stars: number;
}

export interface SaveData {
  version: number;
  coins: number;
  settings: SaveSettings;
  recipes: Record<string, RecipeSaveData>;
}

export interface SaveSettings {
  muted: boolean;
  bgmVolume: number;
  sfxVolume: number;
}

export interface RecipeSaveData {
  unlocked: boolean;
  completed: boolean;
  stars: number;
  timesCooked: number;
}
