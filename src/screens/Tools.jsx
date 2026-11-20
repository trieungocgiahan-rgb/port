import { useState } from 'react';
import data from '../data.json';
import { useStore, go, daysUntil, relDays, fmtDate } from '../lib.jsx';
import { Modal, useToast, Icon } from '../components.jsx';

export function Tools() {
  const [toast, say] = useToast();
  return (
    <div className="page stack-lg">
      <header className="stack" style={{ gap: 4 }}>
        <h1>Tools</h1>
        <p className="muted small">Free tools for everyone. Plus tools come with any paid package.</p>
      </header>
      <div className="tool-grid">
        {data.tools.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`panel tool-card${t.ready ? '' : ' off'}`}
            onClick={() => (t.ready ? go(t.id) : say(`${t.name} is coming soon`))}
          >
            <div className="row between" style={{ width: '100%' }}>
              <span className="row" style={{ gap: 6 }}>
                <span className={`tag${t.tier === 'Plus' ? ' solid' : ''}`}>{t.tier}</span>
                {t.ai && <span className="tag">AI</span>}
              </span>
              {!t.ready && <span className="tag soon">Coming soon</span>}
            </div>
            <h3>{t.name}</h3>
            <p className="small muted">{t.text}</p>
            {t.ready && <span className="link small" style={{ marginTop: 'auto' }}>Open</span>}
          </button>
        ))}
      </div>
      {toast}
    </div>
  );
}

const STATUS = [
  { value: 'not', label: 'Not started' },
  { value: 'progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export function DeadlineTracker() {
  const { state, update } = useStore();
  const [adding, setAdding] = useState(false);
  const schools = [...state.schools].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const count = (v) => schools.filter((s) => s.status === v).length;
  const setStatus = (id, status) => update((s) => ({ schools: s.schools.map((x) => (x.id === id ? { ...x, status } : x)) }));

  return (
    <div className="page wide stack-lg">
      <header className="stack">
        <a href="#tools" className="back">All tools</a>
        <div className="row between" style={{ alignItems: 'flex-end' }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="row"><h1>Deadline tracker</h1><span className="tag">Free</span></div>
            <p className="small muted num">
              {schools.length} schools · {count('done')} done · {count('progress')} in progress · {count('not')} not started
            </p>
          </div>
          <button type="button" className="btn accent" onClick={() => setAdding(true)}>Add school</button>
        </div>
      </header>

      <div style={{ overflowX: 'auto' }}>
        <table className="tracker">
          <thead>
            <tr>
              <th>School</th>
              <th>Round</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => {
              const d = daysUntil(s.deadline);
              return (
                <tr key={s.id}>
                  <td className="c-name">
                    {s.name}
                    <span className="tiny muted" style={{ display: 'block', fontWeight: 400 }}>{s.country}</span>
                  </td>
                  <td className="c-round">{s.round}</td>
                  <td className="c-date num">
                    {fmtDate(new Date(`${s.deadline}T00:00:00`))}
                    <span className={`when${d <= 30 ? ' soon' : ''}`} style={{ display: 'block' }}>{relDays(d)}</span>
                  </td>
                  <td className="c-status">
                    <label className="visually-hidden" htmlFor={`st-${s.id}`} style={{ position: 'absolute', left: -9999 }}>Status for {s.name}</label>
                    <select id={`st-${s.id}`} className={`status ${s.status}`} value={s.status} onChange={(e) => setStatus(s.id, e.target.value)}>
                      {STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="tiny muted">Sample dates for the demo. The real tracker pulls deadlines from each school.</p>

      {adding && (
        <AddSchool
          onClose={() => setAdding(false)}
          onAdd={(row) => {
            update((s) => ({ schools: [...s.schools, { ...row, id: `s${Date.now()}`, status: 'not' }] }));
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function AddSchool({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('US');
  const [round, setRound] = useState('Regular Decision');
  const [deadline, setDeadline] = useState('2028-01-01');
  return (
    <Modal title="Add school" onClose={onClose}>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim() && deadline) onAdd({ name: name.trim(), country, round, deadline });
        }}
      >
        <div className="field">
          <label htmlFor="add-name">School</label>
          <input id="add-name" className="input" placeholder="For example, Waseda University" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="add-country">Country</label>
            <select id="add-country" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
              {['US', 'UK', 'Canada', 'Australia', 'Korea', 'Japan', 'Europe'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="add-round">Round</label>
            <select id="add-round" className="input" value={round} onChange={(e) => setRound(e.target.value)}>
              {['Early Action', 'Early Decision', 'Regular Decision', 'Rolling', 'Round 1', 'Round 2', 'Fall entry'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="add-date">Deadline</label>
            <input id="add-date" type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn accent block" disabled={!name.trim()}>Add to tracker</button>
      </form>
    </Modal>
  );
}

export function CssWalkthrough() {
  const { state, update } = useStore();
  const steps = data.cssSteps;
  const i = Math.min(state.cssStep, steps.length - 1);
  const step = steps[i];
  const doneCount = steps.filter((s) => state.cssDone[s.id]).length;
  const setStep = (n) => update({ cssStep: n });
  const markDone = () => {
    update((s) => ({ cssDone: { ...s.cssDone, [step.id]: true }, cssStep: Math.min(i + 1, steps.length - 1) }));
  };

  return (
    <div className="page wide stack-lg">
      <header className="stack">
        <a href="#tools" className="back">All tools</a>
        <div className="row"><h1>CSS Profile walkthrough</h1><span className="tag solid">Plus</span></div>
        <p className="small muted">The aid form most private US universities ask for. Unlocked for this demo. <span className="num">{doneCount} of {steps.length} steps done.</span></p>
      </header>

      <div className="css-layout">
        <nav aria-label="Walkthrough steps">
          <ol className="css-steps">
            {steps.map((s, n) => (
              <li key={s.id} className={state.cssDone[s.id] ? 'done' : ''}>
                <button type="button" aria-current={n === i ? 'step' : undefined} onClick={() => setStep(n)}>
                  <span className="n">{state.cssDone[s.id] ? <Icon name="check" size={12} /> : n + 1}</span>
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <section className="panel stack" style={{ padding: 20 }} aria-live="polite">
          <p className="eyebrow num">Step {i + 1} of {steps.length}</p>
          <h2>{step.title}</h2>
          <p>{step.intro}</p>
          <ul className="checklist">
            {step.items.map((it) => <li key={it}>{it}</li>)}
          </ul>
          {step.headsUp && (
            <div className="heads-up" role="note">
              <strong>Heads-up</strong>
              <span>{step.headsUp}</span>
            </div>
          )}
          <div className="row between" style={{ marginTop: 8 }}>
            <button type="button" className="btn ghost" disabled={i === 0} onClick={() => setStep(i - 1)}>Previous</button>
            {state.cssDone[step.id] && i === steps.length - 1 ? (
              <span className="tag accent">All done</span>
            ) : (
              <button type="button" className="btn accent" onClick={markDone}>
                {i === steps.length - 1 ? 'Mark as done' : 'Done, next step'}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
