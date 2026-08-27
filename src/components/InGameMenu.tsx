import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { MenuIcon, CloseIcon } from './icons';

interface InGameMenuProps {
  pause?: { paused: boolean; onToggle: () => void };
}

export function InGameMenu({ pause }: InGameMenuProps) {
  const { openSettings, pauseHome } = useGame();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="menu-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <MenuIcon size={22} />
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-card stack" onClick={(e) => e.stopPropagation()}>
            <div className="top-bar">
              <h2>Menu</h2>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="stack">
              {pause && (
                <button
                  className="btn btn-block"
                  onClick={() => {
                    pause.onToggle();
                    setOpen(false);
                  }}
                >
                  {pause.paused ? 'Resume' : 'Pause'}
                </button>
              )}
              <button
                className="btn btn-block"
                onClick={() => {
                  setOpen(false);
                  openSettings();
                }}
              >
                Settings
              </button>
              <button
                className="btn btn-block"
                onClick={() => {
                  setOpen(false);
                  pauseHome();
                }}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
