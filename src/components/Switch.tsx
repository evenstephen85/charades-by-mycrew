interface SwitchProps {
  on: boolean;
  onToggle: () => void;
  label?: string;
}

export function Switch({ on, onToggle, label }: SwitchProps) {
  return (
    <button
      type="button"
      className={`switch ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
    >
      <span className="knob" />
    </button>
  );
}
