import { useState } from 'react';
import { useGame, makeDefaultTeam, loadLastConfig } from '../state/GameContext';
import { WORD_PACKS } from '../data/packs';
import { Stepper } from '../components/Stepper';
import { teamColor } from '../lib/teamColors';
import type { GameConfig, Team } from '../types';

const ALL_PACK_IDS = WORD_PACKS.map((p) => p.id);
const MAX_TEAMS = 8;
const MIN_TEAMS = 2;

export function SetupScreen() {
  const { state, saveTeamsList, clearScores, clearTeams, startGame, setScreen } = useGame();
  const lastConfig = loadLastConfig();

  const [teams, setTeams] = useState<Team[]>(
    state.teams.length > 0 ? state.teams : [makeDefaultTeam(0), makeDefaultTeam(1)],
  );
  const [useAllPacks, setUseAllPacks] = useState(lastConfig?.useAllPacks ?? true);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(
    lastConfig?.selectedPackIds && lastConfig.selectedPackIds.length > 0
      ? lastConfig.selectedPackIds
      : ALL_PACK_IDS,
  );
  const [roundSeconds, setRoundSeconds] = useState(lastConfig?.roundSeconds ?? 60);
  const [numRounds, setNumRounds] = useState(lastConfig?.numRounds ?? 3);
  const [confirmClear, setConfirmClear] = useState<'scores' | 'teams' | null>(null);

  const canQuickStart =
    state.settings.quickStart && !!lastConfig && state.teams.length >= MIN_TEAMS;

  function togglePack(id: string) {
    setUseAllPacks(false);
    setSelectedPackIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function selectAllPacks() {
    setUseAllPacks(true);
    setSelectedPackIds(ALL_PACK_IDS);
  }

  function addTeam() {
    if (teams.length >= MAX_TEAMS) return;
    const next = [...teams, makeDefaultTeam(teams.length)];
    setTeams(next);
  }

  function removeTeam(id: string) {
    if (teams.length <= MIN_TEAMS) return;
    setTeams(teams.filter((t) => t.id !== id));
  }

  function renameTeam(id: string, name: string) {
    setTeams(teams.map((t) => (t.id === id ? { ...t, name, isDefaultName: name.trim() === '' } : t)));
  }

  function buildConfig(packIds: string[]): GameConfig {
    return {
      selectedPackIds: packIds,
      useAllPacks,
      roundSeconds,
      numRounds,
      teamIds: teams.map((t) => t.id),
    };
  }

  function handleStart() {
    const packIds = useAllPacks ? ALL_PACK_IDS : selectedPackIds;
    if (packIds.length === 0 || teams.length < MIN_TEAMS) return;
    const cleanedTeams = teams.map((t, i) => ({
      ...t,
      name: t.name.trim() === '' ? `Team ${i + 1}` : t.name,
    }));
    saveTeamsList(cleanedTeams);
    startGame(buildConfig(packIds));
  }

  function handleQuickStart() {
    if (!lastConfig) return;
    const validTeamIds = lastConfig.teamIds?.filter((id) => state.teams.some((t) => t.id === id));
    const teamIds = validTeamIds && validTeamIds.length >= MIN_TEAMS ? validTeamIds : state.teams.map((t) => t.id);
    startGame({
      selectedPackIds: lastConfig.selectedPackIds ?? ALL_PACK_IDS,
      useAllPacks: lastConfig.useAllPacks ?? true,
      roundSeconds: lastConfig.roundSeconds ?? 60,
      numRounds: lastConfig.numRounds ?? 3,
      teamIds,
    });
  }

  function handleClearScores() {
    clearScores();
    setConfirmClear(null);
  }

  function handleClearTeams() {
    clearTeams();
    setTeams([makeDefaultTeam(0), makeDefaultTeam(1)]);
    setConfirmClear(null);
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="icon-btn" onClick={() => setScreen('welcome')}>← Back</button>
        <h2>Set Up Game</h2>
        <div style={{ width: 40 }} />
      </div>

      {canQuickStart && (
        <button className="btn btn-primary btn-block" onClick={handleQuickStart}>
          ⚡ Quick Start (same as last time)
        </button>
      )}

      <div className="card stack">
        <div className="field-label">Word Packs</div>
        <button
          className={`pack-chip ${useAllPacks ? 'selected' : ''}`}
          style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}
          onClick={selectAllPacks}
        >
          <span className="emoji">🎲</span>
          <span>All Packs / Random</span>
        </button>
        <div className="chip-grid">
          {WORD_PACKS.map((pack) => (
            <button
              key={pack.id}
              className={`pack-chip ${!useAllPacks && selectedPackIds.includes(pack.id) ? 'selected' : ''}`}
              onClick={() => togglePack(pack.id)}
            >
              <span className="emoji">{pack.emoji}</span>
              <span>{pack.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="field-label">Teams / Players ({teams.length}/{MAX_TEAMS})</div>
          <button className="btn btn-ghost" onClick={addTeam} disabled={teams.length >= MAX_TEAMS}>
            + Add
          </button>
        </div>
        <div className="stack">
          {teams.map((team, i) => (
            <div className="team-row" key={team.id}>
              <span className="team-swatch" style={{ background: teamColor(i) }} />
              <input
                type="text"
                value={team.isDefaultName ? '' : team.name}
                placeholder={`Team ${i + 1}`}
                maxLength={20}
                onChange={(e) => renameTeam(team.id, e.target.value)}
              />
              <button
                className="icon-btn"
                onClick={() => removeTeam(team.id)}
                disabled={teams.length <= MIN_TEAMS}
                aria-label="Remove team"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="row">
          {confirmClear === null ? (
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmClear('scores')}>
                Clear Scores
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmClear('teams')}>
                Clear Teams
              </button>
            </>
          ) : confirmClear === 'scores' ? (
            <>
              <span className="subtitle">Reset everyone's score to 0?</span>
              <button className="btn btn-primary" onClick={handleClearScores}>Yes, clear</button>
              <button className="btn btn-ghost" onClick={() => setConfirmClear(null)}>Cancel</button>
            </>
          ) : (
            <>
              <span className="subtitle">Remove all saved teams and scores?</span>
              <button className="btn btn-primary" onClick={handleClearTeams}>Yes, clear</button>
              <button className="btn btn-ghost" onClick={() => setConfirmClear(null)}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <div className="field-label">Round Length</div>
        <Stepper
          value={roundSeconds}
          min={30}
          max={120}
          step={15}
          format={(v) => `${v}s`}
          onChange={setRoundSeconds}
        />
      </div>

      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <div className="field-label">Rounds per Team</div>
        <Stepper value={numRounds} min={1} max={10} onChange={setNumRounds} />
      </div>

      <button
        className="btn btn-primary btn-block btn-lg"
        onClick={handleStart}
        disabled={teams.length < MIN_TEAMS || (!useAllPacks && selectedPackIds.length === 0)}
      >
        Start Game
      </button>
    </div>
  );
}
