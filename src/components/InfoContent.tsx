import { CheckIcon, ArrowIcon } from './icons';

/**
 * The house rules and the studio blurb, written once and shown in two places:
 * the first-run welcome screen and the Rules / About entries in Settings.
 */
export function RulesContent() {
  return (
    <div className="info-body">
      <p>
        It's the <strong>opposite</strong> of charades. One player holds the phone against their
        forehead with the screen facing out, so everyone else can see the word. They act it out —
        the person holding the phone is the one guessing.
      </p>

      <div className="info-rule">
        <CheckIcon size={20} color="#3ddc84" />
        <span>
          <strong>Tilt the phone up</strong> when they guess it. That's a point.
        </span>
      </div>
      <div className="info-rule">
        <ArrowIcon size={20} />
        <span>
          <strong>Tilt the phone down</strong> to skip a word you'd rather not act out.
        </span>
      </div>

      <p>
        Keep going until the timer runs out, then pass the phone to the next team. Whoever has the
        most words at the end of the last round wins.
      </p>
      <p className="subtitle">
        No sensor on your device? On-screen Correct and Skip buttons appear instead.
      </p>
    </div>
  );
}

export function AboutContent() {
  return (
    <div className="info-body">
      <p>
        <strong>MyCrew Gaming</strong> is all about fun. We make free, ad-free games designed to be
        played together, in the same room, with the people you're already with.
      </p>
      <p>No ads. No purchases to unlock anything. Just the game.</p>
      <p>
        We're run entirely on donations from people who enjoy what we make. If this game got your
        crew laughing, that's the whole point.
      </p>
    </div>
  );
}
