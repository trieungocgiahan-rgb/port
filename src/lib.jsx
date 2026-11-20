import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import data from './data.json';

/* ---------- Routing: plain #names, e.g. #plan, #mentor-minh ---------- */
export function useRoute() {
  const read = () => decodeURIComponent(window.location.hash.slice(1));
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
export const go = (name) => {
  window.location.hash = name;
};

/* ---------- Demo state (kept in this browser only) ---------- */
const KEY = 'common-room-demo-v1';
const fresh = () => ({
  answers: null, // filled by the quiz; null means "use Linh's defaults"
  tasksDone: {},
  schools: data.schools,
  cssStep: 0,
  cssDone: {},
  myPosts: [],
  liked: {},
  prefs: null,
  booking: null,
  waitlist: {},
  essay: null,
  profileInput: null,
  profileRan: false,
});
function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch (e) {
    /* storage unavailable: start fresh */
  }
  return fresh();
}

const Store = createContext(null);
export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }, [state]);
  const update = useCallback((patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);
  const reset = useCallback(() => setState(fresh()), []);
  return <Store.Provider value={{ state, update, reset }}>{children}</Store.Provider>;
}
export const useStore = () => useContext(Store);

/* ---------- Derived student profile ---------- */
export function useProfile() {
  const { state } = useStore();
  const a = state.answers || {};
  const s = data.student;
  const pick = (k) => (a[k] !== undefined && a[k] !== '' ? a[k] : s[k]);
  const destinations = a.destinations && a.destinations.length ? a.destinations : s.destinations;
  const country = pick('country');
  const city = state.answers ? (a.city || '').trim() : s.city;
  return {
    name: s.name,
    grade: pick('grade'),
    country,
    city: city || (country === 'Other' ? '' : country),
    destinations,
    counselor: pick('counselor'),
    interest: pick('interest'),
    aid: pick('aid'),
    budget: pick('budget'),
    tzOffset: s.tzOffset,
  };
}

export const gradeLabel = (g) => (g === 'gap' ? 'Gap year' : `Grade ${g}`);

const COUNTRY_NAMES = { US: 'the US', UK: 'the UK', Korea: 'Korea', Japan: 'Japan', Canada: 'Canada', Australia: 'Australia', Europe: 'Europe', Unsure: 'Not sure yet' };
export const countryName = (c) => COUNTRY_NAMES[c] || c;
export function listJoin(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function stageFor(grade) {
  if (grade === '9' || grade === '10') return 'discover';
  if (grade === '11') return 'build';
  return 'apply';
}

/* "in 6 weeks" style labels */
export function relDays(days) {
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 14) return `in ${days} days`;
  if (days < 63) return `in ${Math.round(days / 7)} weeks`;
  const m = Math.round(days / 30.4);
  return `in ${m} month${m === 1 ? '' : 's'}`;
}
export function daysUntil(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${isoDate}T00:00:00`);
  return Math.round((d - today) / 86400000);
}
export function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
export const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtShort = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/* ---------- Plan logic ---------- */
export function weekTasks(profile) {
  const stage = stageFor(profile.grade);
  const needsAid = profile.aid === 'yes' || profile.aid === 'some';
  return data.tasks.filter((t) => t.stage === stage && (!t.aid || needsAid)).slice(0, 4);
}
export function upcoming(profile) {
  return data.comingUp
    .filter((c) => c.countries.includes('all') || c.countries.some((x) => profile.destinations.includes(x)))
    .sort((a, b) => a.inDays - b.inDays)
    .slice(0, 4);
}
export function suggestPackage(profile) {
  const now = data.packages.filter((p) => p.status === 'now');
  const score = (p) => {
    const f = p.fit || {};
    let s = 0;
    if (f.budget && f.budget.includes(profile.budget)) s += 2;
    if (f.aid && f.aid.includes(profile.aid)) s += 3;
    if (f.grade && f.grade.includes(profile.grade)) s += f.gradeWeight || 1;
    if (profile.budget === 'free' && p.price > 0) s -= 10;
    return s;
  };
  return [...now].sort((a, b) => score(b) - score(a))[0];
}
export function suggestReason(pkg, profile) {
  const bits = [];
  if (pkg.fit?.aid?.includes(profile.aid)) bits.push('you need financial aid');
  if (pkg.fit?.grade?.includes(profile.grade)) bits.push(`you're in ${gradeLabel(profile.grade)}`);
  if (profile.budget === 'free') bits.push('you asked for free help only');
  else if (pkg.fit?.budget?.includes(profile.budget)) bits.push(profile.budget === 'little' ? 'it fits a small budget' : 'you want regular help');
  return bits.length ? `Because ${listJoin(bits)}.` : 'A good first step for most students.';
}

/* ---------- Mentor matching ---------- */
const NATIVE = { Vietnam: 'Vietnamese', India: 'Hindi', UAE: 'Arabic' };
export function defaultPrefs(profile) {
  return {
    country: profile.destinations.find((d) => data.mentors.some((m) => m.studyCountry === d)) || 'Any',
    language: NATIVE[profile.country] || 'English',
    timezone: 'close',
    major: profile.interest === 'Unsure' ? 'Any' : profile.interest,
    schools: [],
    budget: profile.budget === 'free' ? 15 : profile.budget === 'little' ? 30 : 50,
  };
}
export function matchMentors(prefs, profile) {
  const scored = data.mentors.map((m) => {
    const reasons = [];
    let score = 0;
    if (prefs.major !== 'Any' && m.field === prefs.major) { score += 4; reasons.push('Same major'); }
    if (prefs.language !== 'Any' && m.languages.includes(prefs.language)) { score += 4; reasons.push(`speaks ${prefs.language}`); }
    if (m.slots.some((s) => s.day === 'Saturday' || s.day === 'Sunday')) { score += 1; reasons.push('free on weekends'); }
    if (m.fromCountry === profile.country) { score += 2; reasons.push(`from ${profile.country} too`); }
    if (prefs.schools.includes(m.school)) { score += 3; reasons.push(`goes to ${m.school}, on your list`); }
    else if (prefs.country !== 'Any' && m.studyCountry === prefs.country) { score += 3; reasons.push(`studies in ${countryName(m.studyCountry)}`); }
    else if (profile.destinations.includes(m.studyCountry)) { score += 2; reasons.push(`studies in ${countryName(m.studyCountry)}, one of your picks`); }
    const tzGap = Math.abs(m.tzOffset - profile.tzOffset);
    if (prefs.timezone === 'close' && tzGap <= 2) { score += 2; reasons.push('almost the same time zone'); }
    if (m.price <= prefs.budget) score += 2;
    else score -= 3;
    return { mentor: m, score, reasons };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
export function whyLine(reasons) {
  const r = reasons.slice(0, 3);
  if (!r.length) return 'Closest match to your preferences';
  const s = r.join(', ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
