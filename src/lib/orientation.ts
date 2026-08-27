import { useEffect } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';

export type LockOrientation = 'portrait' | 'landscape';

/**
 * Locks the screen to the given orientation while the calling screen is
 * mounted. Works natively on iOS/Android via Capacitor, and falls back to
 * the browser's Screen Orientation API on the web (which silently does
 * nothing where unsupported, e.g. iOS Safari, or outside fullscreen).
 */
export function useOrientationLock(orientation: LockOrientation) {
  useEffect(() => {
    const type = orientation === 'portrait' ? 'portrait-primary' : 'landscape-primary';
    ScreenOrientation.lock({ orientation: type }).catch(() => {
      // unsupported on this platform/browser — CSS layout is the fallback
    });
    return () => {
      ScreenOrientation.unlock().catch(() => {});
    };
  }, [orientation]);
}

/** Best-effort request for a fullscreen, chrome-free viewport. Must follow a user gesture. */
export function requestFullscreen() {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };
  if (document.fullscreenElement) return;
  const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
  if (request) {
    try {
      const result = request.call(el);
      if (result && typeof (result as Promise<void>).catch === 'function') {
        (result as Promise<void>).catch(() => {});
      }
    } catch {
      // ignore — not all browsers allow this
    }
  }
}
