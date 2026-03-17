import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MOOD_EMOJIS = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

const FEATURE_CARDS = [
  {
    icon: '📅',
    title: 'Daily Mood Logging',
    desc: 'Rate your day 1–5 and write a note in seconds.',
    rotate: '-2.8deg',
    washiClass: 'washi-blue',
    delay: '0.35s',
  },
  {
    icon: '📊',
    title: 'Sentiment Trends',
    desc: 'Charts that reveal the emotional arc of your weeks.',
    rotate: '2.1deg',
    washiClass: 'washi-green',
    delay: '0.5s',
  },
  {
    icon: '🗓️',
    title: 'Mood Heatmap',
    desc: 'See your emotional landscape across 15 weeks at a glance.',
    rotate: '-1.4deg',
    washiClass: 'washi-pink',
    delay: '0.65s',
  },
  {
    icon: '☁️',
    title: 'Word Cloud',
    desc: 'The words you reach for most quietly tell your story.',
    rotate: '2.6deg',
    washiClass: 'washi-amber',
    delay: '0.8s',
  },
];

function moodEmojiForAvg(avg) {
  if (!avg) return '😐';
  return MOOD_EMOJIS[Math.round(Math.min(Math.max(avg, 1), 5))];
}

/* ── Pure-CSS notebook illustration ─────────────────── */
function NotebookIllustration() {
  return (
    <div className="landing-notebook-float" style={{ position: 'relative', width: 148, height: 192, flexShrink: 0 }}>
      {/* Drop shadow */}
      <div style={{
        position: 'absolute', bottom: -14, left: '50%',
        transform: 'translateX(-50%)',
        width: '75%', height: 20,
        background: 'rgba(60,40,20,0.22)',
        borderRadius: '50%', filter: 'blur(10px)',
      }} />

      {/* Back page 2 */}
      <div style={{
        position: 'absolute', top: 6, left: 10, right: -6, bottom: -5,
        background: '#EDE8DE', borderRadius: '3px 12px 12px 3px',
        transform: 'rotate(3.5deg)',
        boxShadow: '1px 2px 5px rgba(60,40,20,0.1)',
      }} />

      {/* Back page 1 */}
      <div style={{
        position: 'absolute', top: 3, left: 7, right: -3, bottom: -2,
        background: '#F5F0E8', borderRadius: '3px 11px 11px 3px',
        transform: 'rotate(1.8deg)',
      }} />

      {/* Main cover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(155deg, #A07850 0%, #7A5830 55%, #5A4028 100%)',
        borderRadius: '5px 13px 13px 5px',
        boxShadow: '4px 6px 20px rgba(60,40,20,0.4)',
        overflow: 'hidden',
      }}>
        {/* Subtle leather grain */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(255,255,255,0.025) 9px, rgba(255,255,255,0.025) 10px)',
        }} />

        {/* Embossed border frame */}
        <div style={{
          position: 'absolute', top: 18, left: 24, right: 14, bottom: 16,
          border: '1.5px solid rgba(255,248,238,0.22)',
          borderRadius: 7,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>📖</span>
          <div style={{ width: '65%', height: 1.5, background: 'rgba(255,248,238,0.45)', borderRadius: 1 }} />
          <div style={{ width: '50%', height: 1.5, background: 'rgba(255,248,238,0.3)', borderRadius: 1 }} />
          <div style={{ width: '40%', height: 1.5, background: 'rgba(255,248,238,0.2)', borderRadius: 1, marginTop: 4 }} />
        </div>

        {/* Highlight edge */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
          background: 'linear-gradient(180deg, rgba(255,248,238,0.18) 0%, rgba(255,248,238,0.06) 100%)',
        }} />
      </div>

      {/* Spine */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 18,
        background: 'linear-gradient(90deg, #3E2814 0%, #5C3D20 100%)',
        borderRadius: '5px 0 0 5px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-evenly',
        paddingTop: 12, paddingBottom: 12,
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            width: 9, height: 9, borderRadius: '50%',
            border: '1.5px solid rgba(255,248,238,0.45)',
            background: 'rgba(30,18,8,0.6)',
          }} />
        ))}
      </div>

      {/* Bookmark ribbon */}
      <div style={{
        position: 'absolute', top: 0, right: 26,
        width: 11, height: 46,
        background: 'linear-gradient(180deg, #B83030 0%, #8B1C1C 100%)',
        borderRadius: '0 0 5px 5px',
        boxShadow: '1px 3px 6px rgba(60,40,20,0.25)',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 0, borderLeft: '5.5px solid #8B1C1C', borderRight: '5.5px solid #8B1C1C', borderBottom: '7px solid transparent' }} />
      </div>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────── */
