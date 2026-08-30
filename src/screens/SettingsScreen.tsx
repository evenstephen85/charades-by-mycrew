import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Switch } from '../components/Switch';
import { defaultTheme } from '../lib/storage';
import { deriveThemeColors } from '../lib/color';
import { TEAM_COLORS } from '../lib/teamColors';
import { ArrowIcon, CloseIcon } from '../components/icons';
import { TiltCalibration } from '../components/TiltCalibration';

type PickerTarget = 'background' | 'accent' | null;

export function SettingsScreen() {
  const { state, updateSettings, setScreen, closeSettings, pauseHome } = useGame();
  const { settings } = state;
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [calibrating, setCalibrating] = useState(false);

  function choose(hex: string) {
    if (picker === 'background') {
      updateSettings({ theme: { ...settings.theme, ...deriveThemeColors(hex) } });
    } else if (picker === 'accent') {
      updateSettings({ theme: { ...settings.theme, accent: hex } });
    }
    setPicker(null);
  }

  // The two theme colours must stay distinguishable, so whichever one is in use
  // for the other role is simply not offered.
  const excluded = (
    picker === 'background' ? settings.theme.accent : picker === 'accent' ? settings.theme.background : ''
  ).toLowerCase();
  const choices = TEAM_COLORS.filter((c) => c.hex.toLowerCase() !== excluded);
  const current = picker === 'background' ? settings.theme.background : settings.theme.accent;

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
        <div className="settings-grid">
          <div className="card setting-row">
            <div className="field-label">Sound Effects</div>
            <Switch
              on={settings.soundEnabled}
              label="Toggle sound effects"
              onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            />
          </div>

          <div className="card setting-row">
            <div className="field-label">Background Color</div>
            <button
              className="color-swatch-btn"
              style={{ background: settings.theme.background }}
              onClick={() => setPicker('background')}
              aria-label="Change background color"
            />
          </div>

          <div className="card setting-row">
            <div className="field-label">Accent Color</div>
            <button
              className="color-swatch-btn"
              style={{ background: settings.theme.accent }}
              onClick={() => setPicker('accent')}
              aria-label="Change accent color"
            />
          </div>

          <button className="btn btn-block" onClick={() => updateSettings({ theme: defaultTheme })}>
            Reset to Default Colors
          </button>

          <button className="btn btn-block" onClick={() => setScreen('team-setup')}>
            Manage Teams
          </button>

          <button className="btn btn-block" onClick={() => setCalibrating(true)}>
            Calibrate Tilt
          </button>

          {state.game && (
            <button className="btn btn-block" onClick={pauseHome}>
              Home
            </button>
          )}
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={closeSettings}>
        Done
      </button>

      {picker && (
        <div className="modal-overlay" onClick={() => setPicker(null)}>
          <div className="modal-card stack" onClick={(e) => e.stopPropagation()}>
            <div className="top-bar">
              <h2>{picker === 'background' ? 'Background Color' : 'Accent Color'}</h2>
              <button className="icon-btn" onClick={() => setPicker(null)} aria-label="Close">
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="color-swatches">
              {choices.map((c) => (
                <button
                  key={c.hex}
                  className={`color-swatch-btn ${current.toLowerCase() === c.hex.toLowerCase() ? 'selected' : ''}`}
                  style={{ background: c.hex }}
                  aria-label={c.name}
                  onClick={() => choose(c.hex)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
