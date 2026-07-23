# Capybara Cooking

A browser-based cooking game for children (ages 4-6) built with Phaser 3 and TypeScript.

## Features

- 4-step pizza recipe: sauce, toppings, bake, eat
- Speech synthesis for step guidance and reactions
- Touch-first, tablet-optimized (1024×768 landscape)
- Progressive difficulty with fun capybara reactions
- BGM mood changes during gameplay
- Installable as PWA on iPad/Android tablets

## Tech Stack

- Phaser 3 (game framework)
- TypeScript
- Vite (bundler)
- Workbox (PWA offline caching)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Push to `main` branch triggers automatic GitHub Pages deployment via GitHub Actions.

**Live site:** https://yalaboy.github.io/capybara-cooking/

## Android Deployment

This is a PWA — Android users can install it directly from the browser:

1. Open the live site in Chrome
2. Tap the "Add to Home Screen" prompt, or go to Chrome menu → "Install app"

### Native APK Options

| Approach | Effort | Notes |
|----------|--------|-------|
| **PWA (current)** | Done | Installable from browser, no Play Store |
| **Bubblewrap/TWA** | Low | Wraps PWA in Android shell, produces APK |
| **Capacitor** | Medium | Adds native Android project, Play Store ready |
| **Kotlin/Flutter rewrite** | High | Full native, best performance |

**Recommendation:** Bubblewrap is the fastest path — it wraps your existing PWA into an APK with minimal changes.
