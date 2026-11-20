import { useEffect, useRef, useState } from 'react';
import data from '../data.json';
import { go, useStore, listJoin, countryName } from '../lib.jsx';
import { Icon } from '../components.jsx';

const QUESTIONS = data.quiz;

export default function Quiz() {
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ destinations: [], city: '' });
  const [building, setBuilding] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const q = QUESTIONS[step];
  const value = answers[q?.id];
  const answered = q && (q.type === 'multi' ? value && value.length > 0 : !!value);

  const finish = (final) => {
    update({ answers: final, tasksDone: {}, booking: null, prefs: null });
    setBuilding(true);
  };
  const next = (a = answers) => {
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else finish(a);
  };
  const choose = (opt) => {
    if (q.type === 'multi') {
      let list = value || [];
      if (opt === 'Unsure') list = list.includes('Unsure') ? [] : ['Unsure'];
      else list = list.includes(opt) ? list.filter((x) => x !== opt) : [...list.filter((x) => x !== 'Unsure'), opt];
      setAnswers({ ...answers, [q.id]: list });
      return;
    }
    const a = { ...answers, [q.id]: opt };
    setAnswers(a);
    if (!q.withCity) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => next(a), 220);
    }
  };
  const useDemo = () => {
    const s = data.student;
    finish({ grade: s.grade, country: s.country, city: s.city, counselor: s.counselor, destinations: s.destinations, interest: s.interest, aid: s.aid, budget: s.budget });
  };

  if (building) return <Building answers={answers} />;

  const pct = Math.round((step / QUESTIONS.length) * 100);
  return (
    <div className="quiz">
      <div className="quiz-top">
        <div className="row between">
          {step === 0 ? (
            <a href="#" className="back">Cancel</a>
          ) : (
            <button type="button" className="back" onClick={() => setStep(step - 1)}>Back</button>
          )}
          <span className="small muted num">{step + 1} of {QUESTIONS.length}</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label="Quiz progress">
          <span style={{ width: `${Math.max(pct, 4)}%` }} />
        </div>
      </div>

      <div className="quiz-body">
        <div className="stack" style={{ gap: 6 }}>
          <h1>{q.question}</h1>
          {q.hint && <p className="muted">{q.hint}</p>}
        </div>

        <div className="options">
          {q.options.map((o) => {
            const on = q.type === 'multi' ? (value || []).includes(o.value) : value === o.value;
            return (
              <button key={o.value} type="button" className={`option${q.type === 'multi' ? ' multi' : ''}`} aria-pressed={on} onClick={() => choose(o.value)}>
                <span>
                  {o.label}
                  {o.detail && <span className="detail">{o.detail}</span>}
                </span>
                <span className="check">{on && <Icon name="check" size={12} />}</span>
              </button>
            );
          })}
        </div>

        {q.withCity && (
          <div className="field">
            <label htmlFor="quiz-city">City (optional)</label>
            <input id="quiz-city" className="input" placeholder="For example, Hanoi" value={answers.city} onChange={(e) => setAnswers({ ...answers, city: e.target.value })} />
          </div>
        )}

        <div className="quiz-foot">
          {step === 0 ? (
            <button type="button" className="link small" onClick={useDemo}>Skip and use Linh's answers</button>
          ) : (
            <span />
          )}
          <button type="button" className="btn accent" disabled={!answered} onClick={() => next()}>
            {step === QUESTIONS.length - 1 ? 'Build my plan' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Building({ answers }) {
  const dest = (answers.destinations && answers.destinations.length ? answers.destinations : data.student.destinations).filter((d) => d !== 'Unsure');
  const lines = [
    dest.length ? `Finding deadlines for ${listJoin(dest.map(countryName))}` : 'Finding deadlines for popular countries',
    'Picking your tasks for this week',
    'Choosing a package that fits your budget',
  ];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const ts = lines.map((_, i) => setTimeout(() => setDone(i + 1), 550 * (i + 1)));
    const end = setTimeout(() => go('plan'), 550 * lines.length + 500);
    return () => {
      ts.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="quiz">
      <div className="building">
        <h1>Building your plan…</h1>
        <ul>
          {lines.map((l, i) => (
            <li key={l} className={i < done ? 'done' : ''}>
              <span className="dot">{i < done && <Icon name="check" size={11} />}</span>
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
