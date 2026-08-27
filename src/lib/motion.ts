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

function getOrientationAngle(): number {
  if (typeof window === 'undefined') return 0;
  const so = window.screen?.orientation;
  if (so && typeof so.angle === 'number') return so.angle;
  const legacy = (window as unknown as { orientation?: number }).orientation;
  return typeof legacy === 'number' ? legacy : 0;
}

/**
 * DeviceOrientationEvent's beta/gamma are defined relative to the device's
 * native (usually portrait) orientation, not the current screen orientation.
 * When the screen is rotated into landscape, the axis that corresponds to
 * "tilt the top of the phone up/down" swaps from beta to gamma. This
 * remaps the raw reading into a single screen-relative pitch value.
 */
function screenRelativePitch(beta: number, gamma: number, angle: number): number {
  switch (angle) {
    case 90:
      return -gamma;
    case -90:
    case 270:
      return gamma;
    case 180:
      return -beta;
    default:
      return beta;
  }
}

const DEBOUNCE_MS = 140;
const RESET_RATIO = 0.4;

/**
 * Fires onCorrect/onSkip when the phone tilts away from its calibrated
 * starting angle (held to the forehead) past thresholdDegrees, with
 * hysteresis and a short debounce so sensor noise and a single quick
 * flick don't fire it by accident. Tilting the top of the phone up
 * fires onCorrect; tilting it down fires onSkip.
 */
export function useTiltControl(
  active: boolean,
  onCorrect: () => void,
  onSkip: () => void,
  thresholdDegrees = 35,
) {
  const neutral = useRef<number | null>(null);
  const triggered = useRef<'none' | 'correct' | 'skip'>('none');
  const overSince = useRef<{ direction: 'correct' | 'skip'; at: number } | null>(null);
  const onCorrectRef = useRef(onCorrect);
  const onSkipRef = useRef(onSkip);
  onCorrectRef.current = onCorrect;
  onSkipRef.current = onSkip;

  useEffect(() => {
    if (!active) {
      neutral.current = null;
      triggered.current = 'none';
      overSince.current = null;
      return;
    }

    const resetZone = thresholdDegrees * RESET_RATIO;

    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.beta === undefined || e.gamma === null || e.gamma === undefined) return;
      const angle = getOrientationAngle();
      const pitch = screenRelativePitch(e.beta, e.gamma, angle);

      if (neutral.current === null) {
        neutral.current = pitch;
        return;
      }
      const delta = pitch - neutral.current;
      const now = performance.now();

      if (triggered.current === 'none') {
        const direction: 'correct' | 'skip' | null =
          delta >= thresholdDegrees ? 'correct' : delta <= -thresholdDegrees ? 'skip' : null;

        if (!direction) {
          overSince.current = null;
          return;
        }

        if (!overSince.current || overSince.current.direction !== direction) {
          overSince.current = { direction, at: now };
          return;
        }

        if (now - overSince.current.at >= DEBOUNCE_MS) {
          triggered.current = direction;
          overSince.current = null;
          if (direction === 'correct') onCorrectRef.current();
          else onSkipRef.current();
        }
      } else if (Math.abs(delta) <= resetZone) {
        triggered.current = 'none';
      }
    };

    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [active, thresholdDegrees]);
}
