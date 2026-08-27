import { useEffect, useState } from 'react';
import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
import { playDrumroll, playTaDa } from '../lib/sound';
import { InGameMenu } from '../components/InGameMenu';

const DRUMROLL_SECONDS = 2.4;
const WINNER_HOLD_MS = 1800;

type Phase = 'drumroll' | 'winner' | 'scores';

interface FinalResultsScreenProps {
  onPhaseColor: (color: string | null) => void;
}

export function FinalResultsScreen({ onPhaseColor }: FinalResultsScreenProps) {
  useOrientationLock('landscape');
  const { state, startGame, endGame } = useGame();
  const game = state.game;
  const [phase, setPhase] = useState<Phase>('drumroll');
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

  useEffect(() => {
    if (soundOn) playDrumroll(DRUMROLL_SECONDS);
    const toWinner = setTimeout(() => {
      setPhase('winner');
      if (soundOn) playTaDa();
      onPhaseColor(winners[0]?.color ?? null);
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

  const headerTitle =
    phase === 'scores' ? 'Final Scores' : phase === 'winner' ? 'And the Winner Is…' : 'Drumroll…';

  return (
    <div className="screen final-results-screen">
      <div className="top-bar">
        <h2>{headerTitle}</h2>
        <InGameMenu />
      </div>

      {phase === 'drumroll' && (
        <div className="center-col">
          <div className="drumroll-bar" />
        </div>
      )}

      {phase === 'winner' && (
        <div className="center-col">
          <p className="subtitle">{winners.length > 1 ? "It's a tie between…" : 'The winner is…'}</p>
          <h1 className="winner-name">{winners.map((w) => w.name).join(' & ')}</h1>
        </div>
      )}

      {phase === 'scores' && (
        <>
          <div className="final-scores-grid">
            {standings.map((t) => (
              <div className={`score-tile ${t.score === topScore ? 'leader' : ''}`} key={t.id}>
                <span>{t.name}</span>
                <span className="score-value">{t.score}</span>
              </div>
            ))}
          </div>

          <div className="row">
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handlePlayAgain}>
              Play Again
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => endGame('pack-select')}>
              Home
            </button>
          </div>
        </>
      )}
    </div>
  );
}
