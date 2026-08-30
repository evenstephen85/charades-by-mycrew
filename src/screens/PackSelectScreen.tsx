import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { useOrientationLock } from '../lib/orientation';
import { WORD_PACKS, ALL_PACK_IDS } from '../data/packs';
import { MenuIcon } from '../components/icons';
import { ResumePrompt } from '../components/ResumePrompt';
import { unlockAudio } from '../lib/sound';
import type { PackChoice } from '../state/GameContext';
import { OrientationGate } from '../components/OrientationGate';

export function PackSelectScreen() {
  useOrientationLock('portrait');
  const { state, openSettings, choosePack, discardAndChoosePack, resumePausedGame } = useGame();
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
    <div className="screen pack-select-screen portrait-only">
      <OrientationGate need="portrait" />
      <div className="pack-header">
        <h1>CHARADES</h1>
        <button className="menu-trigger" onClick={openSettings} aria-label="Settings">
          <MenuIcon size={22} />
        </button>
      </div>

      <div className="pack-list">
        <button
          className="pack-button"
          onClick={() => handlePick({ selectedPackIds: ALL_PACK_IDS, useAllPacks: true })}
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
