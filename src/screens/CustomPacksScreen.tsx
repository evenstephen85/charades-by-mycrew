import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { ArrowIcon, TrashIcon, PlusIcon } from '../components/icons';

const MAX_WORD_LENGTH = 40;
const MAX_NAME_LENGTH = 24;

/**
 * Write-your-own packs: name one, then add words a line at a time. Kept apart
 * from the built-in packs so updating the shipped word lists can never touch
 * what someone wrote themselves.
 */
export function CustomPacksScreen() {
  const {
    state,
    setScreen,
    createCustomPack,
    renameCustomPack,
    addCustomWord,
    removeCustomWord,
    deleteCustomPack,
    editCustomPack,
  } = useGame();

  // Opening from a pack's edit button drops straight into that pack.
  const [editingId, setEditingId] = useState<string | null>(state.editingPackId);
  const [draftWord, setDraftWord] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const editing = state.customPacks.find((p) => p.id === editingId) ?? null;

  // A plain render helper, not a component: declaring a component inside render
  // remounts it (and resets its state) on every pass.
  function renderDeleteConfirm() {
    const target = state.customPacks.find((p) => p.id === confirmDelete);
    return (
      <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
        <div className="modal-card stack" onClick={(e) => e.stopPropagation()}>
          <h2>Delete pack?</h2>
          <p className="subtitle">"{target?.name}" and its words will be gone for good.</p>
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              const id = confirmDelete!;
              setConfirmDelete(null);
              if (editingId === id) { setEditingId(null); editCustomPack(null); }
              deleteCustomPack(id);
            }}
          >
            Delete
          </button>
          <button className="btn btn-ghost btn-block" onClick={() => setConfirmDelete(null)}>
            Keep It
          </button>
        </div>
      </div>
    );
  }

  function handleCreate() {
    const name = `My Pack ${state.customPacks.length + 1}`;
    createCustomPack(name);
  }

  function handleAddWord() {
    if (!editing) return;
    addCustomWord(editing.id, draftWord);
    setDraftWord('');
  }

  if (editing) {
    return (
      <div className="screen custom-packs-screen">
        <div className="top-bar">
          <button className="icon-btn" onClick={() => { setEditingId(null); editCustomPack(null); }} aria-label="Back">
            <ArrowIcon size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2>Edit Pack</h2>
          <div style={{ width: 40 }} />
        </div>

        <div className="screen-body custom-pack-body">
          <input
            type="text"
            value={editing.name}
            maxLength={MAX_NAME_LENGTH}
            aria-label="Pack name"
            placeholder="Pack name"
            onChange={(e) => renameCustomPack(editing.id, e.target.value)}
          />

          <form
            className="word-add-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddWord();
            }}
          >
            <input
              type="text"
              value={draftWord}
              maxLength={MAX_WORD_LENGTH}
              aria-label="New word"
              placeholder="Add a word or phrase"
              onChange={(e) => setDraftWord(e.target.value)}
            />
            <button className="btn" type="submit" disabled={!draftWord.trim()} aria-label="Add word">
              <PlusIcon size={20} />
            </button>
          </form>

          <div className="field-label">{editing.words.length} in this pack</div>

          <div className="custom-word-list">
            {editing.words.length === 0 && (
              <p className="subtitle">
                Nothing here yet. Add a few words above — you'll need at least one to play.
              </p>
            )}
            {editing.words.map((word, i) => (
              <div className="custom-word-row" key={`${word}-${i}`}>
                <span>{word}</span>
                <button
                  className="icon-btn"
                  onClick={() => removeCustomWord(editing.id, i)}
                  aria-label={`Remove ${word}`}
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-actions">
          <button className="btn btn-danger" onClick={() => setConfirmDelete(editing.id)}>
            Delete Pack
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { setEditingId(null); editCustomPack(null); }}
          >
            Done
          </button>
        </div>

        {confirmDelete && renderDeleteConfirm()}
      </div>
    );
  }

  return (
    <div className="screen custom-packs-screen">
      <div className="top-bar">
        <button className="icon-btn" onClick={() => setScreen('pack-select')} aria-label="Back">
          <ArrowIcon size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <h2>Custom Packs</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="screen-body custom-pack-body">
        {state.customPacks.length === 0 && (
          <p className="subtitle">
            Make your own pack of words — inside jokes, family names, anything your crew will get.
          </p>
        )}

        <div className="custom-pack-list">
          {state.customPacks.map((pack) => (
            <div className="custom-pack-row" key={pack.id}>
              <button className="custom-pack-open" onClick={() => setEditingId(pack.id)}>
                <span className="custom-pack-name">{pack.name}</span>
                <span className="subtitle">
                  {pack.words.length} {pack.words.length === 1 ? 'word' : 'words'}
                </span>
              </button>
              <button
                className="icon-btn"
                onClick={() => setConfirmDelete(pack.id)}
                aria-label={`Delete ${pack.name}`}
              >
                <TrashIcon size={20} />
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn-block" onClick={handleCreate}>
          + New Pack
        </button>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => setScreen('pack-select')}>
        Done
      </button>

      {confirmDelete && renderDeleteConfirm()}
    </div>
  );
}
