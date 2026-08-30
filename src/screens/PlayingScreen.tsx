import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
import { useTiltControl } from '../lib/motion';
import { playBuzzer, playCorrect, playCountdownTick, playGo, playWarning, playWhoosh } from '../lib/sound';
import { formatTime } from '../lib/util';
import { InGameMenu } from '../components/InGameMenu';
import { OrientationGate, useWrongOrientation } from '../components/OrientationGate';
import { CheckIcon, ArrowIcon } from '../components/icons';

type Phase = 'countdown' | 'resuming' | 'active';

export function PlayingScreen() {
  useOrientationLock('landscape');
  const { state, answer, endTurn, setTimeLeft: persistTimeLeft } = useGame();
  const game = state.game;
  const soundOn = state.settings.soundEnabled;

  // A turn picked back up mid-round gets a blank beat, not a fresh 3-2-1: the
  // clock is already partway down, so counting in again reads as a restart.
  // Nothing starts ticking until the phone is actually held in landscape.
  const wrongWayUp = useWrongOrientation('landscape');
  const resumed = !!game && game.timeLeft !== null && game.timeLeft < game.config.roundSeconds;
  const [phase, setPhase] = useState<Phase>(resumed ? 'resuming' : 'countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(game?.timeLeft ?? game?.config.roundSeconds ?? 60);
  const endedRef = useRef(false);
  // Tilt stays disarmed until the phone rests level for a second; say so, or the
  // dead first moment just looks broken.
  const [tiltArmed, setTiltArmed] = useState(false);

  // Mirror the clock into game state each tick so leaving the screen (Settings,
  // Home) and coming back resumes the same round instead of restarting it.
  useEffect(() => {
    if (phase === 'active') persistTimeLeft(timeLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== 'resuming' || wrongWayUp) return;
    const t = setTimeout(() => setPhase('active'), 1000);
    return () => clearTimeout(t);
  }, [phase, wrongWayUp]);

  useEffect(() => {
    if (phase !== 'countdown' || wrongWayUp) return;
    if (countdown <= 0) {
      if (soundOn) playGo();
      setPhase('active');
      return;
    }
    if (soundOn) playCountdownTick();
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, countdown, soundOn, wrongWayUp]);

  useEffect(() => {
    if (phase !== 'active' || wrongWayUp) return;
    if (timeLeft <= 0) {
      if (!endedRef.current) {
        endedRef.current = true;
        if (soundOn) playBuzzer();
        endTurn();
      }
      return;
    }
    if (timeLeft <= 3 && soundOn) playWarning();
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft, soundOn, wrongWayUp]);

  const handleCorrect = () => {
    if (phase !== 'active') return;
    if (soundOn) playCorrect();
    answer('correct');
  };
  const handleSkip = () => {
    if (phase !== 'active') return;
    if (soundOn) playWhoosh(0.22);
    answer('skip');
  };

  // Read live from settings, not just from what the turn started with: toggling
  // on-screen buttons from the in-game menu takes effect the moment you return.
  const usingButtons = state.settings.preferButtons || game?.inputMode === 'buttons';
  const tiltActive = !!game && phase === 'active' && !usingButtons && !wrongWayUp;
  useTiltControl(
    tiltActive,
    handleCorrect,
    handleSkip,
    state.settings.tiltUpThreshold,
    state.settings.tiltDownThreshold,
    state.settings.tiltNeutral,
    () => setTiltArmed(true),
  );

  useEffect(() => {
    if (!tiltActive) setTiltArmed(false);
  }, [tiltActive]);

  if (!game || !game.currentTurn) return null;

  return (
    <div className="screen playing-screen">
      <OrientationGate need="landscape" />
      <div className="playing-top">
        <span className="correct-count">{game.currentTurn.correct.length}</span>
        <span className={`timer-ring ${timeLeft <= 3 ? 'low' : timeLeft <= 5 ? 'warn' : ''}`}>
          {/* Always the time actually left: showing the full round during the
              count-in made a resumed turn look like it had reset. */}
          {formatTime(timeLeft)}
        </span>
        <InGameMenu />
      </div>

      <div className="playing-body">
        <div className="center-col word-area">
          {phase === 'countdown' && (
            <div className="word-display">{countdown > 0 ? countdown : 'GO!'}</div>
          )}
          {phase === 'resuming' && <div className="word-display">&nbsp;</div>}
          {phase === 'active' && <div className="word-display">{game.currentWord ?? ''}</div>}
          {tiltActive && !tiltArmed && <p className="settle-hint">Hold steady…</p>}
        </div>

        {phase === 'active' && usingButtons && (
          <div className="answer-bar">
            <button className="btn btn-skip answer-btn" onClick={handleSkip} data-no-boop>
              <ArrowIcon size={22} /> Skip
            </button>
            <button className="btn btn-correct answer-btn" onClick={handleCorrect} data-no-boop>
              <CheckIcon size={22} /> Correct
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
