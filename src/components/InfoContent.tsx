import { CheckIcon, ArrowIcon } from './icons';

/**
 * The house rules and the studio blurb, written once and shown in two places:
 * the first-run sequence and the Rules / About entries in Settings.
 */
export function RulesContent() {
  return (
    <div className="info-body">
      <p>
        It's the <strong>opposite</strong> of charades. Hold the phone to your forehead, screen
        facing out. Everyone else sees the word and acts it out — you guess.
      </p>

      <div className="info-rule">
        <CheckIcon size={20} color="#3ddc84" />
        <span>
          <strong>Tilt up</strong> when you get it.
        </span>
      </div>
      <div className="info-rule">
        <ArrowIcon size={20} />
        <span>
          <strong>Tilt down</strong> to skip.
        </span>
      </div>

      <p>Most words when the timer ends wins.</p>
    </div>
  );
}

export function AboutContent() {
  return (
    <div className="info-body">
      <p>
        <strong>MyCrew Gaming</strong> makes free games for people in the same room.
      </p>
      <p>No ads. Nothing to buy. Funded entirely by donations.</p>
    </div>
  );
}
