import { useState } from 'react';
import {
  DEFAULT_TILT_DOWN_THRESHOLD,
  DEFAULT_TILT_UP_THRESHOLD,
  captureNeutralPitch,
  requestMotionPermission,
  useCalibrationReps,
} from '../lib/motion';
import { playTiltDownTone, playTiltUpTone } from '../lib/sound';
import { useOrientationLock } from '../lib/orientation';
import { Switch } from './Switch';
import { CheckIcon, ArrowIcon, CloseIcon } from './icons';

const REPS_NEEDED = 5;
const THRESHOLD_MARGIN = 0.6;
const THRESHOLD_MIN = 5;
const THRESHOLD_MAX = 85;

type Step = 'settings' | 'capturing' | 'levelling' | 'reps' | 'result' | 'error';

export interface TiltValues {
  up: number;
  down: number;
  neutral: number | null;
  preferButtons: boolean;
}

interface TiltCalibrationProps {
  values: TiltValues;
  onChange: (values: Partial<TiltValues>) => void;
  onClose: () => void;
}

function computeThreshold(peaks: number[]): number {
  if (peaks.length === 0) return DEFAULT_TILT_UP_THRESHOLD;
  const avg = peaks.reduce((a, b) => a + b, 0) / peaks.length;
  return Math.round(Math.max(THRESHOLD_MIN, Math.min(THRESHOLD_MAX, avg * THRESHOLD_MARGIN)));
}

/**
 * Tilt settings, with calibration as one option inside rather than the only way
 * in. The thresholds are plain numbers a player can nudge by hand and put back,
 * because a calibration run that lands badly should never be a dead end.
 */
