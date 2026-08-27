import { useState } from 'react';
import { useGame, MAX_TEAMS, MIN_TEAMS } from '../state/GameContext';
import { loadLastConfig } from '../lib/storage';
import { useOrientationLock } from '../lib/orientation';
import { TEAM_COLORS } from '../lib/teamColors';
import { TrashIcon, ArrowIcon } from '../components/icons';
import type { GameConfig } from '../types';

const ROUND_MIN = 15;
const ROUND_MAX = 120;

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

  return (
    <div className="screen team-setup-screen">
      <div className="top-bar">
        <button
          className="icon-btn"
          onClick={() => setScreen(mode === 'new-game' ? 'pack-select' : 'settings')}
          aria-label="Back"
        >
          <ArrowIcon size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <h2>{mode === 'new-game' ? 'Team Setup' : 'Manage Teams'}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="team-setup-columns">
        <div className="team-setup-list">
          {state.teams.map((team) => (
            <div className="team-setup-row" key={team.id}>
              <button
                className="team-swatch-btn"
                style={{ background: team.color }}
                onClick={() => setColorPickerFor(colorPickerFor === team.id ? null : team.id)}
                aria-label="Choose team color"
              />
              <input
                type="text"
                value={team.name}
                maxLength={16}
                onChange={(e) => renameTeam(team.id, e.target.value)}
              />
              {mode === 'manage' && (
                <div className="score-adjust">
                  <button onClick={() => adjustTeamScore(team.id, -1)} aria-label="Decrease score">−</button>
                  <span>{team.score}</span>
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
                  {TEAM_COLORS.map((c) => (
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

          <button
            className="team-setup-row add-team-row"
            onClick={addTeam}
            disabled={state.teams.length >= MAX_TEAMS}
          >
            + Add Team
          </button>
        </div>

        <div className="team-setup-controls">
          {mode === 'new-game' && (
            <>
              <div className="row-control">
                <div className="field-label">Round Length</div>
                <div className="dual-stepper">
                  <button onClick={() => adjustRound(-15)}>-15</button>
                  <button onClick={() => adjustRound(-5)}>-5</button>
                  <span className="value">{roundSeconds}s</span>
                  <button onClick={() => adjustRound(5)}>+5</button>
                  <button onClick={() => adjustRound(15)}>+15</button>
                </div>
              </div>

              <div className="row-control">
                <div className="field-label">Rounds per Team</div>
                <div className="dual-stepper">
                  <button onClick={() => setNumRounds((n) => Math.max(1, n - 1))}>−</button>
                  <span className="value">{numRounds}</span>
                  <button onClick={() => setNumRounds((n) => Math.min(10, n + 1))}>+</button>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleStart}
                disabled={state.teams.length < MIN_TEAMS}
              >
                Start Game
              </button>
            </>
          )}

          {mode === 'manage' && (
            <button className="btn btn-primary btn-block" onClick={() => setScreen('settings')}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
