import { useGame } from '../state/GameContext';
import { MenuIcon } from './icons';

interface InGameMenuProps {
  /** Overlay the trigger in the screen's top-right corner instead of sitting in the layout flow. */
  floating?: boolean;
}

/**
 * Opens Settings directly. There used to be a popup in between offering
 * Settings and Home, but Settings already carries a Home button during a game,
 * so the extra tap bought nothing.
 */
export function InGameMenu({ floating }: InGameMenuProps = {}) {
  const { openSettings } = useGame();

  return (
    <button
      className={floating ? 'menu-trigger menu-trigger-floating' : 'menu-trigger'}
      onClick={openSettings}
      aria-label="Open settings"
    >
      <MenuIcon size={22} />
    </button>
  );
}
