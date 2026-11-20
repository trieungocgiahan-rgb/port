import { useState } from 'react';
import data from '../data.json';
import { useStore, useProfile, defaultPrefs, matchMentors, whyLine, countryName, go } from '../lib.jsx';
import { Avatar, Icon } from '../components.jsx';

const STEPS = ['Preferences', 'Matches', 'Profile', 'Book'];
function Stepper({ at }) {
  return (
    <ol className="stepper" aria-label="Steps">
      {STEPS.map((s, i) => (
        <li key={s} className={i === at ? 'on' : i < at ? 'past' : ''} aria-current={i === at ? 'step' : undefined}>
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  );
}

function usePrefs() {
  const { state } = useStore();
  const profile = useProfile();
  return [state.prefs || defaultPrefs(profile), profile];
}

const LANGS = ['Any', 'Vietnamese', 'English', 'Hindi', 'Tamil', 'Arabic', 'Korean'];
const MAJORS = ['Any', 'Engineering', 'Computer science', 'Business', 'Medicine', 'Sciences', 'Arts', 'Social sciences'];
const COUNTRIES = ['Any', 'US', 'UK', 'Canada', 'Korea', 'Japan'];

/* Step 1 */
export function MentorPrefs() {
  const { state, update } = useStore();
  const [initial] = usePrefs();
  const [prefs, setPrefs] = useState(initial);
  const set = (k, v) => setPrefs({ ...prefs, [k]: v });
  const schoolOptions = [...new Set([...state.schools.map((s) => s.name), ...data.mentors.map((m) => m.school)])];
  const toggleSchool = (name) => set('schools', prefs.schools.includes(name) ? prefs.schools.filter((x) => x !== name) : [...prefs.schools, name]);

  return (
    <div className="page stack-lg">
      <div className="stack">
        <Stepper at={0} />
        <h1>Find a mentor</h1>
        <p className="muted">Tell us what matters to you. We filled in a few answers from your plan.</p>
      </div>

      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          update({ prefs });
          go('matches');
        }}
      >
        <div className="field">
          <label htmlFor="pref-country">Where they study</label>
          <select id="pref-country" className="input" value={prefs.country} onChange={(e) => set('country', e.target.value)}>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c === 'Any' ? 'Any country' : countryName(c).replace('the ', '')}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pref-lang">Language</label>
          <select id="pref-lang" className="input" value={prefs.language} onChange={(e) => set('language', e.target.value)}>
            {LANGS.map((l) => <option key={l} value={l}>{l === 'Any' ? 'Any language' : l}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pref-tz">Time zone</label>
          <select id="pref-tz" className="input" value={prefs.timezone} onChange={(e) => set('timezone', e.target.value)}>
            <option value="close">Close to mine (2 hours either way)</option>
            <option value="any">Any time zone</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pref-major">Their major</label>
          <select id="pref-major" className="input" value={prefs.major} onChange={(e) => set('major', e.target.value)}>
            {MAJORS.map((m) => <option key={m} value={m}>{m === 'Any' ? 'Any major' : m}</option>)}
          </select>
        </div>
        <div className="field full">
          <span className="label" id="pref-schools-label">Schools you're aiming for</span>
          <div className="chips" role="group" aria-labelledby="pref-schools-label" style={{ flexWrap: 'wrap' }}>
            {schoolOptions.map((s) => (
              <button key={s} type="button" className="chip" aria-pressed={prefs.schools.includes(s)} onClick={() => toggleSchool(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="field full">
          <div className="row between">
            <label htmlFor="pref-budget">Budget per session</label>
            <span className="num" style={{ fontWeight: 600 }}>{prefs.budget === 0 ? 'Free only' : `Up to $${prefs.budget}`}</span>
          </div>
          <input id="pref-budget" type="range" min="0" max="50" step="5" value={prefs.budget} onChange={(e) => set('budget', Number(e.target.value))} />
          <div className="row between tiny muted num"><span>$0</span><span>$50</span></div>
        </div>
        <div className="full">
          <button type="submit" className="btn accent block">Show my matches</button>
        </div>
      </form>
    </div>
  );
}

/* Step 2 */
export function MentorMatches() {
  const [prefs, profile] = usePrefs();
  const matches = matchMentors(prefs, profile);
  return (
    <div className="page stack-lg">
      <div className="stack">
        <Stepper at={1} />
        <h1>Your top 3 matches</h1>
        <p className="muted">
          Based on your preferences. <a href="#mentors" className="link">Change them</a>
        </p>
      </div>
      <div className="stack">
        {matches.map(({ mentor: m, reasons }, i) => (
          <article key={m.id} className="panel mentor-card">
            <div className="mentor-top">
              <Avatar name={m.name} tint={m.tint} size={64} />
              <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                <div className="row">
                  <h3>{m.name}</h3>
                  {i === 0 && <span className="tag accent">Best match</span>}
                </div>
                <div className="small">{m.school} · {m.major}</div>
                <div className="small muted">From {m.from}</div>
              </div>
            </div>
            <dl className="facts">
              <dt>Speaks</dt><dd>{m.languages.join(', ')}</dd>
              <dt>Price</dt><dd className="num">${m.price} per session{m.price > prefs.budget ? <span className="muted"> (over your budget)</span> : null}</dd>
              <dt>Rating</dt><dd className="num">{m.rating.toFixed(1)} from {m.reviewCount} reviews</dd>
            </dl>
            <p className="why"><b>Why we matched you:</b> {whyLine(reasons)}</p>
            <button type="button" className={`btn ${i === 0 ? 'accent' : 'ghost'}`} onClick={() => go(`mentor-${m.id}`)}>View profile</button>
          </article>
        ))}
      </div>
    </div>
  );
}

/* Step 3 */
export function MentorProfile({ id }) {
  const { state, update } = useStore();
  const m = data.mentors.find((x) => x.id === id);
  const [slot, setSlot] = useState(state.pendingSlot && m?.slots.some((s) => s.id === state.pendingSlot) ? state.pendingSlot : null);
  if (!m) return <NotFound />;
  const days = [...new Set(m.slots.map((s) => `${s.day}, ${s.date}`))];

  return (
    <div className="page stack-lg">
      <div className="stack">
        <Stepper at={2} />
        <a href="#matches" className="back">Back to matches</a>
      </div>
      <header className="mentor-top">
        <Avatar name={m.name} tint={m.tint} size={80} />
        <div className="stack" style={{ gap: 4, minWidth: 0 }}>
          <h1>{m.name}</h1>
          <div>{m.school} · {m.year}</div>
          <div className="small muted">{m.major} · From {m.from}</div>
          <div className="row small" style={{ gap: 12 }}>
            <span className="row num" style={{ gap: 4 }}><Icon name="star" size={14} fill="currentColor" /> {m.rating.toFixed(1)} ({m.reviewCount})</span>
            <span className="num">${m.price} per session</span>
            <span>{m.languages.join(', ')}</span>
          </div>
        </div>
      </header>

      <section className="stack">
        <h2>About</h2>
        <p style={{ maxWidth: '62ch' }}>{m.bio}</p>
      </section>

      <section className="stack">
        <h2>What {m.first} helps with</h2>
        <ul className="checklist">
          {m.helpsWith.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </section>

      <section className="stack">
        <h2>Reviews</h2>
        {m.reviews.map((r) => (
          <blockquote key={r.name} className="panel" style={{ margin: 0 }}>
            <p>{r.text}</p>
            <footer className="small muted" style={{ marginTop: 6 }}>{r.name}</footer>
          </blockquote>
        ))}
      </section>

      <section className="stack">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2>Available times</h2>
          <span className="tiny muted">45 minutes · your local time</span>
        </div>
        {days.map((d) => (
          <div key={d} className="stack" style={{ gap: 6 }}>
            <div className="small muted">{d}</div>
            <div className="slots">
              {m.slots.filter((s) => `${s.day}, ${s.date}` === d).map((s) => (
                <button key={s.id} type="button" className="slot" aria-pressed={slot === s.id} onClick={() => setSlot(s.id)}>
                  <div className="t">{s.time}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn accent block"
          disabled={!slot}
          onClick={() => {
            update({ pendingSlot: slot });
            go(`book-${m.id}`);
          }}
        >
          {slot ? 'Continue to booking' : 'Pick a time to continue'}
        </button>
      </section>
    </div>
  );
}

/* Step 4 */
export function Booking({ id }) {
  const { state, update } = useStore();
  const m = data.mentors.find((x) => x.id === id);
  const slot = m && m.slots.find((s) => s.id === state.pendingSlot);
  if (!m) return <NotFound />;
  if (!slot) {
    return (
      <div className="page stack">
        <p>Pick a time first.</p>
        <a href={`#mentor-${m.id}`} className="link">Back to {m.first}'s times</a>
      </div>
    );
  }
  return (
    <div className="page stack-lg">
      <div className="stack">
        <Stepper at={3} />
        <a href={`#mentor-${m.id}`} className="back">Change time</a>
        <h1>Check your booking</h1>
      </div>
      <div className="panel stack">
        <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
          <Avatar name={m.name} tint={m.tint} size={48} />
          <div>
            <div style={{ fontWeight: 600 }}>{m.name}</div>
            <div className="small muted">{m.school} · {m.major}</div>
          </div>
        </div>
        <hr className="divider" />
        <dl className="summary">
          <dt>When</dt><dd>{slot.day}, {slot.date} at {slot.time}</dd>
          <dt>Length</dt><dd>45 minutes, video call</dd>
          <dt>Language</dt><dd>{m.languages[0]}</dd>
          <dt>Price</dt><dd className="num">${m.price}</dd>
        </dl>
      </div>
      <p className="note">You won't pay anything now. Payment comes later, after {m.first} confirms the time.</p>
      <button
        type="button"
        className="btn accent block"
        onClick={() => {
          update({ booking: { mentorId: m.id, slotId: slot.id } });
          go('booked');
        }}
      >
        Confirm booking
      </button>
    </div>
  );
}

export function Booked() {
  const { state } = useStore();
  const b = state.booking;
  const m = b && data.mentors.find((x) => x.id === b.mentorId);
  const slot = m && m.slots.find((s) => s.id === b.slotId);
  if (!slot) return <NotFound />;
  return (
    <div className="page stack-lg">
      <div className="stack" style={{ gap: 16, alignItems: 'flex-start' }}>
        <span className="confirm-mark"><Icon name="check" size={24} /></span>
        <h1>You're booked with {m.first}, {slot.day} {slot.time}</h1>
        <p className="muted">{slot.day}, {slot.date} · 45 minutes · ${m.price}, paid later</p>
      </div>
      <section className="stack">
        <h2>What happens next</h2>
        <ol className="checklist">
          <li>{m.first} confirms within 24 hours.</li>
          <li>You get a video link by email the day before.</li>
          <li>Bring your plan and one question you're stuck on.</li>
        </ol>
      </section>
      <div className="row">
        <button type="button" className="btn accent" onClick={() => go('plan')}>Back to My Plan</button>
        <button type="button" className="btn ghost" onClick={() => go('community')}>Visit the community</button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page stack">
      <p>That page doesn't exist in the prototype.</p>
      <a href="#mentors" className="link">Find a mentor</a>
    </div>
  );
}
