import { BaseStep, type StepContext } from './BaseStep';
import { TapStep } from './TapStep';
import { DragStep } from './DragStep';
import { HoldStep } from './HoldStep';
import { StirStep } from './StirStep';
import { PourStep } from './PourStep';
import { SprinkleStep } from './SprinkleStep';
import { WaitStep } from './WaitStep';
import { SauceStep } from './SauceStep';
import { ToppingStep } from './ToppingStep';
import { BakeStep } from './BakeStep';
import { EatStep } from './EatStep';
import type { StepType } from '../types/recipe';

const STEP_CLASSES: Record<StepType, new (ctx: StepContext) => BaseStep> = {
  tap: TapStep,
  drag: DragStep,
  hold: HoldStep,
  stir: StirStep,
  pour: PourStep,
  sprinkle: SprinkleStep,
  wait: WaitStep,
  sauce: SauceStep,
  topping: ToppingStep,
  bake: BakeStep,
  eat: EatStep,
};

export function createStep(ctx: StepContext): BaseStep {
  const StepClass = STEP_CLASSES[ctx.config.type];
  if (!StepClass) {
    throw new Error(`Unknown step type: ${ctx.config.type}`);
  }
  return new StepClass(ctx);
}
