import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { playDrumroll, playFanfare } from '../lib/sound';
import { teamColor } from '../lib/teamColors';

const DRUMROLL_SECONDS = 2.4;

export function FinalResultsScreen() {
  const { state, startGame, setScreen, returnHome } = useGame();
  const game = state.game;
  const [revealed, setRevealed] = useState(false);
  const soundOn = state.settings.soundEnabled;

  useEffect(() => {
    if (soundOn) playDrumroll(DRUMROLL_SECONDS);
    const t = setTimeout(() => {
      setRevealed(true);
      if (soundOn) playFanfare();
    }, DRUMROLL_SECONDS * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!game) return null;

  const standings = [...game.config.teamIds]
    .map((id, i) => ({
      id,
      index: i,
      name: state.teams.find((t) => t.id === id)?.name ?? '?',
      score: game.sessionScores[id] ?? 0,
      lifetime: state.teams.find((t) => t.id === id)?.score ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  const topScore = standings[0]?.score ?? 0;
  const winners = standings.filter((t) => t.score === topScore);

  function handlePlayAgain() {
    startGame(game!.config);
  }

  return (
    <div className="screen">
      <div className="center-col">
        {!revealed ? (
          <>
            <div className="drumroll">🥁</div>
            <h2>And the winner is…</h2>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3.5rem' }}>🏆🎉</div>
            <p className="subtitle">
              {winners.length > 1 ? "It's a tie between…" : 'The winner is…'}
            </p>
            <h1 className="winner-name">{winners.map((w) => w.name).join(' & ')}</h1>
          </>
        )}
      </div>

      {revealed && (
        <>
          <div className="card scoreboard">
            <div className="field-label">Final Scores This Game</div>
            {standings.map((t) => (
              <div className={`score-row ${t.score === topScore ? 'leader' : ''}`} key={t.id}>
                <span className="row" style={{ gap: 8 }}>
                  <span className="team-swatch" style={{ background: teamColor(t.index) }} />
                  {t.name}
                </span>
                <span className="score-value">{t.score}</span>
              </div>
            ))}
          </div>

          <div className="card scoreboard">
            <div className="field-label">All-Time Totals</div>
            {[...standings].sort((a, b) => b.lifetime - a.lifetime).map((t) => (
              <div className="score-row" key={t.id}>
                <span>{t.name}</span>
                <span className="score-value">{t.lifetime}</span>
              </div>
            ))}
          </div>

          <div className="stack">
            <button className="btn btn-primary btn-block btn-lg" onClick={handlePlayAgain}>
              🔁 Play Again
            </button>
            <div className="row">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setScreen('setup')}>
                New Setup
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={returnHome}>
                Home
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
