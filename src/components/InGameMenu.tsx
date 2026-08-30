import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { MenuIcon, CloseIcon } from './icons';

interface InGameMenuProps {
  onOpenChange?: (open: boolean) => void;
  /** Overlay the trigger in the screen's top-right corner instead of sitting in the layout flow. */
  floating?: boolean;
}

export function InGameMenu({ onOpenChange, floating }: InGameMenuProps = {}) {
  const { openSettings, pauseHome } = useGame();
  const [open, setOpen] = useState(false);

  function setOpenState(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <>
      <button
        className={floating ? 'menu-trigger menu-trigger-floating' : 'menu-trigger'}
        onClick={() => setOpenState(true)}
        aria-label="Open menu"
      >
        <MenuIcon size={22} />
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpenState(false)}>
          <div className="modal-card stack" onClick={(e) => e.stopPropagation()}>
            <div className="top-bar">
              <h2>Menu</h2>
              <button className="icon-btn" onClick={() => setOpenState(false)} aria-label="Close menu">
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="stack">
              <button
                className="btn btn-block"
                onClick={() => {
                  setOpenState(false);
                  openSettings();
                }}
              >
                Settings
              </button>
              <button
                className="btn btn-block"
                onClick={() => {
                  setOpenState(false);
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
