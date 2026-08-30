import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { playDrumroll, playTaDa } from '../lib/sound';
import { contrastText } from '../lib/color';
import { InGameMenu } from '../components/InGameMenu';

const DRUMROLL_SECONDS = 2.4;
const WINNER_HOLD_MS = 3600;

type Phase = 'drumroll' | 'winner' | 'scores';

interface FinalResultsScreenProps {
  onPhaseColor: (color: string | null) => void;
}

export function FinalResultsScreen({ onPhaseColor }: FinalResultsScreenProps) {
  const { state, startGame, endGame, markFinaleRevealed } = useGame();
  const game = state.game;
  const isFreeplay = !!game && game.config.teamIds.length === 1;
  // A game restored after its finale already played goes straight to the
  // scores -- no second drumroll, no second winner reveal.
  const alreadyRevealed = !!game && game.finaleRevealed;
  const [phase, setPhase] = useState<Phase>(isFreeplay || alreadyRevealed ? 'scores' : 'drumroll');
  const soundOn = state.settings.soundEnabled;

  const standings = game
    ? [...game.config.teamIds]
        .map((id) => ({
          id,
          name: state.teams.find((t) => t.id === id)?.name ?? '?',
          color: state.teams.find((t) => t.id === id)?.color ?? '#4a90d9',
          score: game.sessionScores[id] ?? 0,
        }))
        .sort((a, b) => b.score - a.score)
    : [];
  const topScore = standings[0]?.score ?? 0;
  const winners = standings.filter((t) => t.score === topScore);
  const totalCorrect = game ? game.allTurnResults.reduce((sum, r) => sum + r.correct.length, 0) : 0;

  useEffect(() => {
    if (isFreeplay || alreadyRevealed) {
      markFinaleRevealed();
      return;
    }
    markFinaleRevealed();
    if (soundOn) playDrumroll(DRUMROLL_SECONDS);
    const toWinner = setTimeout(() => {
      setPhase('winner');
      if (soundOn) playTaDa();
      // A tie gets the split backdrop below instead of one team's wash.
      onPhaseColor(winners.length === 1 ? winners[0]?.color ?? null : null);
    }, DRUMROLL_SECONDS * 1000);
    const toScores = setTimeout(() => setPhase('scores'), DRUMROLL_SECONDS * 1000 + WINNER_HOLD_MS);
    return () => {
      clearTimeout(toWinner);
      clearTimeout(toScores);
      onPhaseColor(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!game) return null;

  function handlePlayAgain() {
    startGame(game!.config);
  }

  const headerTitle = isFreeplay ? 'Nice Game!' : phase === 'scores' ? 'Final Scores' : '';

  return (
    <div className="screen final-results-screen">
      <InGameMenu floating />

      {phase === 'drumroll' && (
        <div className="center-col">
          <div className="drumroll-bar" />
          <h2>And the Winner Is…</h2>
        </div>
      )}

      {phase === 'winner' && (
        <>
          {/* A tie belongs to everyone who tied: the screen is split between
              their colours rather than picking one of them to wash it. */}
          {winners.length > 1 && (
            <div className="tie-split" aria-hidden="true">
              {winners.map((w) => (
                <span key={w.id} style={{ background: w.color }} />
              ))}
            </div>
          )}
          <div className="center-col">
            <p className="subtitle">{winners.length > 1 ? "It's a tie between…" : 'The winner is…'}</p>
            <h1 className="winner-name">{winners.map((w) => w.name).join(' & ')}</h1>
          </div>
        </>
      )}

      {phase === 'scores' && isFreeplay && (
        <>
          <div className="screen-body">
            <div className="center-col">
              <h2 className="screen-title">{headerTitle}</h2>
              <p className="subtitle">Words Guessed</p>
              <h1 className="winner-name">{totalCorrect}</h1>
            </div>
          </div>

          <div className="final-actions">
            <button className="btn btn-primary btn-lg" onClick={handlePlayAgain}>
              Play Again
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => endGame('pack-select')}>
              Home
            </button>
          </div>
        </>
      )}

      {phase === 'scores' && !isFreeplay && (
        <>
          <div className="screen-body">
            <h2 className="screen-title">{headerTitle}</h2>
            <div className="final-scores-grid">
              {standings.map((t) => (
                <div
                  className={`score-tile ${t.score === topScore ? 'leader' : ''}`}
                  key={t.id}
                  style={{ background: t.color, color: contrastText(t.color) }}
                >
                  <span>{t.name}</span>
                  <span className="score-value">{t.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="final-actions">
            <button className="btn btn-primary btn-lg" onClick={handlePlayAgain}>
              Play Again
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => endGame('pack-select')}>
              Home
            </button>
          </div>
        </>
      )}
    </div>
  );
}
