import data from '../data.json';
import { go } from '../lib.jsx';
import { Avatar, PackageCard } from '../components.jsx';

export default function Landing() {
  const { brand } = data;
  const preview = data.packages.filter((p) => p.status === 'now').slice(0, 3);
  const mentors = data.mentors.slice(0, 3);

  return (
    <>
      <header className="site-head">
        <a className="wordmark" href="#">{brand.name}</a>
        <nav>
          <a href="#packages" className="small">Packages</a>
          <button type="button" className="btn" onClick={() => go('quiz')}>Get started</button>
        </nav>
      </header>

      <main>
        <section className="l-section hero">
          <h1>{brand.oneLiner}</h1>
          <p>{brand.subline}</p>
          <div className="row">
            <button type="button" className="btn accent" onClick={() => go('quiz')}>Get started</button>
            <button type="button" className="btn ghost" onClick={() => go('profile-check')}>Book a free profile check</button>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>Takes 2 minutes. No account needed.</p>
        </section>

        <section className="l-section stack-lg" aria-labelledby="problem">
          <p className="eyebrow" id="problem">The problem</p>
          <ul className="problem">
            {data.problem.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>

        <section className="l-section stack-lg" aria-labelledby="how">
          <h2 id="how">How it works</h2>
          <ol className="steps">
            {data.howItWorks.map((s, i) => (
              <li key={s.title}>
                <span className="n">{i + 1}</span>
                <div className="stack" style={{ gap: 4 }}>
                  <h3>{s.title}</h3>
                  <p className="muted small">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="l-section stack-lg" aria-labelledby="pk">
          <div className="section-head">
            <h2 id="pk">Packages</h2>
            <a href="#packages" className="link">See all {data.packages.length} packages</a>
          </div>
          <div className="grid-3">
            {preview.map((p) => (
              <PackageCard key={p.id} pkg={p} compact action={<a href="#packages" className="link small">Details</a>} />
            ))}
          </div>
        </section>

        <section className="l-section stack-lg" aria-labelledby="mt">
          <div className="section-head">
            <h2 id="mt">Mentors who've been there</h2>
            <a href="#mentors" className="link">Find a mentor</a>
          </div>
          <div className="faces">
            {mentors.map((m) => (
              <a key={m.id} href={`#mentor-${m.id}`} className="face" style={{ textDecoration: 'none' }}>
                <Avatar name={m.name} tint={m.tint} size={56} />
                <div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div className="small muted">{m.school} · {m.major}</div>
                  <div className="small muted">From {m.from}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="l-section stack" aria-labelledby="faq">
          <h2 id="faq">Questions</h2>
          <div className="faq">
            {data.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="l-section stack">
          <div className="row between">
            <span className="wordmark">{brand.name}</span>
            <button type="button" className="btn accent" onClick={() => go('quiz')}>Get started</button>
          </div>
          <p className="foot">A prototype. Every student, mentor, post and price on this page is made up.</p>
        </section>
      </main>
    </>
  );
}
