import { useGame } from '../state/GameContext';
import { Switch } from '../components/Switch';
import { defaultTheme } from '../lib/storage';
import { playFanfare } from '../lib/sound';

const BG_PRESETS = ['#4a90d9', '#6fb1e8', '#2f6fb0', '#1b1033', '#1a1a1a', '#0b3d2e'];
const ACCENT_PRESETS = ['#ffffff', '#ffcc3d', '#3ddc84', '#ff5da2', '#ff9a3d', '#b985ff'];

export function SettingsScreen() {
  const { state, updateSettings, setScreen } = useGame();
  const { settings } = state;

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="icon-btn" onClick={() => setScreen('welcome')}>← Back</button>
        <h2>Settings</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="card stack">
        <div className="toggle-row">
          <div>
            <div className="field-label">Sound Effects</div>
            <p className="subtitle">Countdown beeps, buzzer, drumroll &amp; fanfare</p>
          </div>
          <Switch
            on={settings.soundEnabled}
            label="Toggle sound effects"
            onToggle={() => {
              const next = !settings.soundEnabled;
              updateSettings({ soundEnabled: next });
              if (next) playFanfare();
            }}
          />
        </div>

        <div className="toggle-row">
          <div>
            <div className="field-label">Quick Start</div>
            <p className="subtitle">Show a one-tap "same as last time" button on setup</p>
          </div>
          <Switch
            on={settings.quickStart}
            label="Toggle quick start"
            onToggle={() => updateSettings({ quickStart: !settings.quickStart })}
          />
        </div>
      </div>

      <div className="card stack">
        <div className="field-label">Background Color</div>
        <div className="color-swatches">
          {BG_PRESETS.map((c) => (
            <button
              key={c}
              className={`color-swatch-btn ${settings.theme.background === c ? 'selected' : ''}`}
              style={{ background: c }}
              aria-label={`Background ${c}`}
              onClick={() =>
                updateSettings({ theme: { ...settings.theme, background: c, surface: c } })
              }
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
      </div>

      <div className="card stack">
        <div className="field-label">Accent / Text Color</div>
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
        <button
          className="btn btn-ghost"
          onClick={() => updateSettings({ theme: defaultTheme })}
        >
          Reset to Default Colors
        </button>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => setScreen('welcome')}>
        Done
      </button>
    </div>
  );
}
