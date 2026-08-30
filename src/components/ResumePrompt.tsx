interface ResumePromptProps {
  onResume: () => void;
  onStartNew: () => void;
}

export function ResumePrompt({ onResume, onStartNew }: ResumePromptProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-card stack">
        <h2>Game in progress</h2>
        <p className="subtitle">
          You have a game that hasn't finished yet. Resume where you left off, or start a new
          game instead?
        </p>
        <div className="stack">
          <button className="btn btn-primary btn-block" onClick={onResume}>
            Resume Game
          </button>
          <button className="btn btn-ghost btn-block" onClick={onStartNew}>
            Start New Game
          </button>
        </div>
      </div>
    </div>
  );
}

interface FinishedGamePromptProps {
  onKeep: () => void;
  onClear: () => void;
}

/**
 * Shown instead of ResumePrompt when the saved game already reached the final
 * scores. There is nothing left to play, so the only question is what to do
 * with the scores it left behind.
 */
export function FinishedGamePrompt({ onKeep, onClear }: FinishedGamePromptProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-card stack">
        <h2>Last game finished</h2>
        <p className="subtitle">
          Your last game played all the way through. Keep those scores on the teams, or clear
          them back to zero?
        </p>
        <div className="stack">
          <button className="btn btn-primary btn-block" onClick={onKeep}>
            Keep Scores
          </button>
          <button className="btn btn-ghost btn-block" onClick={onClear}>
            Clear Scores
          </button>
        </div>
      </div>
    </div>
  );
}
