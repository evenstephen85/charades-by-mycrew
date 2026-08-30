interface SwitchProps {
  on: boolean;
  onToggle: () => void;
  label?: string;
  /** Opts out of the app-wide tap boop, for a control that makes its own sound. */
  noBoop?: boolean;
}

export function Switch({ on, onToggle, label, noBoop }: SwitchProps) {
  return (
    <button
      type="button"
      className={`switch ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-no-boop={noBoop ? '' : undefined}
      onClick={onToggle}
    >
      <span className="knob" />
    </button>
  );
}
