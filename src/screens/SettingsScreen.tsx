import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { Switch } from '../components/Switch';
import { defaultTheme } from '../lib/storage';
import { deriveThemeColors } from '../lib/color';
import { TEAM_COLORS } from '../lib/teamColors';
import { playBoop } from '../lib/sound';
import { ArrowIcon, CloseIcon, HomeIcon } from '../components/icons';
import { TiltCalibration } from '../components/TiltCalibration';
import { RulesContent, AboutContent } from '../components/InfoContent';

type PickerTarget = 'background' | 'accent' | null;
type InfoTarget = 'rules' | 'about' | null;

export function SettingsScreen() {
  const { state, updateSettings, setScreen, closeSettings, pauseHome } = useGame();
  const { settings } = state;
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [info, setInfo] = useState<InfoTarget>(null);

  function applyColor(hex: string) {
    if (picker === 'background') {
      updateSettings({ theme: { ...settings.theme, ...deriveThemeColors(hex) } });
    } else if (picker === 'accent') {
      updateSettings({ theme: { ...settings.theme, accent: hex } });
    }
  }

  function toggleSound() {
    const next = !settings.soundEnabled;
    // Confirms the change audibly when switching on. Switching off stays silent,
    // which is the whole point of switching off.
    if (next) playBoop();
    updateSettings({ soundEnabled: next });
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
          <div className="card setting-cell">
            <div className="field-label">Sound Effects</div>
            <Switch on={settings.soundEnabled} label="Toggle sound effects" noBoop onToggle={toggleSound} />
          </div>

          <div className="card setting-cell">
            <div className="field-label">Background Color</div>
            <button
              className="color-swatch-btn"
              style={{ background: settings.theme.background }}
              onClick={() => setPicker('background')}
              aria-label="Change background color"
            />
          </div>

          <div className="card setting-cell">
            <div className="field-label">Accent Color</div>
            <button
              className="color-swatch-btn"
              style={{ background: settings.theme.accent }}
              onClick={() => setPicker('accent')}
              aria-label="Change accent color"
            />
          </div>

          <button className="btn setting-cell" onClick={() => updateSettings({ theme: defaultTheme })}>
            Reset to Default Colors
          </button>

          <button className="btn setting-cell" onClick={() => setScreen('team-setup')}>
            Manage Teams
          </button>

          <button className="btn setting-cell" onClick={() => setCalibrating(true)}>
            Calibrate Tilt
          </button>

          <button className="btn setting-cell" onClick={() => setInfo('rules')}>
            Rules
          </button>

          <button className="btn setting-cell" onClick={() => setInfo('about')}>
            About
          </button>

          {/* Full width across whatever column count the grid is using. */}
          {state.game && (
            <button className="btn setting-cell setting-home" onClick={pauseHome}>
              <HomeIcon size={20} />
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
                  onClick={() => {
                    applyColor(c.hex);
                    setPicker(null);
                  }}
                />
              ))}
            </div>
            <label className="custom-color-row">
              <span className="field-label">Custom</span>
              <input
                type="color"
                value={current}
                aria-label="Custom color"
                onChange={(e) => applyColor(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      {info && (
        <div className="modal-overlay" onClick={() => setInfo(null)}>
          <div className="modal-card stack info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="top-bar">
              <h2>{info === 'rules' ? 'How to Play' : 'About MyCrew Gaming'}</h2>
              <button className="icon-btn" onClick={() => setInfo(null)} aria-label="Close">
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="info-scroll">{info === 'rules' ? <RulesContent /> : <AboutContent />}</div>
          </div>
        </div>
      )}

      {calibrating && (
        <TiltCalibration
          onSave={(up, down, neutral) => {
            updateSettings({ tiltUpThreshold: up, tiltDownThreshold: down, tiltNeutral: neutral });
            setCalibrating(false);
          }}
          onClose={() => setCalibrating(false)}
        />
      )}
    </div>
  );
}
