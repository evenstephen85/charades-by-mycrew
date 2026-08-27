import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
import { detectTiltSupport, requestMotionPermission } from '../lib/motion';
import { unlockAudio } from '../lib/sound';
import { InGameMenu } from '../components/InGameMenu';
import { LandscapeGate } from '../components/LandscapeGate';
import { CheckIcon, ArrowIcon } from '../components/icons';

export function GetReadyScreen() {
  useOrientationLock('landscape');
  const { state, beginTurn, setInputMode } = useGame();
  const game = state.game;
  const [preparing, setPreparing] = useState(false);
  if (!game) return null;

  const team = state.teams.find((t) => t.id === game.turnOrder[game.turnIndex]);

  async function handleReady() {
    setPreparing(true);
    unlockAudio();
    const granted = await requestMotionPermission();
    const supported = granted && (await detectTiltSupport());
    setInputMode(supported ? 'tilt' : 'buttons');
    beginTurn();
  }

  return (
    <div className="screen get-ready-screen">
      <LandscapeGate />
      <div className="top-bar">
        <h2>{team?.name}'s Turn</h2>
        <InGameMenu />
      </div>

      <div className="center-col">
        <div className="card stack instruction-card">
          <p className="subtitle">Give the phone to your guesser.</p>
          <div className="instruction-row">
            <span>Tilt up = Correct</span> <CheckIcon size={22} />
          </div>
          <div className="instruction-row">
            <span>Tilt down = Skip</span> <ArrowIcon size={22} />
          </div>
          <p className="subtitle">Press ready and hold to forehead. They'll act, you guess.</p>
        </div>
      </div>

      <button className="btn btn-primary btn-block btn-lg" onClick={handleReady} disabled={preparing}>
        {preparing ? 'Getting ready…' : "I'm Ready!"}
      </button>
    </div>
  );
}
