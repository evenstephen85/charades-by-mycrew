import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { useTiltControl } from '../lib/motion';
import { playBuzzer, playCountdownTick, playGo, playWarning } from '../lib/sound';
import { formatTime } from '../lib/util';

type Phase = 'countdown' | 'active';

export function PlayingScreen() {
  const { state, answer, endTurn } = useGame();
  const game = state.game;
  const soundOn = state.settings.soundEnabled;

  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(game?.config.roundSeconds ?? 60);
  const endedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      if (soundOn) playGo();
      setPhase('active');
      return;
    }
    if (soundOn) playCountdownTick();
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, countdown, soundOn]);

  useEffect(() => {
    if (phase !== 'active') return;
    if (timeLeft <= 0) {
      if (!endedRef.current) {
        endedRef.current = true;
        if (soundOn) playBuzzer();
        endTurn();
      }
      return;
    }
    if (timeLeft <= 5 && soundOn) playWarning();
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft, soundOn]);

  const handleCorrect = () => {
    if (phase !== 'active') return;
    answer('correct');
  };
  const handleSkip = () => {
    if (phase !== 'active') return;
    answer('skip');
  };

  useTiltControl(
    !!game && phase === 'active' && game.inputMode === 'tilt',
    handleCorrect,
    handleSkip,
  );

  if (!game || !game.currentTurn) return null;

  return (
    <div className="screen">
      <div className="top-bar">
        <span className={`timer-ring ${timeLeft <= 5 ? 'low' : ''}`}>
          {phase === 'active' ? formatTime(timeLeft) : formatTime(game.config.roundSeconds)}
        </span>
        <span className="subtitle">✅ {game.currentTurn.correct.length} · ⏭️ {game.currentTurn.skipped.length}</span>
      </div>

      <div className="playing-body">
        {phase === 'active' && game.inputMode === 'buttons' && (
          <button className="btn btn-skip side-btn" onClick={handleSkip}>⏭️ Skip</button>
        )}

        <div className="center-col word-area">
          {phase === 'countdown' ? (
            <div className="word-display">{countdown > 0 ? countdown : 'GO!'}</div>
          ) : (
            <div className="word-display">{game.currentWord ?? '🎉'}</div>
          )}
        </div>

        {phase === 'active' && game.inputMode === 'buttons' && (
          <button className="btn btn-correct side-btn" onClick={handleCorrect}>✅ Correct</button>
        )}
      </div>

      {phase === 'active' && game.inputMode === 'tilt' && (
        <p className="tilt-hint" style={{ textAlign: 'center' }}>
          Tilt down = correct · Tilt up = skip
        </p>
      )}
    </div>
  );
}
