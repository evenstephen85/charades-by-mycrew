import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { RulesContent, AboutContent } from '../components/InfoContent';
import { TiltCalibration } from '../components/TiltCalibration';

type Step = 'rules' | 'about' | 'tilt';

/**
 * Shown once, on a fresh install, one card at a time: the rules, who made this,
 * then tilt setup. Sequenced rather than stacked so nothing has to be scrolled
 * past to reach the button.
 *
 * Tilt setup is skippable. It needs a motion sensor, and on a desktop browser or
 * a phone that denies the permission there is nothing to capture -- refusing to
 * let those players past would lock them out of the game entirely.
 */
export function WelcomeScreen() {
  const { state, updateSettings } = useGame();
  const [step, setStep] = useState<Step>('rules');
  const { settings } = state;

  return (
    <div className="screen welcome-screen">
      <h1 className="welcome-title">CHARADES</h1>

      {step === 'rules' && (
        <>
          <div className="screen-body welcome-body">
            <div className="card stack">
              <div className="field-label">How to Play</div>
              <RulesContent />
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={() => setStep('about')}>
            Next
          </button>
        </>
      )}

      {step === 'about' && (
        <>
          <div className="screen-body welcome-body">
            <div className="card stack">
              <div className="field-label">About MyCrew Gaming</div>
              <AboutContent />
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={() => setStep('tilt')}>
            Next
          </button>
        </>
      )}

      {step === 'tilt' && (
        <TiltCalibration
          values={{
            up: settings.tiltUpThreshold,
            down: settings.tiltDownThreshold,
            neutral: settings.tiltNeutral,
            preferButtons: settings.preferButtons,
          }}
          onChange={(v) =>
            updateSettings({
              ...(v.up !== undefined ? { tiltUpThreshold: v.up } : {}),
              ...(v.down !== undefined ? { tiltDownThreshold: v.down } : {}),
              ...(v.neutral !== undefined ? { tiltNeutral: v.neutral } : {}),
              ...(v.preferButtons !== undefined ? { preferButtons: v.preferButtons } : {}),
            })
          }
          onClose={() => updateSettings({ onboarded: true })}
        />
      )}
    </div>
  );
}
