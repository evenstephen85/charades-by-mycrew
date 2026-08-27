/**
 * Blocks the screen with a rotate message when a phone-sized viewport is in
 * portrait. Orientation locking (useOrientationLock) is best-effort — it
 * works reliably on native iOS/Android but many mobile browsers (notably
 * iOS Safari) never honor a lock request — so this is the fallback that
 * actually forces the point across for screens that need landscape.
 */
export function LandscapeGate() {
  return (
    <div className="landscape-gate">
      <div className="landscape-gate-icon" aria-hidden="true" />
      <h2>Rotate to landscape</h2>
      <p className="subtitle">This screen needs your phone turned sideways.</p>
    </div>
  );
}
