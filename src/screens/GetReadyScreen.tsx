import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { detectTiltSupport, requestMotionPermission } from '../lib/motion';
import { unlockAudio } from '../lib/sound';
import { InGameMenu } from '../components/InGameMenu';
import { useWrongOrientation } from '../components/OrientationGate';
import { CheckIcon, ArrowIcon } from '../components/icons';

export function GetReadyScreen() {
  const { state, beginTurn, setInputMode } = useGame();
  const game = state.game;
  const [preparing, setPreparing] = useState(false);
  // The round is landscape-only, so don't let it be started from portrait.
  const wrongWayUp = useWrongOrientation('landscape');
  if (!game) return null;

  const team = state.teams.find((t) => t.id === game.turnOrder[game.turnIndex]);
  const isFreeplay = game.config.teamIds.length === 1;
  const headerTitle = isFreeplay ? 'Freeplay!' : `${team?.name}'s Turn`;

  async function handleReady() {
    setPreparing(true);
    unlockAudio();
    // An explicit preference for buttons skips the sensor probe entirely.
    if (state.settings.preferButtons) {
      setInputMode('buttons');
      beginTurn();
      return;
    }
    const granted = await requestMotionPermission();
    const supported = granted && (await detectTiltSupport());
    setInputMode(supported ? 'tilt' : 'buttons');
    beginTurn();
  }

  return (
    <div className="screen get-ready-screen">
      <InGameMenu floating />

      <h2 className="screen-title">{headerTitle}</h2>

      <div className="center-col">
        <div className="card stack instruction-card">
          <p className="subtitle" style={{ textAlign: 'center' }}>Give the phone to your guesser.</p>
          <div className="tilt-instructions">
            <div className="tilt-instruction">
              <span>Tilt Up = Correct</span>
              <CheckIcon size={22} color="#3ddc84" />
            </div>
            <div className="tilt-instruction">
              <span>Tilt Down = Skip</span>
              <ArrowIcon size={22} />
            </div>
          </div>
          <p className="subtitle" style={{ textAlign: 'center' }}>
            Press ready and hold to forehead. They'll act, you guess.
          </p>
        </div>
      </div>

      <button
        className="btn btn-primary btn-block btn-lg"
        onClick={handleReady}
        disabled={preparing || wrongWayUp}
      >
        {wrongWayUp ? 'Turn Phone Sideways' : preparing ? 'Getting ready…' : "I'm Ready!"}
      </button>
    </div>
  );
}