function StatCard({ icon, value, label, delay }) {
  return (
    <div
      className="j-sticky landing-slide-up"
      style={{
        padding: '20px 16px 16px',
        textAlign: 'center',
        animationDelay: delay,
        position: 'relative',
      }}
    >
      <p style={{ margin: 0, fontSize: '2rem', lineHeight: 1 }}>{icon}</p>
      <p style={{
        margin: '8px 0 2px',
        fontFamily: 'Caveat, cursive', fontWeight: 700,
        fontSize: '2rem', color: '#2C1810', lineHeight: 1,
      }}>
        {value}
      </p>
      <p style={{
        margin: 0,
        fontFamily: 'Nunito, sans-serif', fontWeight: 600,
        fontSize: '0.78rem', color: '#5C4033',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {label}
      </p>
    </div>
  );
}

/* ── Main LandingPage ────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [totalEntries, setTotalEntries] = useState(null);

  useEffect(() => {
    axios.get('/api/moods').then(r => setTotalEntries(r.data.length)).catch(() => {});
    axios.get('/api/moods/summary/weekly').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const hasData = totalEntries !== null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ flex: '0 0 auto', padding: '40px 20px 48px', display: 'flex', alignItems: 'center', minHeight: '80vh' }}>
        <div
          className="j-page landing-slide-up"
          style={{
            maxWidth: 880, margin: '0 auto', width: '100%',
            padding: 'clamp(28px, 5vw, 56px) clamp(20px, 5vw, 60px) clamp(32px, 5vw, 64px)',
            animationDelay: '0.1s',
          }}
        >
          {/* Coffee stain decorations */}
          <div className="coffee-stain" style={{ width: 130, height: 110, top: 6, right: 18, opacity: 1 }} />
          <div className="coffee-stain" style={{ width: 80, height: 68, bottom: 24, left: 8, opacity: 0.65 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(24px, 5vw, 56px)' }}>

            {/* Left: text content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Date stamp */}
              <p
                className="landing-slide-up"
                style={{
                  margin: '0 0 18px',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  fontSize: '0.8rem', color: '#7A5C44',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  animationDelay: '0.25s',
                }}
              >
                {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}
              </p>

              {/* Main title */}
              <h1
                className="landing-slide-up"
                style={{
                  fontFamily: 'Caveat, cursive', fontWeight: 700,
                  fontSize: 'clamp(2.8rem, 6.5vw, 4.8rem)',
                  color: '#2C1810', lineHeight: 1.05,
                  margin: 0,
                  animationDelay: '0.3s',
                }}
              >
                My Mood Journal
              </h1>

              {/* Pen-draw underline */}
              <svg
                viewBox="0 0 380 14"
                preserveAspectRatio="none"
                style={{ width: 'min(100%, 380px)', height: 14, display: 'block', marginTop: 2, overflow: 'visible' }}
                aria-hidden="true"
              >
                <path
                  className="landing-pen-line"
                  d="M3 9 Q95 3 190 9 Q285 15 377 7"
                  stroke="#8B6F47"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Pen nib dot at end */}
                <circle className="landing-pen-dot" cx="377" cy="7" r="3" fill="#8B6F47" />
              </svg>

              {/* Tagline */}
              <p
                className="landing-slide-up"
                style={{
                  fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic',
                  fontSize: 'clamp(0.98rem, 2vw, 1.15rem)',
                  color: '#5C4033', lineHeight: 1.75,
                  margin: '22px 0 36px',
                  animationDelay: '0.45s',
                }}
              >
                A quiet place to check in with yourself.<br />
                Every day, one entry at a time.
              </p>

              {/* CTA */}
              <button
                onClick={() => navigate('/journal')}
                className="landing-cta"
                style={{ animationDelay: '0.6s' }}
              >
                Open My Journal <span style={{ marginLeft: 6 }}>→</span>
              </button>
            </div>

            {/* Right: notebook illustration (hidden on small screens) */}
            <div className="landing-notebook-wrap">
              <NotebookIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS (corkboard) ──────────────────────────── */}
      <section className="landing-corkboard" style={{ padding: 'clamp(40px, 6vw, 64px) 20px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>

          {/* Section header */}
          <div
            className="landing-slide-up"
            style={{ textAlign: 'center', marginBottom: 40, animationDelay: '0.2s' }}
          >
            <h2 style={{
              fontFamily: 'Caveat, cursive', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              color: '#2C1810', margin: '0 0 8px',
            }}>
              What's inside
            </h2>
            <p style={{
              fontFamily: 'Lora, serif', fontStyle: 'italic',
              fontSize: '0.95rem', color: '#5C4033', margin: 0,
            }}>
              A full journaling toolkit, all on your own machine.
            </p>
          </div>

          {/* Pin line decorations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(188px, 1fr))', gap: 28, justifyItems: 'center' }}>
            {FEATURE_CARDS.map((card, i) => (
              <div
                key={i}
                className="j-sticky landing-slide-up landing-feature-card"
                style={{
                  transform: `rotate(${card.rotate})`,
                  padding: '28px 18px 22px',
                  width: '100%',
                  maxWidth: 210,
                  position: 'relative',
                  animationDelay: card.delay,
                }}
              >
                <div className={`washi washi-top ${card.washiClass}`} />
                {/* Pin dot */}
                <div style={{
                  position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 35%, #D4874A, #8B5A2B)',
                  boxShadow: '0 2px 5px rgba(60,40,20,0.35)',
                  zIndex: 2,
                }} />
                <p style={{ fontSize: '2.2rem', textAlign: 'center', margin: '0 0 10px', lineHeight: 1 }}>
                  {card.icon}
                </p>
                <p style={{
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  fontSize: '0.92rem', color: '#2C1810',
                  textAlign: 'center', margin: '0 0 7px',
                }}>
                  {card.title}
                </p>
                <p style={{
                  fontFamily: 'Lora, serif', fontStyle: 'italic',
                  fontSize: '0.84rem', color: '#5C4033',
                  textAlign: 'center', lineHeight: 1.55, margin: 0,
                }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS TEASER ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px, 6vw, 60px) 20px', background: 'var(--j-cream)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="landing-slide-up" style={{ textAlign: 'center', marginBottom: 32, animationDelay: '0.2s' }}>
            <h2 style={{
              fontFamily: 'Caveat, cursive', fontWeight: 700,
              fontSize: 'clamp(1.7rem, 4vw, 2.3rem)',
              color: '#2C1810', margin: '0 0 6px',
            }}>
              {hasData && totalEntries > 0 ? 'Your journal so far' : 'Ready when you are'}
            </h2>
            <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: '0.92rem', color: '#5C4033', margin: 0 }}>
              {hasData && totalEntries > 0
                ? 'Live data from your entries'
                : 'Start today — your first entry is waiting.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(10px, 3vw, 20px)' }}>
            <StatCard
              icon="📝"
              value={totalEntries !== null ? totalEntries : '—'}
              label="moods logged"
              delay="0.3s"
            />
            <StatCard
              icon="🔥"
              value={stats?.streak ?? '—'}
              label="day streak"
              delay="0.45s"
            />
            <StatCard
              icon={moodEmojiForAvg(stats?.avgMood)}
              value={stats?.avgMood ? `${stats.avgMood}/5` : '—'}
              label="avg mood this week"
              delay="0.6s"
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 7vw, 80px) 20px', background: '#C8B89A', textAlign: 'center' }}>
        <div
          className="landing-slide-up"
          style={{ maxWidth: 560, margin: '0 auto', animationDelay: '0.2s' }}
        >
          {/* Decorative doodle quote marks */}
          <p style={{
            fontFamily: 'Caveat, cursive', fontWeight: 700,
            fontSize: 'clamp(3.5rem, 8vw, 6rem)',
            color: 'rgba(44,24,16,0.12)', lineHeight: 0.7,
            margin: '0 0 -12px', userSelect: 'none',
          }}>
            "
          </p>

          <p style={{
            fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: '#3D2B1F', lineHeight: 1.8,
            margin: '0 0 36px',
          }}>
            The act of writing is the act of<br className="landing-br-hide" /> discovering what you believe.
          </p>

          <p style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 700,
            fontSize: '0.82rem', color: '#7A5C44',
            letterSpacing: '0.07em', textTransform: 'uppercase',
            margin: '0 0 36px',
          }}>
            — David Hare
          </p>

          <button
            onClick={() => navigate('/journal')}
            className="landing-cta"
          >
            Start Journaling ✏️
          </button>
        </div>
      </section>
    </div>
  );
}
