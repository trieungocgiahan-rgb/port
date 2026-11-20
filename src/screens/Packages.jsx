import { useState } from 'react';
import data from '../data.json';
import { useStore, go } from '../lib.jsx';
import { Modal, PackageCard, useToast, Icon } from '../components.jsx';

export function Packages() {
  const { state, update } = useStore();
  const [chosen, setChosen] = useState(null);
  const [toast, say] = useToast();
  const now = data.packages.filter((p) => p.status === 'now');
  const later = data.packages.filter((p) => p.status === '2027');

  return (
    <div className="page wide stack-lg">
      <header className="stack">
        <h1>Packages</h1>
        <p className="muted" style={{ maxWidth: '60ch' }}>Pay for the help you need, when you need it. Every package comes with the free tools and community.</p>
      </header>

      <section className="stack">
        <h2>Available now</h2>
        <div className="pkg-grid three">
          {now.map((p) => (
            <PackageCard
              key={p.id}
              pkg={p}
              action={
                <button type="button" className="btn" onClick={() => (p.price === 0 ? go('profile-check') : setChosen(p))}>
                  {p.price === 0 ? 'Book free' : 'Choose'}
                </button>
              }
            />
          ))}
        </div>
      </section>

      <section className="stack">
        <h2>Opens 2027</h2>
        <div className="pkg-grid three">
          {later.map((p) => {
            const on = !!state.waitlist[p.id];
            return (
              <PackageCard
                key={p.id}
                pkg={p}
                action={
                  <button
                    type="button"
                    className="btn ghost"
                    aria-pressed={on}
                    onClick={() => {
                      update((s) => ({ waitlist: { ...s.waitlist, [p.id]: !on } }));
                      if (!on) say(`You're on the waitlist for ${p.name}`);
                    }}
                  >
                    {on ? 'On the waitlist' : 'Join waitlist'}
                  </button>
                }
              />
            );
          })}
        </div>
      </section>

      {chosen && (
        <Modal title={chosen.name} onClose={() => setChosen(null)}>
          <p>{chosen.outcome}</p>
          <dl className="summary">
            <dt>Price</dt><dd className="num">{chosen.priceLabel}</dd>
            <dt>Starts</dt><dd>As soon as you're matched with a mentor</dd>
          </dl>
          <p className="note">This is a prototype, so there's no checkout yet. In the real product you'd pay here.</p>
          <button
            type="button"
            className="btn accent block"
            onClick={() => {
              setChosen(null);
              go('mentors');
            }}
          >
            Continue to find a mentor
          </button>
        </Modal>
      )}
      {toast}
    </div>
  );
}

const CHECK_SLOTS = [
  { id: 'c1', day: 'Thursday', time: '17:00' },
  { id: 'c2', day: 'Saturday', time: '10:00' },
  { id: 'c3', day: 'Sunday', time: '15:30' },
];

export function ProfileCheck() {
  const pkg = data.packages.find((p) => p.id === 'profile-check');
  const [slot, setSlot] = useState(null);
  const [sent, setSent] = useState(false);
  const chosen = CHECK_SLOTS.find((s) => s.id === slot);

  if (sent) {
    return (
      <div className="page stack-lg">
        <div className="stack" style={{ gap: 16, alignItems: 'flex-start' }}>
          <span className="confirm-mark"><Icon name="check" size={24} /></span>
          <h1>Your free profile check is booked for {chosen.day} at {chosen.time}</h1>
          <p className="muted">A mentor will look at your answers before the call and send you a one-page summary after it.</p>
        </div>
        <div className="row">
          <button type="button" className="btn accent" onClick={() => go('quiz')}>Answer the 7 questions now</button>
          <button type="button" className="btn ghost" onClick={() => go('plan')}>Go to My Plan</button>
        </div>
      </div>
    );
  }
  return (
    <div className="page stack-lg">
      <header className="stack">
        <a href="#packages" className="back">All packages</a>
        <h1>Free profile check</h1>
        <p className="muted" style={{ maxWidth: '60ch' }}>{pkg.outcome} {pkg.for}</p>
      </header>
      <section className="stack">
        <h2>Pick a time</h2>
        <div className="slots">
          {CHECK_SLOTS.map((s) => (
            <button key={s.id} type="button" className="slot" aria-pressed={slot === s.id} onClick={() => setSlot(s.id)}>
              <div className="d">{s.day}</div>
              <div className="t">{s.time}</div>
            </button>
          ))}
        </div>
        <p className="tiny muted">20 minutes, video call, in your local time.</p>
      </section>
      <button type="button" className="btn accent block" disabled={!slot} onClick={() => setSent(true)}>
        Book my free check
      </button>
    </div>
  );
}
