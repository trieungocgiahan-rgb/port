import { useEffect, useState } from 'react';
import data from '../data.json';
import { useStore, useProfile, go, daysUntil, relDays } from '../lib.jsx';
import { Icon } from '../components.jsx';

/* The prototype has no real AI. Each "review" is a set of plain rules run on what the
   student typed, so results change with the input and feel real in a demo. */

const LEVELS = {
  strong: { label: 'Strong', cls: 'lvl-strong' },
  ok: { label: 'Getting there', cls: 'lvl-ok' },
  weak: { label: 'Needs work', cls: 'lvl-weak' },
};
function Level({ level }) {
  const l = LEVELS[level];
  return <span className={`lvl ${l.cls}`}>{l.label}</span>;
}

function Thinking({ lines, onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const ts = lines.map((_, i) => setTimeout(() => setN(i + 1), 450 * (i + 1)));
    const end = setTimeout(onDone, 450 * lines.length + 350);
    return () => {
      ts.forEach(clearTimeout);
      clearTimeout(end);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="panel building" style={{ padding: 20, maxWidth: 'none', margin: 0 }} aria-live="polite">
      <ul>
        {lines.map((l, i) => (
          <li key={l} className={i < n ? 'done' : ''}>
            <span className="dot">{i < n && <Icon name="check" size={11} />}</span>
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolHead({ title, tier, intro }) {
  return (
    <header className="stack">
      <a href="#tools" className="back">All tools</a>
      <div className="row">
        <h1>{title}</h1>
        <span className="tag">AI</span>
        <span className={`tag${tier === 'Plus' ? ' solid' : ''}`}>{tier}</span>
      </div>
      <p className="small muted" style={{ maxWidth: '62ch' }}>{intro}</p>
    </header>
  );
}

const DemoNote = () => (
  <p className="tiny muted">Prototype: this feedback comes from simple rules, not a real AI. The live version uses AI, then a mentor checks it.</p>
);

/* ---------------- Essay review ---------------- */
const CLICHES = [
  { phrase: 'ever since i was young', tip: 'Start inside a moment instead. Your flood story is a much stronger first line.' },
  { phrase: 'ever since i was a child', tip: 'Start inside a moment instead of a summary of your childhood.' },
  { phrase: 'change the world', tip: 'Too big to believe. Name the one small thing you want to change.' },
  { phrase: 'passionate about', tip: 'Readers see this phrase thousands of times. Show what you did instead.' },
  { phrase: 'taught me that', tip: 'Let the story carry the lesson. Cut the line that explains it.' },
  { phrase: 'comfort zone', tip: 'A stock phrase. Describe what actually felt hard.' },
  { phrase: 'in today\'s society', tip: 'Generic opener. Cut it.' },
];
const TELL = ['hardworking', 'dedicated', 'motivated', 'determined', 'curious', 'responsible'];

export function analyzeEssay(text, limit) {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const words = clean ? clean.split(/\s+/).length : 0;
  const paras = clean.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  const long = sentences.filter((s) => s.split(/\s+/).length > 35);
  const cliches = CLICHES.filter((c) => lower.includes(c.phrase));
  const tells = TELL.filter((w) => new RegExp(`\\b${w}\\b`).test(lower));
  const details = (clean.match(/\b\d[\d,.]*\b/g) || []).length;

  const voiceIssues = cliches.length + tells.length;
  const rubric = [
    { area: 'Specific details', level: details >= 4 ? 'strong' : details >= 2 ? 'ok' : 'weak',
      note: details >= 4 ? `You use real numbers and names (${details} found). Admissions readers remember these.` : 'Add numbers, places and names. They make a story believable.' },
    { area: 'Your own voice', level: voiceIssues === 0 ? 'strong' : voiceIssues <= 2 ? 'ok' : 'weak',
      note: voiceIssues === 0 ? 'Sounds like you, with no stock phrases.' : `${voiceIssues} stock phrase${voiceIssues === 1 ? '' : 's'} or self-labels. They sound like every other essay.` },
    { area: 'Structure', level: paras >= 4 ? 'strong' : paras >= 2 ? 'ok' : 'weak',
      note: paras >= 4 ? `${paras} paragraphs with a clear before, during and after.` : 'Break it into paragraphs: the moment, what you did, what changed.' },
    { area: 'Clear sentences', level: long.length === 0 ? 'strong' : long.length <= 2 ? 'ok' : 'weak',
      note: long.length === 0 ? 'Sentences are easy to follow.' : `${long.length} sentence${long.length === 1 ? ' is' : 's are'} over 35 words. Split ${long.length === 1 ? 'it' : 'them'}.` },
    { area: 'Length', level: words === 0 ? 'weak' : words > limit ? 'weak' : words >= limit * 0.6 ? 'strong' : 'ok',
      note: words > limit ? `${words - limit} words over the ${limit}-word limit.` : `${words} of ${limit} words. ${words < limit * 0.6 ? 'You have room for one more scene.' : 'Good length.'}` },
  ];

  // One note per sentence; a sentence with several problems gets all its tips together.
  const notes = [];
  const add = (quote, tip) => {
    if (!quote) return;
    const found = notes.find((n) => n.quote === quote);
    if (found) found.tips.push(tip);
    else notes.push({ quote, tips: [tip] });
  };
  cliches.forEach((c) => add(sentences.find((x) => x.toLowerCase().includes(c.phrase)), c.tip));
  tells.forEach((w) => add(sentences.find((x) => new RegExp(`\\b${w}\\b`, 'i').test(x)), `Don't tell the reader you're ${w}. Show it with something you did.`));
  long.forEach((q) => add(q, 'Long sentence. Split it into two or three so the moment lands.'));

  const strong = rubric.filter((r) => r.level === 'strong').length;
  const summary =
    strong >= 4 ? 'A strong draft with a real story. Polish the notes below and it is ready for a mentor.'
      : strong >= 2 ? `A good story underneath. Fix ${notes.length || 'a few'} thing${notes.length === 1 ? '' : 's'} below before you send it to a mentor.`
        : 'Early draft. Pick one moment and tell it in detail before polishing anything else.';
  return { words, rubric, notes, summary, marks: [...cliches.map((c) => c.phrase), ...tells] };
}

function Highlighted({ text, marks }) {
  if (!marks.length) return <p className="essay-text">{text}</p>;
  const re = new RegExp(`(${marks.map((m) => m.replace(/[.*+?^${}()|[\]\\']/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <p className="essay-text">
      {parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p))}
    </p>
  );
}

export function EssayReview() {
  const { state, update } = useStore();
  const draft = state.essay || { text: data.sampleEssay, prompt: 'challenge' };
  const [text, setText] = useState(draft.text);
  const [prompt, setPrompt] = useState(draft.prompt);
  const [phase, setPhase] = useState(state.essay?.ran ? 'done' : 'edit');
  const limit = data.essayPrompts.find((p) => p.id === prompt).limit;
  const result = analyzeEssay(phase === 'edit' ? text : draft.text, limit);
  const liveWords = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="page wide stack-lg">
      <ToolHead title="AI essay review" tier="Plus" intro="Paste your draft and get notes in seconds. Then send it to a mentor for a human read. Linh's first draft is filled in as an example." />

      {phase === 'edit' && (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            update({ essay: { text, prompt, ran: false } });
            setPhase('thinking');
          }}
        >
          <div className="field">
            <label htmlFor="essay-prompt">Essay prompt</label>
            <select id="essay-prompt" className="input" value={prompt} onChange={(e) => setPrompt(e.target.value)}>
              {data.essayPrompts.map((p) => <option key={p.id} value={p.id}>{p.label} ({p.limit} words)</option>)}
            </select>
          </div>
          <div className="field">
            <div className="row between">
              <label htmlFor="essay-text">Your draft</label>
              <span className={`tiny num ${liveWords > limit ? '' : 'muted'}`} style={liveWords > limit ? { color: 'var(--warn-ink)', fontWeight: 600 } : undefined}>{liveWords} / {limit} words</span>
            </div>
            <textarea id="essay-text" className="input essay-input" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="row">
            <button type="submit" className="btn accent" disabled={liveWords < 30}>Review my essay</button>
            {text !== data.sampleEssay && <button type="button" className="link small" onClick={() => setText(data.sampleEssay)}>Use the example draft</button>}
          </div>
        </form>
      )}

      {phase === 'thinking' && (
        <Thinking
          lines={['Reading your draft', 'Checking voice and stock phrases', 'Looking at structure and length', 'Writing your notes']}
          onDone={() => {
            update((s) => ({ essay: { ...s.essay, ran: true } }));
            setPhase('done');
          }}
        />
      )}

      {phase === 'done' && (
        <>
          <section className="panel stack" style={{ padding: 20 }}>
            <p className="eyebrow">Summary</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{result.summary}</p>
            <ul className="rubric">
              {result.rubric.map((r) => (
                <li key={r.area}>
                  <div className="row between"><b>{r.area}</b><Level level={r.level} /></div>
                  <p className="small muted">{r.note}</p>
                </li>
              ))}
            </ul>
          </section>

          {result.notes.length > 0 && (
            <section className="stack">
              <h2>Notes on your draft</h2>
              {result.notes.map((n, i) => (
                <div key={i} className="note-card">
                  <q className="small">{n.quote}</q>
                  {n.tips.map((t) => <p key={t} className="small">{t}</p>)}
                </div>
              ))}
            </section>
          )}

          <section className="stack">
            <h2>Your draft</h2>
            <div className="panel"><Highlighted text={draft.text} marks={result.marks} /></div>
          </section>

          <section className="panel stack">
            <h3>Want a person to read it?</h3>
            <p className="small muted">A mentor in your major gives 3 rounds of written feedback, each within 48 hours.</p>
            <div className="row">
              <button type="button" className="btn accent" onClick={() => go('packages')}>See Essay Review package</button>
              <button type="button" className="btn ghost" onClick={() => setPhase('edit')}>Edit and review again</button>
            </div>
          </section>
          <DemoNote />
        </>
      )}
    </div>
  );
}

/* ---------------- Profile review ---------------- */
export function analyzeProfile(input, schools) {
  const gpa = parseFloat(input.gpa);
  const sat = parseInt(input.sat, 10);
  const ielts = parseFloat(input.ielts);
  const acts = input.activities.split('\n').map((s) => s.trim()).filter(Boolean);
  const awards = input.awards.split('\n').map((s) => s.trim()).filter(Boolean);
  const leads = acts.filter((a) => /\b(lead|leader|founder|founded|captain|president|started|head)\b/i.test(a));
  const impact = acts.filter((a) => /\d/.test(a));

  const areas = [
    { area: 'Grades', level: gpa >= 9 ? 'strong' : gpa >= 8 ? 'ok' : 'weak',
      note: Number.isNaN(gpa) ? 'Add your GPA.' : gpa >= 9 ? `${gpa}/10 is competitive for most of your schools.` : `${gpa}/10 is solid. Keep Grade 11 and 12 grades rising; the trend matters.` },
    { area: 'Test scores', level: sat >= 1500 && ielts >= 7.5 ? 'strong' : sat >= 1400 || ielts >= 7 ? 'ok' : 'weak',
      note: `${Number.isNaN(sat) ? 'No SAT' : `SAT ${sat}`}, ${Number.isNaN(ielts) ? 'no IELTS' : `IELTS ${ielts}`}. ${sat >= 1500 ? 'Strong for engineering.' : 'One more SAT attempt could move several schools up a band.'}` },
    { area: 'Activities', level: acts.length >= 4 && leads.length && impact.length >= 2 ? 'strong' : acts.length >= 3 ? 'ok' : 'weak',
      note: `${acts.length} activities, ${leads.length} with a leadership role, ${impact.length} with numbers that show impact.${impact.length < acts.length ? ' Add numbers to the rest.' : ''}` },
    { area: 'Awards', level: awards.some((a) => /national|international|olympiad/i.test(a)) ? 'ok' : awards.length ? 'ok' : 'weak',
      note: awards.length ? `${awards.length} award${awards.length === 1 ? '' : 's'}. A national-level result would make this strong, but it isn't required.` : 'No awards yet. Not required, but one competition in your field helps.' },
  ];

  const strengths = [];
  if (impact.length) strengths.push(`Real impact you can count: "${impact[0]}"`);
  if (leads.length) strengths.push(`Leadership: "${leads[0]}"`);
  if (gpa >= 8.5) strengths.push(`Strong grades (${gpa}/10)`);
  const gaps = areas.filter((a) => a.level !== 'strong').map((a) => a.area);

  const fit = schools.map((s) => {
    if (!s.sat || Number.isNaN(sat)) return { ...s, band: 'unknown' };
    let band = sat >= s.sat[1] ? 'Likely' : sat >= s.sat[0] ? 'Target' : 'Reach';
    if (s.admitRate < 20 && band !== 'Reach') band = band === 'Likely' ? 'Target' : 'Reach';
    return { ...s, band };
  });

  let satTip = null;
  const reachable = fit.filter((s) => s.band === 'Reach' && s.sat && s.sat[0] > sat && s.sat[0] - sat <= 80 && s.admitRate >= 20);
  if (reachable.length) satTip = `Raising your SAT to ${reachable[0].sat[0]} would move ${reachable[0].name} from reach to target.`;
  else if (!Number.isNaN(sat) && sat < 1500) satTip = `A SAT of ${Math.min(1600, sat + 60)} would make you more competitive at every school on your list.`;

  return { areas, strengths, gaps, fit, satTip };
}

export function ProfileReview() {
  const { state, update } = useStore();
  const [input, setInput] = useState(state.profileInput || data.sampleProfile);
  const [phase, setPhase] = useState(state.profileRan ? 'done' : 'edit');
  const set = (k, v) => setInput({ ...input, [k]: v });
  const result = analyzeProfile(state.profileInput || input, state.schools);

  return (
    <div className="page wide stack-lg">
      <ToolHead title="AI profile review" tier="Free" intro="See where you stand and how each school on your list looks for you. Linh's profile is filled in as an example." />

      {phase === 'edit' && (
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            update({ profileInput: input, profileRan: false });
            setPhase('thinking');
          }}
        >
          <div className="field">
            <label htmlFor="pr-gpa">GPA (out of 10)</label>
            <input id="pr-gpa" className="input num" inputMode="decimal" value={input.gpa} onChange={(e) => set('gpa', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pr-sat">SAT (leave empty if none)</label>
            <input id="pr-sat" className="input num" inputMode="numeric" value={input.sat} onChange={(e) => set('sat', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pr-ielts">IELTS</label>
            <input id="pr-ielts" className="input num" inputMode="decimal" value={input.ielts} onChange={(e) => set('ielts', e.target.value)} />
          </div>
          <div className="field full">
            <label htmlFor="pr-acts">Activities, one per line</label>
            <textarea id="pr-acts" className="input" value={input.activities} onChange={(e) => set('activities', e.target.value)} />
          </div>
          <div className="field full">
            <label htmlFor="pr-awards">Awards, one per line</label>
            <textarea id="pr-awards" className="input" style={{ minHeight: 72 }} value={input.awards} onChange={(e) => set('awards', e.target.value)} />
          </div>
          <div className="full"><button type="submit" className="btn accent">Review my profile</button></div>
        </form>
      )}

      {phase === 'thinking' && (
        <Thinking
          lines={['Reading your grades and scores', 'Looking at your activities', `Comparing with ${state.schools.length} schools on your list`]}
          onDone={() => {
            update({ profileRan: true });
            setPhase('done');
          }}
        />
      )}

      {phase === 'done' && (
        <>
          <section className="panel stack" style={{ padding: 20 }}>
            <p className="eyebrow">Your profile by area</p>
            <ul className="rubric">
              {result.areas.map((r) => (
                <li key={r.area}>
                  <div className="row between"><b>{r.area}</b><Level level={r.level} /></div>
                  <p className="small muted">{r.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="two-col">
            <section className="stack">
              <h2>What stands out</h2>
              <ul className="checklist">{result.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
            </section>
            <section className="stack">
              <h2>What to work on</h2>
              <ul className="checklist">
                {result.satTip && <li>{result.satTip}</li>}
                {result.gaps.includes('Activities') && <li>Add a number to every activity: hours, people helped, things built.</li>}
                {result.gaps.includes('Awards') && <li>Enter one competition in your field this year.</li>}
                {result.gaps.includes('Grades') && <li>Keep this year's grades at or above last year's.</li>}
              </ul>
            </section>
          </div>

          <section className="stack">
            <div className="section-head"><h2>Your school list</h2><a href="#tool-deadlines" className="link small">Edit list</a></div>
            <ul className="deadlines">
              {result.fit.map((s) => (
                <li key={s.id}>
                  <div>
                    <div>{s.name}</div>
                    <div className="tiny muted num">{s.sat ? `Typical SAT ${s.sat[0]}–${s.sat[1]} · ${s.admitRate}% admitted` : 'No data yet for this school'}</div>
                  </div>
                  <span className={`band band-${s.band.toLowerCase()}`}>{s.band === 'unknown' ? 'Unknown' : s.band}</span>
                </li>
              ))}
            </ul>
            <p className="tiny muted">Sample ranges for the demo.</p>
          </section>

          <div className="row">
            <button type="button" className="btn accent" onClick={() => go('tool-full')}>Run full check-up</button>
            <button type="button" className="btn ghost" onClick={() => setPhase('edit')}>Edit profile</button>
          </div>
          <DemoNote />
        </>
      )}
    </div>
  );
}

/* ---------------- Full check-up ---------------- */
export function FullReview() {
  const { state } = useStore();
  const profile = useProfile();
  const [phase, setPhase] = useState('start');

  const essay = state.essay?.ran ? analyzeEssay(state.essay.text, data.essayPrompts.find((p) => p.id === state.essay.prompt).limit) : null;
  const prof = state.profileRan ? analyzeProfile(state.profileInput, state.schools) : null;
  const pct = (lvls) => Math.round((lvls.reduce((n, l) => n + (l === 'strong' ? 1 : l === 'ok' ? 0.6 : 0.2), 0) / lvls.length) * 100);
  const schools = state.schools;
  const started = schools.filter((s) => s.status !== 'not').length;
  const cssDone = data.cssSteps.filter((s) => state.cssDone[s.id]).length;
  const needsAid = profile.aid !== 'no';
  const next = [...schools].filter((s) => s.status !== 'done').sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  const bands = prof ? prof.fit.reduce((m, s) => ({ ...m, [s.band]: (m[s.band] || 0) + 1 }), {}) : null;

  const areas = [
    { id: 'profile', name: 'Profile', score: prof ? pct(prof.areas.map((a) => a.level)) : null, link: 'tool-profile', action: prof ? 'Review again' : 'Run profile review',
      detail: prof ? `Strongest: ${prof.areas.filter((a) => a.level === 'strong').map((a) => a.area).join(', ') || 'none yet'}.` : 'Not reviewed yet.' },
    { id: 'essay', name: 'Main essay', score: essay ? pct(essay.rubric.map((r) => r.level)) : null, link: 'tool-essay', action: essay ? 'Open notes' : 'Run essay review',
      detail: essay ? `${essay.notes.length} note${essay.notes.length === 1 ? '' : 's'} to fix, ${essay.words} words.` : 'Not reviewed yet.' },
    { id: 'list', name: 'School list', score: Math.min(100, Math.round((schools.length / 8) * 100)), link: 'tool-deadlines', action: 'Add schools',
      detail: bands ? `${schools.length} schools: ${bands.Reach || 0} reach, ${bands.Target || 0} target, ${bands.Likely || 0} likely.${!bands.Likely ? ' Add at least one likely school.' : ''}` : `${schools.length} schools. Aim for 8 to 12.` },
    { id: 'deadlines', name: 'Applications', score: Math.round((schools.reduce((n, s) => n + (s.status === 'done' ? 1 : s.status === 'progress' ? 0.5 : 0), 0) / Math.max(schools.length, 1)) * 100), link: 'tool-deadlines', action: 'Open tracker',
      detail: `${started} of ${schools.length} started.${next ? ` Next: ${next.name}, ${relDays(daysUntil(next.deadline))}.` : ''}` },
    needsAid && { id: 'aid', name: 'Financial aid', score: Math.round((cssDone / data.cssSteps.length) * 100), link: 'tool-css', action: 'Continue CSS Profile',
      detail: `CSS Profile: ${cssDone} of ${data.cssSteps.length} steps done.` },
    { id: 'mentor', name: 'Mentor', score: state.booking ? 100 : 0, link: 'mentors', action: state.booking ? 'View booking' : 'Find a mentor',
      detail: state.booking ? 'First session booked.' : 'No mentor yet.' },
  ].filter(Boolean);
  const scored = areas.map((a) => ({ ...a, s: a.score ?? 0 }));
  const overall = Math.round(scored.reduce((n, a) => n + a.s, 0) / scored.length);
  const priorities = [...scored].sort((a, b) => a.s - b.s).slice(0, 3);

  if (phase === 'start') {
    return (
      <div className="page wide stack-lg">
        <ToolHead title="Full application check-up" tier="Plus" intro="One report that reads everything you've done so far: profile, essay, school list, deadlines, aid and mentor." />
        <section className="panel stack">
          <h3>What goes into the report</h3>
          <ul className="checklist small">
            <li>Profile review {prof ? <b>(done)</b> : <span className="muted">(not run yet, <a className="link" href="#tool-profile">run it</a> for a fuller report)</span>}</li>
            <li>Essay review {essay ? <b>(done)</b> : <span className="muted">(not run yet, <a className="link" href="#tool-essay">run it</a> for a fuller report)</span>}</li>
            <li>{schools.length} schools in your deadline tracker</li>
            {needsAid && <li>CSS Profile progress</li>}
            <li>Your plan and mentor</li>
          </ul>
          <div><button type="button" className="btn accent" onClick={() => setPhase('thinking')}>Run full check-up</button></div>
        </section>
      </div>
    );
  }
  if (phase === 'thinking') {
    return (
      <div className="page wide stack-lg">
        <ToolHead title="Full application check-up" tier="Plus" intro="Reading everything you've done so far." />
        <Thinking lines={['Reading your profile and essay', 'Checking your school list and deadlines', needsAid ? 'Checking your aid forms' : 'Checking your plan', 'Choosing your top 3 priorities']} onDone={() => setPhase('done')} />
      </div>
    );
  }
  return (
    <div className="page wide stack-lg">
      <ToolHead title="Full application check-up" tier="Plus" intro={`${profile.name}, here's where your application stands today.`} />
      <section className="panel stack" style={{ padding: 20 }}>
        <div className="row between" style={{ alignItems: 'baseline' }}>
          <p className="eyebrow">Overall readiness</p>
          <span className="num" style={{ fontSize: '2rem', fontWeight: 700 }}>{overall}%</span>
        </div>
        <div className="meter"><span style={{ width: `${overall}%` }} /></div>
        <p className="small muted">
          {overall >= 70 ? 'On track. Keep going at this pace.' : overall >= 40 ? 'A good start. The 3 priorities below will move you the most.' : 'Early days. Start with the 3 priorities below.'}
          {next ? ` Your first deadline is ${relDays(daysUntil(next.deadline))}.` : ''}
        </p>
      </section>

      <section className="stack">
        <h2>Top 3 priorities</h2>
        <ol className="prio">
          {priorities.map((a, i) => (
            <li key={a.id} className="panel">
              <span className="n">{i + 1}</span>
              <div className="stack" style={{ gap: 4, minWidth: 0 }}>
                <b>{a.name}</b>
                <p className="small muted">{a.detail}</p>
                <a href={`#${a.link}`} className="link small">{a.action}</a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="stack">
        <h2>Every area</h2>
        <ul className="areas">
          {areas.map((a) => (
            <li key={a.id}>
              <div className="row between"><b>{a.name}</b><span className="num small">{a.score === null ? 'Not checked' : `${a.score}%`}</span></div>
              <div className="meter thin"><span style={{ width: `${a.score ?? 0}%` }} /></div>
              <p className="small muted">{a.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <div className="row">
        <button type="button" className="btn accent" onClick={() => go('mentors')}>Go through it with a mentor</button>
        <button type="button" className="btn ghost" onClick={() => setPhase('start')}>Run again</button>
      </div>
      <DemoNote />
    </div>
  );
}
