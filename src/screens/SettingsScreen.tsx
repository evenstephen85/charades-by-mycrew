import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Switch } from '../components/Switch';
import { defaultTheme } from '../lib/storage';

const BG_PRESETS = ['#4a90d9', '#6fb1e8', '#2f6fb0', '#1b1033', '#1a1a1a', '#0b3d2e'];
const ACCENT_PRESETS = ['#ffffff', '#ffcc3d', '#3ddc84', '#ff5da2', '#ff9a3d', '#b985ff'];
const TILT_MIN = 20;
const TILT_MAX = 50;

export function SettingsScreen() {
  const { state, updateSettings, setScreen, closeSettings, pauseHome } = useGame();
  const { settings } = state;
  const [showBg, setShowBg] = useState(false);
  const [showAccent, setShowAccent] = useState(false);

  return (
    <div className="screen settings-screen">
      <div className="top-bar">
        <button className="icon-btn" onClick={closeSettings}>
          ← Back
        </button>
        <h2>Settings</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="card stack">
        <div className="toggle-row">
          <div className="field-label">Sound Effects</div>
          <Switch
            on={settings.soundEnabled}
            label="Toggle sound effects"
            onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          />
        </div>

        <div className="toggle-row">
          <div className="field-label">Tilt Sensitivity</div>
          <div className="dual-stepper">
            <button
              onClick={() =>
                updateSettings({ tiltThreshold: Math.max(TILT_MIN, settings.tiltThreshold - 5) })
              }
            >
              −
            </button>
            <span className="value">{settings.tiltThreshold}°</span>
            <button
              onClick={() =>
                updateSettings({ tiltThreshold: Math.min(TILT_MAX, settings.tiltThreshold + 5) })
              }
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="toggle-row">
          <div className="field-label">Background Color</div>
          <button
            className="color-swatch-btn"
            style={{ background: settings.theme.background }}
            onClick={() => setShowBg((v) => !v)}
            aria-label="Change background color"
          />
        </div>
        {showBg && (
          <div className="color-swatches">
            {BG_PRESETS.map((c) => (
              <button
                key={c}
                className={`color-swatch-btn ${settings.theme.background === c ? 'selected' : ''}`}
                style={{ background: c }}
                aria-label={`Background ${c}`}
                onClick={() => updateSettings({ theme: { ...settings.theme, background: c, surface: c } })}
              />
            ))}
            <input
              type="color"
              value={settings.theme.background}
              onChange={(e) =>
                updateSettings({
                  theme: { ...settings.theme, background: e.target.value, surface: e.target.value },
                })
              }
            />
          </div>
        )}
      </div>

      <div className="card stack">
        <div className="toggle-row">
          <div className="field-label">Accent Color</div>
          <button
            className="color-swatch-btn"
            style={{ background: settings.theme.accent }}
            onClick={() => setShowAccent((v) => !v)}
            aria-label="Change accent color"
          />
        </div>
        {showAccent && (
          <div className="color-swatches">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                className={`color-swatch-btn ${settings.theme.accent === c ? 'selected' : ''}`}
                style={{ background: c }}
                aria-label={`Accent ${c}`}
                onClick={() => updateSettings({ theme: { ...settings.theme, accent: c } })}
              />
            ))}
            <input
              type="color"
              value={settings.theme.accent}
              onChange={(e) => updateSettings({ theme: { ...settings.theme, accent: e.target.value } })}
            />
          </div>
        )}
        <button className="btn btn-ghost" onClick={() => updateSettings({ theme: defaultTheme })}>
          Reset to Default Colors
        </button>
      </div>

      <button className="btn btn-block" onClick={() => setScreen('team-setup')}>
        Manage Teams
      </button>

      {state.game && (
        <button className="btn btn-block" onClick={pauseHome}>
          Home
        </button>
      )}

      <button className="btn btn-primary btn-block" onClick={closeSettings}>
        Done
      </button>
    </div>
  );
}
