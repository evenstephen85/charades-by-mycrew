import { useGame } from '../state/GameContext';
import { unlockAudio } from '../lib/sound';

export function WelcomeScreen() {
  const { setScreen } = useGame();

  const go = (screen: 'setup' | 'settings' | 'review') => {
    unlockAudio();
    setScreen(screen);
  };

  return (
    <div className="screen">
      <div className="spacer" />
      <div className="center-col">
        <div style={{ fontSize: '4.5rem' }}>🤸‍♀️🙋</div>
        <h1>Charades</h1>
        <p className="subtitle" style={{ marginTop: -12, opacity: 0.85 }}>by MyCrew</p>
        <p className="subtitle">
          It's the opposite of charades — hold the phone to your forehead, let everyone else
          see the word, and act it out before time runs out. Tilt down for correct, tilt up
          to skip!
        </p>
      </div>
      <div className="stack">
        <button className="btn btn-primary btn-block btn-lg" onClick={() => go('setup')}>
          Start a Game
        </button>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => go('settings')}>
            ⚙️ Settings
          </button>
          <button className="btn btn-ghost" onClick={() => go('review')}>
            📋 Review Words
          </button>
        </div>
      </div>
      <div className="spacer" />
    </div>
  );
}
