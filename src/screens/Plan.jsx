import data from '../data.json';
import { useStore, useProfile, stageFor, weekTasks, upcoming, suggestPackage, suggestReason, relDays, addDays, fmtShort, gradeLabel, countryName, listJoin, go } from '../lib.jsx';
import { Avatar, PackageCard } from '../components.jsx';

export default function Plan() {
  const { state, update } = useStore();
  const p = useProfile();
  const stage = stageFor(p.grade);
  const stageIdx = data.stages.findIndex((s) => s.id === stage);
  const tasks = weekTasks(p);
  const doneCount = tasks.filter((t) => state.tasksDone[t.id]).length;
  const items = upcoming(p);
  const pkg = suggestPackage(p);
  const booking = state.booking;
  const mentor = booking && data.mentors.find((m) => m.id === booking.mentorId);
  const slot = mentor && mentor.slots.find((s) => s.id === booking.slotId);
  const dest = p.destinations.filter((d) => d !== 'Unsure');

  const toggle = (id) => update((s) => ({ tasksDone: { ...s.tasksDone, [id]: !s.tasksDone[id] } }));

  return (
    <div className="page wide stack-lg">
      <header>
        <h1>Hi {p.name}, here's your plan</h1>
        <div className="meta">
          <span>{gradeLabel(p.grade)}</span>
          {p.city && <span>{p.city}</span>}
          <span>{dest.length ? `Aiming for ${listJoin(dest.map(countryName))}` : 'Still choosing countries'}</span>
        </div>
      </header>

      <section aria-labelledby="journey" className="stack">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2 id="journey" className="eyebrow">Your journey</h2>
          <span className="small muted">You're in <b style={{ color: 'var(--ink)' }}>{data.stages[stageIdx].label}</b></span>
        </div>
        <ol className="journey">
          {data.stages.map((s, i) => (
            <li key={s.id} className={i < stageIdx ? 'done' : i === stageIdx ? 'current' : ''} aria-current={i === stageIdx ? 'step' : undefined}>
              <span className="bar" />
              {s.label}
            </li>
          ))}
        </ol>
        <p className="small muted">{data.stages[stageIdx].text}</p>
      </section>

      <div className="plan-grid">
        <div className="stack-lg">
          <section className="panel" aria-labelledby="week">
            <div className="section-head">
              <h2 id="week">This week</h2>
              <span className="small muted num">{doneCount} of {tasks.length} done</span>
            </div>
            <ul className="tasks">
              {tasks.map((t) => {
                const done = !!state.tasksDone[t.id];
                return (
                  <li key={t.id} className={`task${done ? ' done' : ''}`}>
                    <input type="checkbox" id={`task-${t.id}`} checked={done} onChange={() => toggle(t.id)} />
                    <label htmlFor={`task-${t.id}`}>
                      <span className="t">{t.text}</span>
                      <span className="tiny muted" style={{ display: 'block' }}>{t.time}</span>
                    </label>
                    {t.link && (
                      <a href={`#${t.link}`} className="link small" style={{ flex: 'none' }}>Open</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="soon">
            <div className="section-head">
              <h2 id="soon">Coming up</h2>
              <a href="#tool-deadlines" className="link small">All deadlines</a>
            </div>
            <ul className="deadlines">
              {items.map((c) => (
                <li key={c.id}>
                  <div>
                    <div>{c.title}</div>
                    <div className="tiny muted">{fmtShort(addDays(c.inDays))}</div>
                  </div>
                  <span className={`when${c.inDays <= 21 ? ' soon' : ''}`}>{relDays(c.inDays)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="stack-lg">
          <section aria-labelledby="mentor" className="stack">
            <h2 id="mentor">Your mentor</h2>
            {mentor ? (
              <div className="panel stack">
                <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
                  <Avatar name={mentor.name} tint={mentor.tint} size={48} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{mentor.name}</div>
                    <div className="small muted">{mentor.school} · {mentor.major}</div>
                  </div>
                </div>
                <p className="small">First session: <b>{slot.day} {slot.date}, {slot.time}</b></p>
                <a href={`#mentor-${mentor.id}`} className="link small">View profile</a>
              </div>
            ) : (
              <div className="empty-mentor">
                <p>You don't have a mentor yet. We'll match you with a student who got in from a place like yours.</p>
                <button type="button" className="btn accent" onClick={() => go('mentors')}>Find a mentor</button>
              </div>
            )}
          </section>

          <section aria-labelledby="sugg" className="stack">
            <h2 id="sugg">Suggested for you</h2>
            <p className="small muted">{suggestReason(pkg, p)}</p>
            <PackageCard
              pkg={pkg}
              highlight="Fits your answers"
              action={
                <button type="button" className="btn" onClick={() => go(pkg.price === 0 ? 'profile-check' : 'packages')}>
                  {pkg.price === 0 ? 'Book it' : 'See package'}
                </button>
              }
            />
          </section>
        </div>
      </div>
    </div>
  );
}
