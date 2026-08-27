import { useEffect, useRef } from 'react';

type OrientationPermissionApi = {
  requestPermission: () => Promise<'granted' | 'denied'>;
};

function getPermissionApi(): OrientationPermissionApi | null {
  const DOE = window.DeviceOrientationEvent as unknown as Partial<OrientationPermissionApi> | undefined;
  if (DOE && typeof DOE.requestPermission === 'function') {
    return DOE as OrientationPermissionApi;
  }
  return null;
}

/** Call from a user-gesture handler. Returns true if orientation events should be usable. */
export async function requestMotionPermission(): Promise<boolean> {
  const api = getPermissionApi();
  if (!api) return true; // no permission gate on this platform (e.g. Android, desktop)
  try {
    const result = await api.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

/** Listens briefly for a real orientation reading to decide tilt vs. button controls. */
export function detectTiltSupport(timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      resolve(false);
      return;
    }
    let settled = false;
    const finish = (supported: boolean) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('deviceorientation', handler);
      clearTimeout(timer);
      resolve(supported);
    };
    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.beta !== undefined) finish(true);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    window.addEventListener('deviceorientation', handler);
  });
}

const TILT_THRESHOLD = 28;
const RESET_ZONE = 12;

/**
 * Fires onCorrect/onSkip when the phone tilts away from its calibrated
 * starting angle (held to the forehead) past a threshold, with hysteresis
 * so a single tilt doesn't fire repeatedly.
 */
export function useTiltControl(active: boolean, onCorrect: () => void, onSkip: () => void) {
  const neutralBeta = useRef<number | null>(null);
  const triggered = useRef<'none' | 'correct' | 'skip'>('none');
  const onCorrectRef = useRef(onCorrect);
  const onSkipRef = useRef(onSkip);
  onCorrectRef.current = onCorrect;
  onSkipRef.current = onSkip;

  useEffect(() => {
    if (!active) {
      neutralBeta.current = null;
      triggered.current = 'none';
      return;
    }

    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.beta === undefined) return;
      if (neutralBeta.current === null) {
        neutralBeta.current = e.beta;
        return;
      }
      const delta = e.beta - neutralBeta.current;

      if (triggered.current === 'none') {
        if (delta <= -TILT_THRESHOLD) {
          triggered.current = 'correct';
          onCorrectRef.current();
        } else if (delta >= TILT_THRESHOLD) {
          triggered.current = 'skip';
          onSkipRef.current();
        }
      } else if (Math.abs(delta) <= RESET_ZONE) {
        triggered.current = 'none';
      }
    };

    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [active]);
}
