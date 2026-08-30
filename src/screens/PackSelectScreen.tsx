import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { WORD_PACKS, ALL_PACK_IDS } from '../data/packs';
import { MenuIcon } from '../components/icons';
import { ResumePrompt } from '../components/ResumePrompt';
import { unlockAudio } from '../lib/sound';
import type { PackChoice } from '../state/GameContext';

export function PackSelectScreen() {
  const { state, setScreen, openSettings, choosePack, discardAndChoosePack, resumePausedGame } = useGame();
  // A pack with no words in it would deal an empty turn, so it isn't offered.
  const playableCustom = state.customPacks.filter((p) => p.words.length > 0);
  const allPackIds = [...ALL_PACK_IDS, ...playableCustom.map((p) => p.id)];
  const [pendingChoice, setPendingChoice] = useState<PackChoice | null>(null);

  function handlePick(choice: PackChoice) {
    unlockAudio();
    // A game that already reached the final scores has nothing left to resume,
    // so don't ask -- just clear it and go on to set up the new one.
    if (state.game && state.game.pausedScreen !== 'final-results') {
      setPendingChoice(choice);
      return;
    }
    if (state.game) {
      discardAndChoosePack(choice);
      return;
    }
    choosePack(choice);
  }

  return (
    <div className="screen pack-select-screen">
      <div className="pack-header">
        <h1>CHARADES</h1>
        <button className="menu-trigger" onClick={openSettings} aria-label="Settings">
          <MenuIcon size={22} />
        </button>
      </div>

      <div className="pack-list">
        <button
          className="pack-button"
          onClick={() => handlePick({ selectedPackIds: allPackIds, useAllPacks: true })}
        >
          All Packs / Random
        </button>
        {WORD_PACKS.map((pack) => (
          <button
            key={pack.id}
            className="pack-button"
            onClick={() => handlePick({ selectedPackIds: [pack.id], useAllPacks: false })}
          >
            {pack.name}
          </button>
        ))}
        {playableCustom.map((pack) => (
          <button
            key={pack.id}
            className="pack-button pack-button-custom"
            onClick={() => handlePick({ selectedPackIds: [pack.id], useAllPacks: false })}
          >
            {pack.name}
          </button>
        ))}
        <button className="pack-button pack-button-new" onClick={() => setScreen('custom-packs')}>
          + Your Own Pack
        </button>
      </div>

      {pendingChoice && (
        <ResumePrompt
          onResume={() => {
            setPendingChoice(null);
            resumePausedGame();
          }}
          onStartNew={() => {
            const choice = pendingChoice;
            setPendingChoice(null);
            discardAndChoosePack(choice);
          }}
        />
      )}
    </div>
  );
}
