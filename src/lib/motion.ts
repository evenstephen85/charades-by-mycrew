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

export function getOrientationAngle(): number {
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
 *
 * Sign convention: POSITIVE means the top of the phone has tilted up, as
 * the player experiences it with the screen facing away from their
 * forehead. The raw axes run the other way round, so every branch is
 * negated -- without this, tilting up scored a skip and tilting down
 * scored a correct, the opposite of the on-screen instructions. Both the
 * tilt control and the calibration wizard read pitch through here, so
 * they stay consistent with each other.
 */
export function screenRelativePitch(beta: number, gamma: number, angle: number): number {
  switch (angle) {
    case 90:
      return gamma;
    case -90:
    case 270:
      return -gamma;
    case 180:
      return beta;
    default:
      return -beta;
  }
}

/**
 * gamma (and therefore screen-relative pitch derived from it) is only
 * defined over a 180-degree span. A phone resting near that edge (e.g.
 * held to the forehead at close to +/-90) can have a tilt in one
 * direction read as a jump to the opposite sign instead of a smooth
 * change. Treating the domain as circular with a 180-degree period
 * un-does that jump so a delta from a calibrated neutral stays smooth
 * no matter where the neutral position falls in the range.
 */
export function wrappedPitchDelta(current: number, neutral: number): number {
  let d = current - neutral;
  if (d > 90) d -= 180;
  if (d < -90) d += 180;
  return d;
}

export const DEFAULT_TILT_UP_THRESHOLD = 15;
export const DEFAULT_TILT_DOWN_THRESHOLD = 28;

const DEBOUNCE_MS = 140;
const RESET_RATIO = 0.4;

/**
 * Fires onCorrect/onSkip when the phone tilts away from its calibrated
 * starting angle (held to the forehead) past the up/down thresholds, with
 * hysteresis and a short debounce so sensor noise and a single quick
 * flick don't fire it by accident. Tilting the top of the phone up
 * fires onCorrect; tilting it down fires onSkip.
 */
export function useTiltControl(
  active: boolean,
  onCorrect: () => void,
  onSkip: () => void,
  upThreshold = DEFAULT_TILT_UP_THRESHOLD,
  downThreshold = DEFAULT_TILT_DOWN_THRESHOLD,
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

    const resetZone = Math.min(upThreshold, downThreshold) * RESET_RATIO;

    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.beta === undefined || e.gamma === null || e.gamma === undefined) return;
      const angle = getOrientationAngle();
      const pitch = screenRelativePitch(e.beta, e.gamma, angle);

      if (neutral.current === null) {
        neutral.current = pitch;
        return;
      }
      const delta = wrappedPitchDelta(pitch, neutral.current);
      const now = performance.now();

      if (triggered.current === 'none') {
        const direction: 'correct' | 'skip' | null =
          delta >= upThreshold ? 'correct' : delta <= -downThreshold ? 'skip' : null;

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
  }, [active, upThreshold, downThreshold]);
}

/** Samples pitch briefly and averages it — used to capture a calibration neutral. */
export function captureNeutralPitch(durationMs = 500): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      resolve(null);
      return;
    }
    const samples: number[] = [];
    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.beta === undefined || e.gamma === null || e.gamma === undefined) return;
      samples.push(screenRelativePitch(e.beta, e.gamma, getOrientationAngle()));
    };
    window.addEventListener('deviceorientation', handler);
    setTimeout(() => {
      window.removeEventListener('deviceorientation', handler);
      resolve(samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : null);
    }, durationMs);
  });
}

const REP_START_DEG = 8;
const REP_END_DEG = 4;

/**
 * Counts calibration reps in one direction from a captured neutral: a rep
 * is a tilt past REP_START_DEG that returns back under REP_END_DEG, and
 * reports the peak delta reached during that rep.
 */
export function useCalibrationReps(
  active: boolean,
  direction: 'up' | 'down',
  neutral: number | null,
  onRep: (peakDelta: number) => void,
) {
  const peak = useRef(0);
  const over = useRef(false);
  const onRepRef = useRef(onRep);
  onRepRef.current = onRep;

  useEffect(() => {
    peak.current = 0;
    over.current = false;
    if (!active || neutral === null) return;

    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.beta === undefined || e.gamma === null || e.gamma === undefined) return;
      const pitch = screenRelativePitch(e.beta, e.gamma, getOrientationAngle());
      const delta = wrappedPitchDelta(pitch, neutral);
      const raw = direction === 'up' ? delta : -delta;

      if (raw >= REP_START_DEG) {
        over.current = true;
        if (raw > peak.current) peak.current = raw;
      } else if (over.current && raw <= REP_END_DEG) {
        onRepRef.current(peak.current);
        peak.current = 0;
        over.current = false;
      }
    };

    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [active, direction, neutral]);
}
