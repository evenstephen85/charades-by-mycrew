import { useState } from 'react';
import { useGame, MAX_TEAMS, MIN_TEAMS } from '../state/GameContext';
import { loadLastConfig } from '../lib/storage';
import { useOrientationLock } from '../lib/orientation';
import { TEAM_COLORS } from '../lib/teamColors';
import { contrastText } from '../lib/color';
import { TrashIcon, ArrowIcon } from '../components/icons';
import type { GameConfig } from '../types';
import { OrientationGate } from '../components/OrientationGate';

const ROUND_MIN = 15;
const ROUND_MAX = 120;
const ROUNDS_MIN = 1;
const ROUNDS_MAX = 10;

interface TeamSetupScreenProps {
  mode: 'new-game' | 'manage';
}

export function TeamSetupScreen({ mode }: TeamSetupScreenProps) {
  useOrientationLock('portrait');
  const { state, setScreen, addTeam, removeTeam, renameTeam, recolorTeam, adjustTeamScore, startGame } = useGame();
  const lastConfig = loadLastConfig();

  const [roundSeconds, setRoundSeconds] = useState(lastConfig?.roundSeconds ?? 45);
  const [numRounds, setNumRounds] = useState(lastConfig?.numRounds ?? 3);
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);

  function adjustRound(delta: number) {
    setRoundSeconds((s) => Math.max(ROUND_MIN, Math.min(ROUND_MAX, s + delta)));
  }

  function handleStart() {
    if (!state.draftPackChoice || state.teams.length < MIN_TEAMS) return;
    const config: GameConfig = {
      selectedPackIds: state.draftPackChoice.selectedPackIds,
      useAllPacks: state.draftPackChoice.useAllPacks,
      roundSeconds,
      numRounds,
      teamIds: state.teams.map((t) => t.id),
    };
    startGame(config);
  }

  // A step is offered only when it lands inside the allowed range, so e.g. -15
  // greys out at 20s and 25s rather than silently clamping to the minimum.
  const canStep = (delta: number) => {
    const next = roundSeconds + delta;
    return next >= ROUND_MIN && next <= ROUND_MAX;
  };

  const takenColors = new Set(state.teams.map((t) => t.color.toLowerCase()));

  return (
    <div className="screen team-setup-screen portrait-only">
      <OrientationGate need="portrait" />
      <div className="top-bar">
        <button
          className="icon-btn"
          onClick={() => setScreen(mode === 'new-game' ? 'pack-select' : 'settings')}
          aria-label="Back"
        >
          <ArrowIcon size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <h2>{mode === 'new-game' ? 'Game Setup' : 'Manage Teams'}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="screen-body">
        <div className="team-setup-list">
          {mode === 'manage' && (
            <div className="team-setup-headings">
              <span className="team-heading-name">Team</span>
              <span className="team-heading-score">Score</span>
              <span className="team-heading-spacer" />
            </div>
          )}

          {state.teams.map((team) => (
            <div className="team-setup-row" key={team.id}>
              <button
                className="team-swatch-btn"
                style={{ background: team.color }}
                onClick={() => setColorPickerFor(colorPickerFor === team.id ? null : team.id)}
                aria-label="Choose team color"
              />
              {state.teams.length === 1 ? (
                <div className="freeplay-label">Freeplay!</div>
              ) : (
                <input
                  type="text"
                  value={team.name}
                  maxLength={16}
                  onChange={(e) => renameTeam(team.id, e.target.value)}
                />
              )}
              {mode === 'manage' && (
                <div
                  className="score-adjust"
                  style={{ background: team.color, color: contrastText(team.color) }}
                >
                  <button
                    onClick={() => adjustTeamScore(team.id, -1)}
                    disabled={team.score <= 0}
                    aria-label="Decrease score"
                  >
                    −
                  </button>
                  <span className="score-adjust-value">{team.score}</span>
                  <button onClick={() => adjustTeamScore(team.id, 1)} aria-label="Increase score">+</button>
                </div>
              )}
              <button
                className="icon-btn"
                onClick={() => removeTeam(team.id)}
                disabled={state.teams.length <= MIN_TEAMS}
                aria-label="Delete team"
              >
                <TrashIcon size={20} />
              </button>

              {colorPickerFor === team.id && (
                <div className="color-popover">
                  {/* Colours already worn by another team aren't offered, so two
                      teams can never end up the same colour. */}
                  {TEAM_COLORS.filter(
                    (c) =>
                      c.hex.toLowerCase() === team.color.toLowerCase() ||
                      !takenColors.has(c.hex.toLowerCase()),
                  ).map((c) => (
                    <button
                      key={c.hex}
                      className="color-popover-swatch"
                      style={{ background: c.hex }}
                      aria-label={c.name}
                      onClick={() => {
                        recolorTeam(team.id, c.hex);
                        setColorPickerFor(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {state.teams.length < MAX_TEAMS && (
            <button className="team-setup-row add-team-row" onClick={addTeam}>
              + Add Team
            </button>
          )}
        </div>

        {mode === 'new-game' && (
          <div className="team-setup-controls">
            <div className="row-control">
              <div className="field-label">Round Length</div>
              <div className="dual-stepper">
                <button onClick={() => adjustRound(-15)} disabled={!canStep(-15)}>-15</button>
                <button onClick={() => adjustRound(-5)} disabled={!canStep(-5)}>-5</button>
                <span className="value">{roundSeconds}s</span>
                <button onClick={() => adjustRound(5)} disabled={!canStep(5)}>+5</button>
                <button onClick={() => adjustRound(15)} disabled={!canStep(15)}>+15</button>
              </div>
            </div>

            <div className="row-control divider">
              <div className="field-label">Rounds per Team</div>
              <div className="dual-stepper compact">
                <button
                  onClick={() => setNumRounds((n) => Math.max(ROUNDS_MIN, n - 1))}
                  disabled={numRounds <= ROUNDS_MIN}
                >
                  −
                </button>
                <span className="value">{numRounds}</span>
                <button
                  onClick={() => setNumRounds((n) => Math.min(ROUNDS_MAX, n + 1))}
                  disabled={numRounds >= ROUNDS_MAX}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {mode === 'new-game' && (
        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleStart}
          disabled={state.teams.length < MIN_TEAMS}
        >
          Start Game
        </button>
      )}

      {mode === 'manage' && (
        <button className="btn btn-primary btn-block" onClick={() => setScreen('settings')}>
          Done
        </button>
      )}
    </div>
  );
}
