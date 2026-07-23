export const GameEvents = {
  STEP_START: 'game:step-start',
  STEP_COMPLETE: 'game:step-complete',
  RECIPE_START: 'game:recipe-start',
  RECIPE_COMPLETE: 'game:recipe-complete',
} as const;

export type GameEvent = (typeof GameEvents)[keyof typeof GameEvents];
