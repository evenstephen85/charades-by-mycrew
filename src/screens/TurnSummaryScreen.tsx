import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
import { contrastText } from '../lib/color';
import { InGameMenu } from '../components/InGameMenu';

export function TurnSummaryScreen() {
  useOrientationLock('landscape');
  const { state, continueAfterSummary } = useGame();
  const game = state.game;
  if (!game || game.allTurnResults.length === 0) return null;

  const result = game.allTurnResults[game.allTurnResults.length - 1];
  const team = state.teams.find((t) => t.id === result.teamId);
  const isLastRound = result.roundNumber === game.config.numRounds;
  const isFinalTurn = game.turnIndex + 1 >= game.turnOrder.length;
  const isFreeplay = game.config.teamIds.length === 1;
  const headerTitle = isFreeplay
    ? `Freeplay! — ${result.correct.length} Correct`
    : `${team?.name} — ${result.correct.length} Correct`;

  const sortedTeams = [...game.config.teamIds]
    .map((id) => {
      const t = state.teams.find((x) => x.id === id);
      return {
        id,
        name: t?.name ?? '?',
        color: t?.color ?? '#4a90d9',
        score: game.sessionScores[id] ?? 0,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="screen turn-summary-screen">
      <InGameMenu floating />

      <h2 className="screen-title">{headerTitle}</h2>

      {/* Scores ride up beside the menu as a single strip, leaving the full
          width below for the word lists. */}
      {!isFreeplay && (
        isLastRound ? (
          <p className="subtitle suspense-strip">Scores are hidden for the final round — keep going!</p>
        ) : (
          <div className="score-strip">
            {sortedTeams.map((t) => (
              <div
                className="score-chip"
                key={t.id}
                style={{ background: t.color, color: contrastText(t.color) }}
              >
                <span className="score-chip-name">{t.name}</span>
                <span className="score-chip-value">{t.score}</span>
              </div>
            ))}
          </div>
        )
      )}

      <div className="summary-columns">
        <div className="card stack">
          <div className="field-label">Got It ({result.correct.length})</div>
          <div className="result-list">
            {result.correct.length === 0 && <p className="subtitle">None this time.</p>}
            {result.correct.map((word, i) => (
              <div className="result-item" key={`c-${i}`}>{word}</div>
            ))}
          </div>
        </div>

        <div className="card stack">
          <div className="field-label">Skipped ({result.skipped.length})</div>
          <div className="result-list">
            {result.skipped.length === 0 && <p className="subtitle">Nothing skipped.</p>}
            {result.skipped.map((word, i) => (
              <div className="result-item" key={`s-${i}`}>{word}</div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-block btn-lg" onClick={continueAfterSummary}>
        {isFinalTurn ? 'See Final Results' : 'Next Team'}
      </button>
    </div>
  );
}
