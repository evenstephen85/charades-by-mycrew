import { useState } from 'react';
import { useGame } from '../state/GameContext';
import { RulesContent, AboutContent } from '../components/InfoContent';
import { TiltCalibration } from '../components/TiltCalibration';

/**
 * Shown once, on a genuinely fresh install: the house rules and who made this,
 * then straight into tilt calibration so the very first turn already reads the
 * player's own forehead position.
 *
 * Calibration is skippable. It needs a motion sensor, and on a desktop browser
 * or a phone that denies the permission there is nothing to capture -- refusing
 * to let those players past would lock them out of the game entirely.
 */
export function WelcomeScreen() {
  const { updateSettings } = useGame();
  const [calibrating, setCalibrating] = useState(false);

  function finish(tilt?: { up: number; down: number; neutral: number }) {
    updateSettings({
      onboarded: true,
      ...(tilt
        ? { tiltUpThreshold: tilt.up, tiltDownThreshold: tilt.down, tiltNeutral: tilt.neutral }
        : {}),
    });
  }

  return (
    <div className="screen welcome-screen">
      <h1 className="welcome-title">CHARADES</h1>

      <div className="screen-body welcome-body">
        <div className="card stack">
          <div className="field-label">How to Play</div>
          <RulesContent />
        </div>

        <div className="card stack">
          <div className="field-label">About MyCrew Gaming</div>
          <AboutContent />
        </div>
      </div>

      <button className="btn btn-primary btn-block btn-lg" onClick={() => setCalibrating(true)}>
        Set Up Tilt Controls
      </button>

      {calibrating && (
        <TiltCalibration
          onSave={(up, down, neutral) => finish({ up, down, neutral })}
          onClose={() => finish()}
        />
      )}
    </div>
  );
}
