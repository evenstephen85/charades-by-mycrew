import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Switch } from '../components/Switch';
import { defaultTheme } from '../lib/storage';
import { deriveThemeColors } from '../lib/color';
import { TEAM_COLORS } from '../lib/teamColors';
import { ArrowIcon } from '../components/icons';
import { TiltCalibration } from '../components/TiltCalibration';

export function SettingsScreen() {
  const { state, updateSettings, setScreen, closeSettings, pauseHome } = useGame();
  const { settings } = state;
  const [showBg, setShowBg] = useState(false);
  const [showAccent, setShowAccent] = useState(false);
  const [calibrating, setCalibrating] = useState(false);

  return (
    <div className="screen settings-screen">
      <div className="top-bar">
        <button className="icon-btn" onClick={closeSettings} aria-label="Back">
          <ArrowIcon size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <h2>Settings</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="screen-body">
      <div className="settings-columns">
        <div className="settings-column stack">
          <div className="card stack">
            <div className="toggle-row">
              <div className="field-label">Sound Effects</div>
              <Switch
                on={settings.soundEnabled}
                label="Toggle sound effects"
                onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              />
            </div>

            <div className="divider" />

            <div className="field-label">Tilt Sensitivity</div>
            <div className="tilt-values">
              <span>Up {settings.tiltUpThreshold}°</span>
              <span>Down {settings.tiltDownThreshold}°</span>
            </div>
            <button className="btn btn-block" onClick={() => setCalibrating(true)}>
              Calibrate Tilt
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
        </div>

        <div className="settings-column stack">
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
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    className={`color-swatch-btn ${settings.theme.background === c.hex ? 'selected' : ''}`}
                    style={{ background: c.hex }}
                    aria-label={`Background ${c.name}`}
                    onClick={() =>
                      updateSettings({ theme: { ...settings.theme, ...deriveThemeColors(c.hex) } })
                    }
                  />
                ))}
                <input
                  type="color"
                  value={settings.theme.background}
                  onChange={(e) =>
                    updateSettings({ theme: { ...settings.theme, ...deriveThemeColors(e.target.value) } })
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
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    className={`color-swatch-btn ${settings.theme.accent === c.hex ? 'selected' : ''}`}
                    style={{ background: c.hex }}
                    aria-label={`Accent ${c.name}`}
                    onClick={() => updateSettings({ theme: { ...settings.theme, accent: c.hex } })}
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
        </div>
      </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={closeSettings}>
        Done
      </button>

      {calibrating && (
        <TiltCalibration
          onSave={(up, down) => {
            updateSettings({ tiltUpThreshold: up, tiltDownThreshold: down });
            setCalibrating(false);
          }}
          onClose={() => setCalibrating(false)}
        />
      )}
    </div>
  );
}
