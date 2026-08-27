import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
import { useTiltControl } from '../lib/motion';
import { playBuzzer, playCorrect, playCountdownTick, playGo, playWarning, playWhoosh } from '../lib/sound';
import { formatTime } from '../lib/util';
import { InGameMenu } from '../components/InGameMenu';
import { CheckIcon, ArrowIcon } from '../components/icons';

type Phase = 'countdown' | 'active';

export function PlayingScreen() {
  useOrientationLock('landscape');
  const { state, answer, endTurn } = useGame();
  const game = state.game;
  const soundOn = state.settings.soundEnabled;

  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(game?.config.roundSeconds ?? 60);
  const [paused, setPaused] = useState(false);
  const endedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'countdown' || paused) return;
    if (countdown <= 0) {
      if (soundOn) playGo();
      setPhase('active');
      return;
    }
    if (soundOn) playCountdownTick();
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, countdown, soundOn, paused]);

  useEffect(() => {
    if (phase !== 'active' || paused) return;
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
  }, [phase, timeLeft, soundOn, paused]);

  const handleCorrect = () => {
    if (phase !== 'active' || paused) return;
    if (soundOn) playCorrect();
    answer('correct');
  };
  const handleSkip = () => {
    if (phase !== 'active' || paused) return;
    if (soundOn) playWhoosh(0.22);
    answer('skip');
  };

  useTiltControl(
    !!game && phase === 'active' && !paused && game.inputMode === 'tilt',
    handleCorrect,
    handleSkip,
    state.settings.tiltThreshold,
  );

  if (!game || !game.currentTurn) return null;

  return (
    <div className="screen playing-screen">
      <InGameMenu pause={{ paused, onToggle: () => setPaused((p) => !p) }} />

      <div className="playing-top">
        <span className="correct-count">{game.currentTurn.correct.length}</span>
        <span className={`timer-ring ${timeLeft <= 5 ? 'low' : ''}`}>
          {phase === 'active' ? formatTime(timeLeft) : formatTime(game.config.roundSeconds)}
        </span>
        <span aria-hidden="true" style={{ width: 40 }} />
      </div>

      <div className="playing-body">
        {phase === 'active' && game.inputMode === 'buttons' && (
          <button className="btn btn-skip side-btn" onClick={handleSkip}>
            <ArrowIcon size={28} /> Skip
          </button>
        )}

        <div className="center-col word-area">
          {phase === 'countdown' ? (
            <div className="word-display">{countdown > 0 ? countdown : 'GO!'}</div>
          ) : (
            <div className="word-display">{game.currentWord ?? ''}</div>
          )}
        </div>

        {phase === 'active' && game.inputMode === 'buttons' && (
          <button className="btn btn-correct side-btn" onClick={handleCorrect}>
            <CheckIcon size={28} /> Correct
          </button>
        )}
      </div>

      {paused && (
        <div className="modal-overlay">
          <div className="modal-card stack" style={{ textAlign: 'center' }}>
            <h2>Paused</h2>
            <button className="btn btn-primary btn-block" onClick={() => setPaused(false)}>
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
