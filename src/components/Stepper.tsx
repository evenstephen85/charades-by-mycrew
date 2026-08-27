interface StepperProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}

export function Stepper({ value, min, max, step = 1, format, onChange }: StepperProps) {
  return (
    <div className="stepper">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="value">{format ? format(value) : value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
