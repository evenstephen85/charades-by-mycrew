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
