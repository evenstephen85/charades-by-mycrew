export function RotateDevicePrompt() {
  return (
    <div className="rotate-prompt" role="alert" aria-live="polite">
      <span className="icon" aria-hidden="true">📱</span>
      <h2>Rotate your device</h2>
      <p className="subtitle">
        This game is played in landscape — turn your phone sideways to continue.
      </p>
    </div>
  );
}
