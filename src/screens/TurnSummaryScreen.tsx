import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
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
    .map((id) => ({
      id,
      name: state.teams.find((t) => t.id === id)?.name ?? '?',
      score: game.sessionScores[id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
  const topScore = sortedTeams[0]?.score ?? 0;

  return (
    <div className="screen turn-summary-screen">
      <InGameMenu floating />

      <div className="screen-body">
        <h2 className="screen-title">{headerTitle}</h2>
        <div className={isFreeplay ? 'summary-columns two-col' : 'summary-columns'}>
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

          {!isFreeplay && (isLastRound ? (
            <div className="card suspense-box">
              <p className="subtitle">Scores are hidden for the final round…</p>
              <p className="subtitle">Keep going to find out who wins!</p>
            </div>
          ) : (
            <div className="card scoreboard">
              <div className="field-label">Scores This Game</div>
              {sortedTeams.map((t) => (
                <div className={`score-row ${t.score === topScore && topScore > 0 ? 'leader' : ''}`} key={t.id}>
                  <span>{t.name}</span>
                  <span className="score-value">{t.score}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-block btn-lg" onClick={continueAfterSummary}>
        {isFinalTurn ? 'See Final Results' : 'Next Team'}
      </button>
    </div>
  );
}
