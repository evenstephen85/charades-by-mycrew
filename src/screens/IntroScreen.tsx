import { useEffect, useState } from 'react';
import { playWhoosh } from '../lib/sound';

interface IntroScreenProps {
  soundEnabled: boolean;
  onFinish: () => void;
}

export function IntroScreen({ soundEnabled, onFinish }: IntroScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    if (soundEnabled) playWhoosh(0.28);
    const holdTimer = setTimeout(() => setPhase('hold'), 450);
    const outTimer = setTimeout(() => {
      setPhase('out');
      if (soundEnabled) playWhoosh(0.32);
    }, 2150);
    const finishTimer = setTimeout(onFinish, 2700);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`intro-screen intro-${phase}`}>
      <div className="intro-title">CHARADES</div>
      <div className="intro-subtitle">by MyCrew Gaming</div>
    </div>
  );
}
