# Capybara Cooking - Project Tracker

> A commercial-quality browser cooking game for children (ages 4-6).

---

## Project Overview

| Field | Value |
|-------|-------|
| **Title** | Capybara Cooking (working) |
| **Target Age** | 4-6 years old |
| **Platform** | Browser (tablet-first) |
| **Input** | Touch-first, mouse secondary |
| **Language** | TypeScript |
| **Engine** | Phaser 3 |
| **Bundler** | Vite |
| **Framework** | None (Phaser only, no React) |

### Design Philosophy

- No timer, no fail state, no stress
- Positive feedback only — particles, bounce, smile, sound
- Relaxing, cute, pastel art style
- No reading required — icons and visuals only
- Every action produces satisfying feedback ("juice")
- Capybara is the adorable main character and guide

### Gameplay Loop

1. Player presses Play on title screen
2. Capybara guides the player through 4 steps to make pizza
3. Each step is a simple touch interaction (sauce selection, topping sprinkling)
4. Full recipe takes 1-3 minutes
5. Player always succeeds — celebration at the end
6. Earn stars/coins as positive reinforcement

---

## Tech Stack & Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | TypeScript | Type safety, editor support, maintainability |
| Engine | Phaser 3 | Mature, 2D-focused, strong community |
| Bundler | Vite | Fast HMR, simple config, ESM-native |
| UI Framework | None | Keep everything inside Phaser scenes |
| State | LocalStorage | Simple, no server needed |
| JSON | Recipe data | Data-driven design |
| Audio | Phaser.Sound + Web Audio API synths | Built-in + procedural fallback, no extra dependency |

### Key Architecture Principles

- **SOLID** — Single responsibility, open for extension
- **Composition** over inheritance
- **Data-driven** — Recipes are JSON, not code
- **Reusable components** — Step types, UI widgets, input handlers
- **Small files** — No file exceeds ~400 lines
- **No hardcoding** — All magic numbers in config files

---

## Folder Structure

```
capybara/
├── PROJECT.md              # This file
├── ASSETS.md               # Asset specification for artist/audio replacement
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.ts                 # Entry point, Phaser.Game config
    ├── GameConfig.ts           # Game dimensions, physics, etc.
    ├── assets/
    │   ├── visual/
    │   │   ├── FoodGraphics.ts     # Procedural food drawings (pizza items)
    │   │   ├── BackgroundGraphics.ts# Kitchen backgrounds
    │   │   └── UIStyles.ts         # Reusable UI primitives
    │   └── audio/
    │       └── SynthSounds.ts      # Web Audio API synthesized SFX (15+ sounds)
    ├── scenes/
    │   ├── BootScene.ts        # Generate particle textures, boot
    │   ├── TitleScene.ts       # Title screen + Play → PizzaScene
    │   ├── BaseRecipeScene.ts  # Abstract base for recipe scenes
    │   └── PizzaScene.ts       # Pizza recipe
    ├── objects/
    │   └── Capybara.ts         # Capybara character (animation, emotion)
    ├── steps/
    │   ├── StepFactory.ts      # Creates step instances from config
    │   ├── BaseStep.ts         # Abstract step with lifecycle
    │   ├── TapStep.ts          # Tap to interact
    │   ├── DragStep.ts         # Drag ingredient/tool
    │   ├── HoldStep.ts         # Hold and wait
    │   ├── StirStep.ts         # Circular drag to stir
    │   ├── PourStep.ts         # Tilt/pour interaction
    │   ├── SprinkleStep.ts     # Tap multiple times to sprinkle
    │   ├── WaitStep.ts         # Watch something happen
    │   ├── SauceStep.ts        # Pizza sauce selection + application
    │   └── ToppingStep.ts      # Pizza topping sprinkling
    ├── ui/
    │   ├── Button.ts           # Large touch-friendly button
    │   └── ProgressBar.ts      # Recipe progress indicator
    ├── managers/
    │   ├── SaveManager.ts      # localStorage read/write
    │   └── AudioManager.ts     # BGM + SFX with SynthSounds fallback
    ├── systems/
    │   ├── AnimationSystem.ts  # Tween + particle helpers
    │   ├── FeedbackSystem.ts   # Juice: bounce, sparkle, sound, emotion
    │   └── StepSequencer.ts    # Advances through recipe steps
    ├── data/
    │   └── recipes/
    │       └── pizza.json        # Pizza recipe data (4 steps)
    ├── utils/
    │   └── MathUtils.ts        # Lerp, clamp, random range, normalizeAngle
    └── types/
        ├── recipe.d.ts         # Recipe JSON type definitions
        └── events.ts           # Event name constants
```

