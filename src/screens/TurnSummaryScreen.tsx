import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
import { contrastText } from '../lib/color';
import { InGameMenu } from '../components/InGameMenu';
import { OrientationGate } from '../components/OrientationGate';
import { CheckIcon, ArrowIcon } from '../components/icons';

interface Standing {
  id: string;
  name: string;
  color: string;
  score: number;
}

function rank(scores: Record<string, number>, ids: string[], teams: { id: string; name: string; color: string }[]): Standing[] {
  return ids
    .map((id) => {
      const t = teams.find((x) => x.id === id);
      return { id, name: t?.name ?? '?', color: t?.color ?? '#4a90d9', score: scores[id] ?? 0 };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Slides each chip from where it sat under the previous ranking to its new
 * place (a FLIP: measure before, measure after, invert, play). Without this the
 * order simply snaps and a lead change is easy to miss.
 */
function useRankAnimation(containerRef: React.RefObject<HTMLDivElement | null>, order: string[]) {
  const previous = useRef<Map<string, number> | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const chips = Array.from(container.querySelectorAll<HTMLElement>('[data-team]'));
    const now = new Map(chips.map((el) => [el.dataset.team!, el.getBoundingClientRect().left]));

    const before = previous.current;
    if (before) {
      for (const el of chips) {
        const from = before.get(el.dataset.team!);
        const to = now.get(el.dataset.team!)!;
        if (from === undefined || Math.abs(from - to) < 1) continue;
        el.animate(
          [{ transform: `translateX(${from - to}px)` }, { transform: 'translateX(0)' }],
          { duration: 520, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
        );
      }
    }
    previous.current = now;
  }, [containerRef, order]);
}

export function TurnSummaryScreen() {
  useOrientationLock('portrait');
  const { state, continueAfterSummary } = useGame();
  const game = state.game;
  const stripRef = useRef<HTMLDivElement>(null);

  const result = game && game.allTurnResults.length > 0
    ? game.allTurnResults[game.allTurnResults.length - 1]
    : null;

  // Start on the ranking as it stood before this turn, then settle into the new
  // one a beat later so the movement is visible.
  const [showFinal, setShowFinal] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowFinal(true), 420);
    return () => clearTimeout(t);
  }, []);

  const scoresBefore: Record<string, number> = { ...(game?.sessionScores ?? {}) };
  if (result) scoresBefore[result.teamId] = (scoresBefore[result.teamId] ?? 0) - result.correct.length;

  const standings = game
    ? rank(showFinal ? game.sessionScores : scoresBefore, game.config.teamIds, state.teams)
    : [];
  useRankAnimation(stripRef, standings.map((t) => t.id));

  if (!game || !result) return null;

  const isLastRound = result.roundNumber === game.config.numRounds;
  const isFinalTurn = game.turnIndex + 1 >= game.turnOrder.length;
  const isFreeplay = game.config.teamIds.length === 1;

  return (
    <div className="screen turn-summary-screen portrait-only">
      <OrientationGate need="portrait" />
      <InGameMenu floating />

      {/* The running scores stand in for a title -- who is ahead matters more
          here than restating whose turn just ended. */}
      {!isFreeplay && (
        isLastRound ? (
          <p className="subtitle suspense-strip">Scores are hidden for the final round — keep going!</p>
        ) : (
          <div className="score-strip" ref={stripRef}>
            {standings.map((t) => (
              <div
                className="score-chip"
                key={t.id}
                data-team={t.id}
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
          <div className="field-label summary-heading">
            <span>{result.correct.length} Correct</span>
            <CheckIcon size={18} color="#3ddc84" />
          </div>
          <div className="result-list">
            {result.correct.length === 0 && <p className="subtitle">None this time.</p>}
            {result.correct.map((word, i) => (
              <div className="result-item" key={`c-${i}`}>{word}</div>
            ))}
          </div>
        </div>

        <div className="card stack">
          <div className="field-label summary-heading">
            <span>{result.skipped.length} Skipped</span>
            <ArrowIcon size={18} />
          </div>
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