export function TiltCalibration({ values, onChange, onClose }: TiltCalibrationProps) {
  // Pitch is read from a different sensor axis depending on screen rotation, so
  // calibration has to happen in the orientation the game is actually played in.
  useOrientationLock('landscape');
  const [step, setStep] = useState<Step>('settings');
  const [neutral, setNeutral] = useState<number | null>(null);
  const [upPeaks, setUpPeaks] = useState<number[]>([]);
  const [downPeaks, setDownPeaks] = useState<number[]>([]);
  const [awaiting, setAwaiting] = useState<'up' | 'down'>('up');
  const [before, setBefore] = useState<TiltValues | null>(null);

  // One rep is an up followed by a down, five times through -- alternating keeps
  // the phone moving the way it will during a real turn.
  useCalibrationReps(step === 'reps' && awaiting === 'up', 'up', neutral, (peak) => {
    playTiltUpTone();
    setUpPeaks((prev) => [...prev, peak]);
    setAwaiting('down');
  });

  useCalibrationReps(step === 'reps' && awaiting === 'down', 'down', neutral, (peak) => {
    playTiltDownTone();
    setDownPeaks((prev) => {
      const next = [...prev, peak];
      if (next.length >= REPS_NEEDED) setStep('result');
      else setAwaiting('up');
      return next;
    });
  });

  /**
   * Captures just the level ("forehead") position. The up/down angles are
   * measured *from* this, so if it's wrong every gesture has to travel too far
   * in one direction -- worth being able to reset on its own without redoing
   * the whole rep sequence.
   */
  async function setLevel() {
    setBefore({ ...values });
    setStep('levelling');
    const granted = await requestMotionPermission();
    if (!granted) { setStep('error'); return; }
    const value = await captureNeutralPitch(700);
    if (value === null) { setStep('error'); return; }
    onChange({ neutral: value });
    playTiltUpTone();
    setStep('settings');
  }

  async function startCalibration() {
    setBefore({ ...values });
    setStep('capturing');
    const granted = await requestMotionPermission();
    if (!granted) {
      setStep('error');
      return;
    }
    const value = await captureNeutralPitch(600);
    if (value === null) {
      setStep('error');
      return;
    }
    setNeutral(value);
    setUpPeaks([]);
    setDownPeaks([]);
    setAwaiting('up');
    setStep('reps');
  }

  const upThreshold = computeThreshold(upPeaks);
  const downThreshold = computeThreshold(downPeaks);
  const repsDone = downPeaks.length;

  function nudge(key: 'up' | 'down', delta: number) {
    const next = Math.max(THRESHOLD_MIN, Math.min(THRESHOLD_MAX, values[key] + delta));
    onChange({ [key]: next });
  }

  // Level is an absolute angle, not a threshold, so it wraps rather than clamps.
  function nudgeLevel(delta: number) {
    const current = values.neutral ?? 0;
    let next = current + delta;
    if (next > 180) next -= 360;
    if (next < -180) next += 360;
    onChange({ neutral: Math.round(next) });
  }

  return (
    <div className="modal-overlay" onClick={step === 'settings' ? onClose : undefined}>
      <div className="modal-card stack tilt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="top-bar">
          <h2>Tilt Controls</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close tilt settings">
            <CloseIcon size={20} />
          </button>
        </div>

        {step === 'settings' && (
          <div className="stack tilt-settings">
            <div className="toggle-row">
              <div className="field-label">Use on-screen buttons</div>
              <Switch
                on={values.preferButtons}
                label="Use on-screen buttons instead of tilting"
                onToggle={() => onChange({ preferButtons: !values.preferButtons })}
              />
            </div>
            <p className="subtitle">
              {values.preferButtons
                ? 'Correct and Skip buttons show during a turn instead of tilt.'
                : 'Tilt scores the round; buttons appear only if no sensor is found.'}
            </p>

            <div className="divider" />

            <div className="tilt-row">
              <div className="tilt-row-label">
                <CheckIcon size={18} color="#3ddc84" />
                <span>Tilt up</span>
              </div>
              <div className="dual-stepper compact">
                <button onClick={() => nudge('up', -1)} disabled={values.up <= THRESHOLD_MIN}>−</button>
                <span className="value">{values.up}°</span>
                <button onClick={() => nudge('up', 1)} disabled={values.up >= THRESHOLD_MAX}>+</button>
              </div>
            </div>

            <div className="tilt-row">
              <div className="tilt-row-label">
                <ArrowIcon size={18} />
                <span>Tilt down</span>
              </div>
              <div className="dual-stepper compact">
                <button onClick={() => nudge('down', -1)} disabled={values.down <= THRESHOLD_MIN}>−</button>
                <span className="value">{values.down}°</span>
                <button onClick={() => nudge('down', 1)} disabled={values.down >= THRESHOLD_MAX}>+</button>
              </div>
            </div>

            <div className="tilt-row">
              <div className="tilt-row-label">
                <span>Level</span>
              </div>
              <div className="dual-stepper compact">
                <button onClick={() => nudgeLevel(-1)}>−</button>
                <span className="value">
                  {values.neutral === null ? '—' : `${values.neutral.toFixed(0)}°`}
                </span>
                <button onClick={() => nudgeLevel(1)}>+</button>
              </div>
            </div>

            <p className="subtitle">
              Smaller angles trigger sooner. Up and down are measured from Level —
              {values.neutral === null
                ? ' unset, so tilt is measured from wherever the turn starts.'
                : ' hold the phone the way you play, then capture it below.'}
            </p>

            <button className="btn btn-primary btn-block" onClick={setLevel}>
              Set Level Position
            </button>
            <button className="btn btn-block" onClick={startCalibration}>
              Run Full Calibration
            </button>
            <button
              className="btn btn-block"
              onClick={() =>
                onChange({
                  up: DEFAULT_TILT_UP_THRESHOLD,
                  down: DEFAULT_TILT_DOWN_THRESHOLD,
                  neutral: null,
                })
              }
            >
              Reset to Defaults
            </button>
            {before && (
              <button className="btn btn-ghost btn-block" onClick={() => onChange({ ...before })}>
                Undo Last Calibration
              </button>
            )}
          </div>
        )}

        {step === 'levelling' && (
          <div className="stack">
            <p className="subtitle">
              Hold the phone against your forehead exactly as you'd play, and keep still…
            </p>
          </div>
        )}

        {step === 'capturing' && (
          <div className="stack">
            <p className="subtitle">
              Hold the phone against your forehead, screen facing out, and keep still…
            </p>
          </div>
        )}

        {step === 'reps' && (
          <div className="stack">
            <p className="subtitle">
              Keep it on your forehead. {awaiting === 'up' ? 'Tilt up' : 'Now tilt down'}, then back
              level. You'll hear a tone each time it registers — high for up, low for down.
            </p>
            <p className="calibration-progress">{repsDone} / {REPS_NEEDED}</p>
            <div className="calibration-results">
              <div className="calibration-result" style={{ opacity: awaiting === 'up' ? 1 : 0.3 }}>
                <CheckIcon size={20} color="#3ddc84" />
                <span>Up</span>
              </div>
              <div className="calibration-result" style={{ opacity: awaiting === 'down' ? 1 : 0.3 }}>
                <ArrowIcon size={20} />
                <span>Down</span>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="stack">
            <div className="calibration-results">
              <div className="calibration-result">
                <CheckIcon size={20} color="#3ddc84" />
                <span className="calibration-value">{upThreshold}°</span>
              </div>
              <div className="calibration-result">
                <ArrowIcon size={20} />
                <span className="calibration-value">{downThreshold}°</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                onChange({ up: upThreshold, down: downThreshold, neutral });
                setStep('settings');
              }}
            >
              Save
            </button>
            <button className="btn btn-block" onClick={startCalibration}>
              Redo
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setStep('settings')}>
              Discard
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="stack">
            <p className="subtitle">
              Couldn't read the tilt sensor — this device may not have one, or motion access was
              declined. You can still play with on-screen buttons.
            </p>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                onChange({ preferButtons: true });
                setStep('settings');
              }}
            >
              Use Buttons Instead
            </button>
            <button className="btn btn-block" onClick={() => setStep('settings')}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