---

## Scene Registry

| Scene | Class | Responsibility |
|-------|-------|---------------|
| Boot | `BootScene` | Generate particle textures, boot to Title |
| Title | `TitleScene` | Logo, play button, floating food, capybara idle |
| Pizza | `PizzaScene` | Pizza recipe — sauce, toppings, baking, delivery |

Each recipe scene extends `BaseRecipeScene` which handles:
- Step sequencing
- Progress tracking
- Celebration on completion
- Navigation back to title

---

## Step System Design

Steps are the core building blocks of every recipe. Each step is a small, self-contained unit.

### Step Lifecycle

```
enter()  → Initialize visuals, set up input
update() → Frame-by-frame logic (if needed)
complete() → Trigger success feedback, advance
exit()  → Clean up input, fade out
```

### Built-in Step Types

| Type | Interaction | Description |
|------|-------------|-------------|
| `SauceStep` | Select bottle + tap dough | Pick a sauce (ketchup/mayo/hotsauce), tap to apply |
| `ToppingStep` | Select topping + tap pizza | Pick a topping, tap to place on pizza |
| `TapStep` | Single tap | Tap an ingredient or tool |
| `DragStep` | Touch drag | Drag item from A to B |
| `HoldStep` | Touch & hold | Hold for X seconds |
| `StirStep` | Circular drag | Stir in a circle |
| `PourStep` | Tilt/tap | Pour from container |
| `SprinkleStep` | Multi-tap | Tap repeatedly to sprinkle |
| `WaitStep` | Passive | Watch oven/machine work |

---

## Recipe Data Schema

```json
{
  "id": "pizza",
  "name": "Pizza",
  "icon": "pizza-icon",
  "background": "kitchen-day",
  "steps": [
    { "type": "sauce", ... },
    { "type": "topping", ... },
    { "type": "wait", ... },
    { "type": "tap", ... }
  ],
  "celebration": {
    "emotion": "excited",
    "particles": "confetti",
    "stars": 3
  }
}
```

---

## Animation & Juice Guidelines

### Required Feedback on Every Action

| Feedback Type | Implementation |
|---------------|----------------|
| Visual | Squash & stretch on tap |
| Motion | Bounce tween on success |
| Particle | Sparkles, flour puff, steam, confetti |
| Audio | Satisfying SFX (pop, ding, i-like-ketchup) |
| Character | Capybara emotion change (happy, drool, spicy) |

### Animation Principles

- **Squash & Stretch** — Everything that gets tapped squashes slightly
- **Anticipation** — Items wiggle before being dragged
- **Follow-through** — Particles trail behind moving objects
- **Idle animation** — Capybara breathes, blinks, looks around
- **Celebrate** — Stars burst, confetti, capybara dances on recipe complete

### Tween Easing

- `Back.easeOut` — Bouncy pop-in
- `Sine.easeInOut` — Gentle floating
- `Bounce.easeOut` — Celebration landing
- `Quad.easeIn` — Pour/fall actions

---

## Audio Plan

### BGM Categories

