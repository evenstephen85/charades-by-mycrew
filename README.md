# Charades — by MyCrew

It's actually the *opposite* of charades: one player holds the phone up to
their forehead so everyone else can see the word — they act it out while the
phone-holder guesses. Tilt up for correct, tilt down to skip. Built with
React + TypeScript + Vite, wrapped for iOS/Android with
[Capacitor](https://capacitorjs.com/).

## Features

- A brief, non-interactive splash animation on launch — no tap required
- Pack-select screen: tap a themed pack (or "All Packs / Random") to jump
  straight into team setup — no multi-select step
- Up to 6 teams, each with a name and a color from a 16-color palette;
  default names come from the palette (Red, Orange, Amber, …)
- Scores persist across sessions; delete teams one at a time from Settings
- Configurable round length (15s–120s, in 5s/15s steps) and rounds per team
- Countdown, warning, buzzer, cha-ching (correct), whoosh (skip), and
  ta-da (winner reveal) sounds — all synthesized in-browser, toggleable
- Automatic tilt controls on phones (device orientation sensor, orientation-
  aware so it works correctly in landscape), with on-screen Correct/Skip
  buttons as a fallback on desktop or devices without a sensor
- Adjustable tilt sensitivity in Settings
- Per-screen orientation: pack-select and team setup are portrait; gameplay
  screens (ready/playing/summary/results) are landscape; Settings works in
  either. Locked natively via Capacitor's Screen Orientation plugin
- Whichever team is up gets the whole screen reskinned in their color
  (ready page, acting, and the turn summary)
- In-game menu (pause, Settings, Home) on every gameplay screen, as a
  floating button in the top corner — gameplay screens carry no header
  bar, so the word and the reveal get the full height of the screen
- End-of-turn summary in a 3-column layout (correct / skipped / scores) so
  it fits without scrolling in landscape; scores are hidden on the final
  round to build suspense
- Full-screen winner reveal, then a grid of every team's final score
- Games auto-save continuously; relaunching mid-game (or tapping a pack
  while one is in progress) offers to resume or start fresh
- No emoji-based icons anywhere — small inline SVGs for check/skip/menu/delete

## Project layout

```
src/
  data/packs.ts          word pack content
  lib/                    sound engine, tilt detection, orientation locking,
                          color utilities, storage, misc utilities
  state/GameContext.tsx   app state (reducer + context), including the
                          auto-save/resume snapshot
  screens/                one component per screen
  components/             shared UI pieces (icons, in-game menu, resume prompt)
android/, ios/            native Capacitor platform projects
resources/, design/       source icon/splash artwork
```

## Local development

```bash
npm install
npm run dev
```

## Deploying the website (GitHub Pages)

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys
the site to GitHub Pages automatically on every push to `main`.

One-time setup: in the repo's **Settings → Pages**, set "Source" to
**GitHub Actions**. After that, pushing to `main` publishes the site at:

```
https://evenstephen85.github.io/charades-by-mycrew/
```

The production build uses that repo name as its base path
(`vite.config.ts`). If you ever rename the repo, update `repoBase` there
to match.

### Do I need a pull request to go live?

No. Pushing directly to `main` is enough — the Actions workflow deploys
automatically on every push to that branch. Pull requests are only useful if
you want a review step (e.g. someone else checks a change) before it merges
into `main`; they're not required to publish.

## Building the native iOS/Android apps

The same React app is wrapped into real native apps with Capacitor. The
`android/` and `ios/` folders are already set up and committed — you don't
need to run `cap add` again unless you delete them.

Native builds need a **root-relative** asset path (unlike the GitHub Pages
build, which lives under a subpath), so use the `:native` build script:

```bash
npm run build:native   # builds dist/ with root-relative paths
npx cap sync           # copies the web build into android/ and ios/
```

Both steps are combined in `npm run cap:sync`.

### Android

Requires [Android Studio](https://developer.android.com/studio) (with the
Android SDK).

```bash
npm run cap:android   # builds, syncs, and opens the project in Android Studio
```

From Android Studio, run the app on an emulator or a plugged-in phone, or
use **Build → Generate Signed App Bundle** when you're ready to publish to
the Play Store.

### iOS

Requires a Mac with Xcode and [CocoaPods](https://cocoapods.org/) installed.

```bash
npm run cap:ios   # builds, syncs, and opens the project in Xcode
```

The first time, run `npx cap sync ios` once to install CocoaPods
dependencies (Capacitor does this automatically as part of `cap sync`).
From Xcode, run on a simulator or a connected iPhone (you'll need an Apple
Developer account to run on a physical device or submit to the App Store).

### Before you publish

- **Bundle ID**: `capacitor.config.ts` currently uses `com.mycrew.charades`
  as the `appId`. Change it if you don't control that domain/account —
  it can't be changed after publishing to either store.
- **App icon / splash art**: `design/icon-source.svg` and `design/icon-foreground.svg`
  are the source artwork; `resources/icon.png` and `resources/splash.png` are
  rendered from them. The native icon/splash assets in `android/` and `ios/`
  are already generated from these. If you want to redesign them, edit the
  SVGs and re-render (or use a tool like
  [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets)).
- **Permissions**: iOS will prompt for motion & orientation access the first
  time a player taps "I'm Ready" (needed for tilt controls) — this is
  handled automatically in `src/lib/motion.ts`.

## Reviewing word content

Word packs live in `src/data/packs.ts`, in plain text — no images, no
in-app review screen. Edit that file directly to add, remove, or reword
entries.

## Sounds

All sound effects are synthesized at runtime with the Web Audio API in
`src/lib/sound.ts` — there are no audio files to manage, and they respect
the in-app sound on/off setting.
