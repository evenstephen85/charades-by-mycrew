import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { detectTiltSupport, requestMotionPermission } from '../lib/motion';
import { unlockAudio } from '../lib/sound';
import { teamColor } from '../lib/teamColors';

export function GetReadyScreen() {
  const { state, beginTurn, setInputMode } = useGame();
  const game = state.game;
  const [preparing, setPreparing] = useState(false);
  if (!game) return null;

  const teamIndex = game.config.teamIds.findIndex(
    (id) => id === game.turnOrder[game.turnIndex],
  );
  const team = state.teams.find((t) => t.id === game.turnOrder[game.turnIndex]);
  const roundNumber = Math.floor(game.turnIndex / game.config.teamIds.length) + 1;
  const turnInRound = game.turnIndex + 1;
  const totalTurns = game.turnOrder.length;

  async function handleReady() {
    setPreparing(true);
    unlockAudio();
    const granted = await requestMotionPermission();
    const supported = granted && (await detectTiltSupport());
    setInputMode(supported ? 'tilt' : 'buttons');
    beginTurn();
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <span className="subtitle">
          Turn {turnInRound} of {totalTurns} · Round {roundNumber} of {game.config.numRounds}
        </span>
      </div>
      <div className="center-col">
        <div
          className="team-swatch"
          style={{ width: 20, height: 20, background: teamColor(teamIndex) }}
        />
        <h1>{team?.name ?? 'Next Team'}'s Turn</h1>
        <p className="subtitle">
          Hand the phone to your actor. Hold it up to your forehead, screen facing out, so
          your teammates can read the word.
        </p>
        <p className="subtitle">
          Tilt the phone <strong>down</strong> when you guess right, tilt it <strong>up</strong> to
          skip. On a computer you'll get on-screen buttons instead.
        </p>
      </div>
      <button className="btn btn-primary btn-block btn-lg" onClick={handleReady} disabled={preparing}>
        {preparing ? 'Getting ready…' : "I'm Ready!"}
      </button>
    </div>
  );
}