| Track | Usage |
|-------|-------|
| Title Theme | Title screen |
| Kitchen Calm | Most recipe steps |
| Kitchen Upbeat | Celebration |

### SFX Categories

| Category | Examples |
|----------|----------|
| UI | Button tap, star appear |
| Cooking | Sizzle, chop, stir, pour |
| Food | Plop, sprinkle, bubble |
| Feedback | Pop, ding, sparkle |
| Voice | i-like-ketchup, yummy-yummy, yay-ketchup |

---

## Save Data Schema

```json
{
  "version": 1,
  "coins": 0,
  "settings": {
    "muted": false,
    "bgmVolume": 0.4,
    "sfxVolume": 0.7
  },
  "recipes": {
    "pizza": {
      "unlocked": true,
      "completed": false,
      "stars": 0,
      "timesCooked": 0
    }
  }
}
```

---

## Performance Budget

| Metric | Target |
|--------|--------|
| FPS | 60 on iPad / Android tablet |
| Initial Load | < 3 seconds on 4G |
| Memory | < 200MB active |
| Texture Atlas | < 10MB total |
| Audio | < 5MB total |
| Draw Calls | < 50 per scene |

---

## Development Phases

### Phase 0: Project Scaffold

- [x] Initialize Vite + TypeScript project
- [x] Install and configure Phaser 3
- [x] Create `GameConfig.ts` with responsive sizing
- [x] Create `main.ts` entry point
- [x] Set up folder structure
- [x] Configure path aliases in `tsconfig.json` and `vite.config.ts`
- [x] Add ESLint + Prettier
- [x] Verify it runs with `npm run dev`

### Phase 1: Core Engine

- [x] `BootScene`, `SaveManager`, `AudioManager`
- [x] `AnimationSystem`, `FeedbackSystem`
- [x] `StepSequencer`, `StepFactory`
- [x] `BaseStep` — abstract with enter/update/complete/exit
- [x] All step types (Tap, Drag, Hold, Stir, Pour, Sprinkle, Wait)
- [x] `BaseRecipeScene` — template for recipe scenes
- [x] `Button`, `ProgressBar`, `Capybara`

### Phase 2: Pizza Recipe

- [x] `pizza.json` — recipe data file
- [x] `PizzaScene` — custom layout with cutting board + capybara cheer
- [x] `SauceStep` — 3 bottles (ketchup/mayo/hotsauce), selection + tap-to-apply
- [x] `ToppingStep` — 6 toppings, selection + tap-to-place
- [x] Ketchup voice sounds (i-like-ketchup, yummy-yummy, yay-ketchup)
- [x] End-of-recipe celebration

### Phase 3: Title Screen → Pizza direct

- [x] Play button on TitleScene goes directly to PizzaScene

### Phase 4: Code Cleanup

- [x] Removed unused step types (KetchupStep) and scenes (RecipeSelectScene, BurgerScene, CakeScene, TacoScene)
- [x] Removed unused recipe JSON files and background/food graphics methods

### Phase 5: Polish & Juice

- [x] Capybara emotion system (happy, drool, spicy)
- [x] Particle effects for all step types
- [x] Celebration sequence (confetti, stars, bounce)
- [x] BGM tracks (placeholder — needs real audio files)
- [x] SFX for every interaction
- [x] Mute button on all scenes
- [x] Step transition feedback (cheer text + particles)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-07-20 | Initial scaffold, core engine, pizza recipe | — |
| 2026-07-20 | Procedural asset system, polish, production build | — |
| 2026-07-21 | SauceStep + ToppingStep implemented | — |
| 2026-07-21 | Removed burger/cake/taco recipes, streamlined to pizza-only | — |
| 2026-07-21 | Added ketchup voice sounds, cleanup dead code | — |

---

## Commit Message Convention

```
<type>(<scope>): <description>

type:   feat | fix | refactor | style | docs | test | chore
scope:  scene | step | ui | audio | save | config | assets | tooling
```
