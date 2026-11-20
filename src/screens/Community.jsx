import { useState } from 'react';
import data from '../data.json';
import { useStore, useProfile, gradeLabel } from '../lib.jsx';
import { Avatar, Icon, Modal, useToast } from '../components.jsx';

const TABS = [
  { id: 'insider', label: 'Insider posts' },
  { id: 'ask', label: 'Ask' },
  { id: 'chance', label: 'Chance Me' },
  { id: 'wins', label: 'Wins' },
];
const REGIONS = ['All', 'Vietnam', 'India', 'UAE', 'Europe'];

export default function Community() {
  const { state, update } = useStore();
  const profile = useProfile();
  const [tab, setTab] = useState('insider');
  const [region, setRegion] = useState('All');
  const [writing, setWriting] = useState(false);
  const [toast, say] = useToast();

  const all = [...state.myPosts, ...data.posts];
  const posts = all.filter((p) => p.type === tab && (region === 'All' || p.region === region));
  const toggleLike = (id) => update((s) => ({ liked: { ...s.liked, [id]: !s.liked[id] } }));

  return (
    <div className="page stack-lg">
      <header className="row between" style={{ alignItems: 'flex-end' }}>
        <div className="stack" style={{ gap: 4 }}>
          <h1>Community</h1>
          <p className="muted small">Students and mentors from your part of the world.</p>
        </div>
        <button type="button" className="btn accent" onClick={() => setWriting(true)}>Write a post</button>
      </header>

      <div className="stack">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Region">
          {REGIONS.map((r) => (
            <button key={r} type="button" className="chip" aria-pressed={region === r} onClick={() => setRegion(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="stack" role="tabpanel">
        {posts.length === 0 && (
          <div className="empty-mentor">
            <p>No posts here yet for {region === 'All' ? 'this tab' : region}.</p>
            <button type="button" className="link" onClick={() => setWriting(true)}>Be the first to post</button>
          </div>
        )}
        {posts.map((p) => {
          const liked = !!state.liked[p.id];
          return (
            <article key={p.id} className="panel post">
              <div className="post-head">
                <Avatar name={p.author} tint={p.tint} size={36} />
                <div className="who">
                  <div className="name">{p.author}</div>
                  <div className="row tiny muted" style={{ gap: 6 }}>
                    <span className="tag">{p.tag}</span>
                    <span>{p.ago}</span>
                  </div>
                </div>
              </div>
              <h3>{p.title}</h3>
              {p.text && <p className="small" style={{ maxWidth: '64ch' }}>{p.text}</p>}
              <div className="post-actions">
                <button type="button" aria-pressed={liked} onClick={() => toggleLike(p.id)}>
                  <Icon name="heart" fill={liked ? 'currentColor' : 'none'} />
                  <span className="num">{p.likes + (liked ? 1 : 0)}</span>
                </button>
                <button type="button" onClick={() => say('Replies open in the full version')}>
                  <Icon name="reply" />
                  <span className="num">{p.replies} replies</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {writing && (
        <WriteModal
          defaultType={tab}
          defaultRegion={profile.country}
          onClose={() => setWriting(false)}
          onPost={(post) => {
            const tag = [gradeLabel(profile.grade), profile.city].filter(Boolean).join(' · ');
            update((s) => ({ myPosts: [{ ...post, id: `mine-${Date.now()}`, author: `${profile.name} (you)`, tag, tint: '#E4EFE8', likes: 0, replies: 0, ago: 'just now' }, ...s.myPosts] }));
            setTab(post.type);
            setRegion('All');
            setWriting(false);
            say('Posted');
          }}
        />
      )}
      {toast}
    </div>
  );
}

function WriteModal({ defaultType, defaultRegion, onClose, onPost }) {
  const [type, setType] = useState(defaultType);
  const [region, setRegion] = useState(REGIONS.includes(defaultRegion) ? defaultRegion : 'Vietnam');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  return (
    <Modal title="Write a post" onClose={onClose}>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) onPost({ type, region, title: title.trim(), text: text.trim() });
        }}
      >
        <div className="form-grid">
          <div className="field">
            <label htmlFor="post-type">Post in</label>
            <select id="post-type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {TABS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="post-region">Region</label>
            <select id="post-region" className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.slice(1).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="post-title">Title</label>
          <input id="post-title" className="input" placeholder="For example, Is Grade 11 too late for robotics?" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="post-text">Details (optional)</label>
          <textarea id="post-text" className="input" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <button type="submit" className="btn accent block" disabled={!title.trim()}>Post</button>
      </form>
    </Modal>
  );
}
