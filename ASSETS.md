# Capybara Cooking — Asset Specification

> Target: iPad (1024×768 logical, retina 2048×1536 physical)
> Art style: Cute, pastel, rounded, soft shadows, flat vector

---

## 1. Capybara Character

### Sheet: `capybara`

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 4 | Subtle breathe, slight sway, slow blink |
| blink | 2 | Eyes close, reopen (can be idle frames) |
| happy | 2 | Eyes crescent, blush intensifies |
| focused | 2 | Slight lean forward, squint eyes |
| excited | 4 | Bounce up/down, big smile, sparkle eyes |
| surprised | 2 | Eyes widen, mouth O-shape |
| proud | 3 | Chest puffed, head high, closed smile |
| drool | 3 | Smile + 3 drool streams |
| spicy | 3 | Red face + sweat drops |

**Size:** ~200×200px per frame (at 1x, 400×400px at 2x)
**Format:** Spritesheet on transparent background, PNG
**Pivot:** Center-bottom

### Emotions — expression guide

| Emotion | Eyes | Mouth | Cheeks | Posture |
|---------|------|-------|--------|---------|
| idle | Normal open | Slight smile | Subtle pink | Relaxed |
| happy | Crescent ^ ^ | Big smile | Bright pink | Still |
| focused | Slightly squinted | Small "o" or line | Moderate | Lean forward |
| excited | Large with sparkle | Wide smile | Deep pink | Bouncing |
| surprised | Wide open circles | O shape | Normal | Lean back |
| proud | Normal | Smug smile | Moderate | Chest out |
| drool | Normal closed | Smile | Normal | Relaxed + drool |
| spicy | Squinted | Open | Bright red | Shaking |

---

## 2. Food & Ingredient Sprites (Pizza only)

| Item | Size (px) | Color Palette | Notes |
|------|-----------|---------------|-------|
| rolled_dough | 140×140 | #F5DEB3 | Flat circle |
| ketchup_bottle | 50×80 | #E53935 red + white label | with tomato icon |
| mayo_bottle | 50×80 | #FFF8E1 white | with egg icon |
| hotsauce_bottle | 50×80 | #B71C1C dark red | with pepper icon |
| olive | 30×30 | #2E2E2E | Black donut shape |
| pineapple | 40×50 | #FFD600 yellow | Trapezoid, longer left edge |
| pepperoni | 40×12 | #C62828 red | Flat circle |
| cheese_shreds | scattered | #FFE082 yellow | 36 shredded pieces on pizza |
| potato_fries | 18-28×6 | #D4A24C brown | Fries shape |
| broccoli | 35×40 | #4CAF50 green + light stem | Florets+stem |

---

## 3. Kitchen Backgrounds

| Background | Scene | Description | Key Colors |
|------------|-------|-------------|------------|
| kitchen_default | Title, Pizza | Warm cozy kitchen, counter, pastel tiles | #FCE4EC walls, #FFF3E0 counter |
| kitchen_pizza | PizzaScene | Same + flour dust on counter | Same + white flour dust |

---

## 4. UI Elements

| Element | Size (px) | States | Notes |
|---------|-----------|--------|-------|
| play_button | 200×70 | normal, hover, pressed | Rounded rect, #FF8A80 |
| mute_button | 50×50 | muted, unmuted | Circle |
| star_icon | 30×30 | empty, filled | 5-point star, #FFE082 |
| progress_bar | 300×16 | bg + fill | #E0E0E0 bg, #FF8A80 fill |

### Fonts

Bold system font, no custom fonts needed.

---

## 5. Particle Textures

Small textures (16×16px) for particle effects:

| Texture | Shape | Color | Usage |
|---------|-------|-------|-------|
| sparkle | 4-point star | #FFFFFF | Step success |
| confetti | Rectangle | Pastel mix | Celebration |
| flour_puff | Soft circle | #FFF9C4 | Dough |
| steam | Soft circle | #FFFFFF | Baking |

---

## 6. Audio Assets

### SFX Keys

| Sound | Duration | Description | Trigger |
|-------|----------|-------------|---------|
| pop | ~0.2s | Soft cork pop | Tap steps |
| plop | ~0.3s | Soft wet drop | Drag steps |
| stir | ~0.5s | Gentle stirring | StirStep |
| pour | ~0.6s | Liquid pouring | PourStep |
| sprinkle | ~0.3s | Light rain | SprinkleStep |
| bubble | ~0.4s | Bubble | WaitStep |
| ding | ~0.4s | Pleasant chime | Step complete |
| sizzle | ~0.5s | Sizzle | Grill/cook |
| fanfare | ~1.5s | Mini celebration | Recipe complete |
| coin | ~0.3s | Coin collect | Coin earned |
| button | ~0.15s | Soft click | Button press |
| i-like-ketchup | ~0.8s | Rising 3-note chime | Ketchup select/apply |
| yummy-yummy | ~0.9s | Alternating 2-note chime | Ketchup select/apply |
| yay-ketchup | ~0.7s | Ascending 3-note chime | Ketchup select/apply |
| splat | ~0.2s | Wet splat | Topping disliked |

### Audio Specs

- Format: AAC-LC (.m4a) for BGM, Ogg Vorbis + MP3 for SFX
- Sample rate: 44.1kHz
- Bit depth: 16-bit

---

## 7. Resolution & Export Guide

| Asset Type | 1x Size | 2x Size | Format |
|-----------|---------|---------|--------|
| Characters | 200×200 | 400×400 | PNG w/ alpha |
| Food items | ~120×120 | ~240×240 | PNG w/ alpha |
| UI elements | As specified | 2x of spec | PNG w/ alpha |
| Backgrounds | 1024×768 | 2048×1536 | JPG/PNG |
| Particles | ~16×16 | ~32×32 | PNG w/ alpha |
| Audio BGM | — | — | 44.1kHz 16b stereo .m4a |
| Audio SFX | — | — | 44.1kHz 16b mono .ogg+.mp3 |
