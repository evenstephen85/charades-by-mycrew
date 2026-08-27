import { useState } from 'react';
import { captureNeutralPitch, requestMotionPermission, useCalibrationReps } from '../lib/motion';
import { CheckIcon, ArrowIcon, CloseIcon } from './icons';

const REPS_NEEDED = 5;
const THRESHOLD_MARGIN = 0.6;
const THRESHOLD_MIN = 15;
const THRESHOLD_MAX = 85;

type Step = 'intro' | 'capturing' | 'up' | 'down' | 'result' | 'error';

interface TiltCalibrationProps {
  onSave: (upThreshold: number, downThreshold: number) => void;
  onClose: () => void;
}

function computeThreshold(peaks: number[]): number {
  if (peaks.length === 0) return THRESHOLD_MIN;
  const avg = peaks.reduce((a, b) => a + b, 0) / peaks.length;
  return Math.round(Math.max(THRESHOLD_MIN, Math.min(THRESHOLD_MAX, avg * THRESHOLD_MARGIN)));
}

export function TiltCalibration({ onSave, onClose }: TiltCalibrationProps) {
  const [step, setStep] = useState<Step>('intro');
  const [neutral, setNeutral] = useState<number | null>(null);
  const [upPeaks, setUpPeaks] = useState<number[]>([]);
  const [downPeaks, setDownPeaks] = useState<number[]>([]);

  useCalibrationReps(step === 'up', 'up', neutral, (peak) => {
    setUpPeaks((prev) => {
      const next = [...prev, peak];
      if (next.length >= REPS_NEEDED) setStep('down');
      return next;
    });
  });

  useCalibrationReps(step === 'down', 'down', neutral, (peak) => {
    setDownPeaks((prev) => {
      const next = [...prev, peak];
      if (next.length >= REPS_NEEDED) setStep('result');
      return next;
    });
  });

  async function handleStart() {
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
    setStep('up');
  }

  const upThreshold = computeThreshold(upPeaks);
  const downThreshold = computeThreshold(downPeaks);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card stack" onClick={(e) => e.stopPropagation()}>
        <div className="top-bar">
          <h2>Calibrate Tilt</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close calibration">
            <CloseIcon size={20} />
          </button>
        </div>

        {step === 'intro' && (
          <div className="stack">
            <p className="subtitle">
              Hold the phone flat against your forehead like you're about to play, screen facing out.
            </p>
            <button className="btn btn-primary btn-block" onClick={handleStart}>
              Start
            </button>
          </div>
        )}

        {step === 'capturing' && <p className="subtitle">Hold steady…</p>}

        {step === 'up' && (
          <div className="stack">
            <p className="subtitle">Tilt the phone up like a correct answer, then back level. Repeat 5 times.</p>
            <p className="calibration-progress">{upPeaks.length} / {REPS_NEEDED}</p>
          </div>
        )}

        {step === 'down' && (
          <div className="stack">
            <p className="subtitle">Now tilt the phone down like a skip, then back level. Repeat 5 times.</p>
            <p className="calibration-progress">{downPeaks.length} / {REPS_NEEDED}</p>
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
            <button className="btn btn-primary btn-block" onClick={() => onSave(upThreshold, downThreshold)}>
              Save
            </button>
            <button className="btn btn-block" onClick={handleStart}>
              Redo
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="stack">
            <p className="subtitle">
              Couldn't read the tilt sensor. Your device may not support motion controls.
            </p>
            <button className="btn btn-block" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
