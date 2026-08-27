import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

/** Hides the native status bar so the app uses the full device screen. Native platforms only. */
export function hideNativeStatusBar() {
  if (!Capacitor.isNativePlatform()) return;
  StatusBar.hide().catch(() => {});
}
