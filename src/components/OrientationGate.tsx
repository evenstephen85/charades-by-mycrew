import { useEffect, useState } from 'react';
import { RotateIcon } from './icons';

/**
 * Blocks a screen that only works in one orientation until the phone is turned.
 *
 * Native builds lock orientation outright via Capacitor, but the web can't --
 * iOS Safari ignores a JS lock request entirely. Without this, game setup in a
 * sideways phone has more content than fits and it overlaps the Start button.
 *
 * The media queries deliberately only match phone-sized viewports: a desktop
 * window is never asked to rotate, it just renders the layout as-is.
 */
const QUERY = {
  portrait: '(orientation: landscape) and (max-height: 560px)',
  landscape: '(orientation: portrait) and (max-width: 560px)',
} as const;

interface OrientationGateProps {
  need: 'portrait' | 'landscape';
}

export function OrientationGate({ need }: OrientationGateProps) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY[need]);
    const update = () => setBlocked(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [need]);

  if (!blocked) return null;

  return (
    <div className="rotate-gate">
      <RotateIcon size={48} />
      <h2>Turn your phone</h2>
      <p className="subtitle">
        This screen is {need} only. Rotate your phone to keep going.
      </p>
    </div>
  );
}
