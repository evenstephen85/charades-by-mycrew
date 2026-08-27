# Charades — by MyCrew 🙋🤸

It's actually the *opposite* of charades: one player holds the phone up to
their forehead so everyone else can see the word — they act it out while the
phone-holder guesses. Tilt the phone down for correct, up to skip. Built
with React + TypeScript + Vite, wrapped for iOS/Android with
[Capacitor](https://capacitorjs.com/). Designed to be played in **landscape**.

## Features

- Welcome screen with quick access to setup, settings, and word review
- Themed word packs (animals, foods, movies, sports, jobs, and more) or "All Packs / Random"
- 2–8 teams/players, with names remembered across sessions (or use defaults)
- Persistent scores across games, with separate "clear scores" / "clear teams" resets
- Configurable round length and number of rounds
- Countdown, warning, and buzzer sounds — all synthesized in-browser (no audio files), toggleable
- Automatic tilt controls on phones (using the device orientation sensor), with on-screen
  Correct/Skip buttons as a fallback on desktop browsers or devices without a sensor
- Landscape-locked on native iOS/Android; the website nudges players to rotate on portrait phones
- Settings for sound, background/accent color, and a "Quick Start" shortcut
- End-of-turn summary of correct/skipped words; scores are hidden during the final round to
  build suspense
- Drumroll + fanfare winner announcement at the end of the game
- A "Review Words" screen to inspect and disable any word that isn't a fit for your group

## Project layout

```
src/
  data/packs.ts          word pack content
  lib/                   sound engine, tilt detection, storage, utilities
  state/GameContext.tsx  app state (reducer + context)
  screens/               one component per screen
  components/            small shared UI pieces
android/, ios/           native Capacitor platform projects
resources/, design/      source icon/splash artwork
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
need to run `cap add` again unless you delete them. Both are locked to
**landscape orientation** (Android via `screenOrientation` in
`AndroidManifest.xml`, iOS via `UISupportedInterfaceOrientations` in
`Info.plist`).

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

Word packs live in `src/data/packs.ts`, in plain text — no images. They were
written with a 4–12 age range in mind, but you can review, add, or remove
words any time from the in-app **Review Words** screen (accessible from the
welcome screen); disabled words are stored locally in the browser/app and
skipped during play without editing the source file. To permanently add or
remove words, edit `src/data/packs.ts` directly.

## Sounds

All sound effects (countdown ticks, "go", warning, buzzer, drumroll,
fanfare, correct/skip blips) are synthesized at runtime with the Web Audio
API in `src/lib/sound.ts` — there are no audio files to manage, and they
respect the in-app sound on/off setting.
