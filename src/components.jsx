import { useEffect, useState } from 'react';
import data from './data.json';
import { useStore, go } from './lib.jsx';

/* Simple line icons, drawn inline so there are no external assets. */
const paths = {
  plan: 'M5 4h14v16H5z M9 9h6 M9 13h6 M9 17h3',
  tools: 'M4 6h16 M4 12h16 M4 18h16 M8 4v4 M15 10v4 M11 16v4',
  community: 'M4 5h16v11H9l-5 4z',
  mentors: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  packages: 'M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  reply: 'M4 5h16v11H9l-5 4z',
  check: 'M5 12l5 5 9-10',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
};
export function Icon({ name, size = 20, fill = 'none' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export function Avatar({ name, tint, size = 40 }) {
  const initials = name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: tint || undefined }} aria-hidden="true">
      {initials}
    </span>
  );
}

export function Banner() {
  const { reset } = useStore();
  return (
    <div className="banner" role="note">
      <span>Prototype, not live yet.</span>
      <button
        type="button"
        onClick={() => {
          reset();
          go('');
        }}
      >
        Restart demo
      </button>
    </div>
  );
}

const NAV = [
  { id: 'plan', label: 'My Plan', icon: 'plan' },
  { id: 'tools', label: 'Tools', icon: 'tools' },
  { id: 'community', label: 'Community', icon: 'community' },
  { id: 'mentors', label: 'Mentors', icon: 'mentors' },
  { id: 'packages', label: 'Packages', icon: 'packages' },
];
export function Nav({ section }) {
  return (
    <nav className="nav" aria-label="Main">
      <a className="nav-brand" href="#">{data.brand.name}</a>
      <ul>
        {NAV.map((n) => (
          <li key={n.id}>
            <a href={`#${n.id}`} aria-current={section === n.id ? 'page' : undefined}>
              <Icon name={n.icon} />
              {n.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="row between">
          <h2>{title}</h2>
          <button type="button" className="back" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div className="toast" role="status">
      {msg}
    </div>
  ) : null;
  return [node, setMsg];
}

export function PackageCard({ pkg, action, compact = false, highlight }) {
  const later = pkg.status === '2027';
  return (
    <article className={`panel pkg${later ? ' dim' : ''}`}>
      <div className="row between">
        <span className="tag">{pkg.stage}</span>
        {later ? <span className="tag soon">Opens 2027</span> : highlight ? <span className="tag accent">{highlight}</span> : null}
      </div>
      <h3>{pkg.name}</h3>
      <dl>
        <div>
          <dt>Who it's for</dt>
          <dd>{pkg.for}</dd>
        </div>
        {!compact && (
          <div>
            <dt>You walk away with</dt>
            <dd>{pkg.outcome}</dd>
          </div>
        )}
      </dl>
      <div className="foot-row">
        <span className="price">{pkg.priceLabel}</span>
        {action}
      </div>
    </article>
  );
}
