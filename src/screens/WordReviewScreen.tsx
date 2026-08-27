import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { WORD_PACKS } from '../data/packs';

export function WordReviewScreen() {
  const { state, toggleDisabledWord, setScreen } = useGame();
  const [openPack, setOpenPack] = useState<string | null>(null);

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="icon-btn" onClick={() => setScreen('welcome')}>← Back</button>
        <h2>Review Words</h2>
        <div style={{ width: 40 }} />
      </div>
      <p className="subtitle">
        Tap any word to remove it from play, or tap again to bring it back. Great for making
        sure everything fits your group.
      </p>

      <div className="stack">
        {WORD_PACKS.map((pack) => {
          const disabled = new Set(state.disabledWords[pack.id] ?? []);
          const isOpen = openPack === pack.id;
          return (
            <div className="card" key={pack.id}>
              <button
                className="row"
                style={{ width: '100%', justifyContent: 'space-between', background: 'transparent' }}
                onClick={() => setOpenPack(isOpen ? null : pack.id)}
              >
                <span style={{ fontWeight: 700 }}>
                  {pack.emoji} {pack.name}
                </span>
                <span className="subtitle">
                  {pack.words.length - disabled.size}/{pack.words.length} active {isOpen ? '▲' : '▼'}
                </span>
              </button>
              {isOpen && (
                <div className="chip-grid" style={{ marginTop: 12 }}>
                  {pack.words.map((word) => {
                    const isOff = disabled.has(word);
                    return (
                      <button
                        key={word}
                        className={`chip ${isOff ? '' : 'selected'}`}
                        style={isOff ? { opacity: 0.45, textDecoration: 'line-through' } : undefined}
                        onClick={() => toggleDisabledWord(pack.id, word)}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
