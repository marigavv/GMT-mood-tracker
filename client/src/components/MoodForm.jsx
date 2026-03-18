import React, { useState, useMemo } from 'react';
import axios from 'axios';

const BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const MOODS = [
  { rating: 1, emoji: '😢', label: 'Very Sad',  color: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
  { rating: 2, emoji: '😕', label: 'Sad',        color: '#f97316', bg: 'rgba(249,115,22,0.08)'  },
  { rating: 3, emoji: '😐', label: 'Neutral',    color: '#eab308', bg: 'rgba(234,179,8,0.08)'   },
  { rating: 4, emoji: '🙂', label: 'Happy',      color: '#84cc16', bg: 'rgba(132,204,22,0.08)'  },
  { rating: 5, emoji: '😄', label: 'Very Happy', color: '#22c55e', bg: 'rgba(34,197,94,0.08)'   },
];

const PenSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.55, flexShrink: 0 }}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
      stroke="#2C1810" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function calcStreak(entries) {
  const allDates = new Set(entries.map(e => e.date));
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  while (allDates.has(check.toISOString().split('T')[0])) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

/* Shared label style used in several places */
const sectionLabel = {
  fontFamily: 'Nunito, sans-serif',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#2C1810',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 10,
};

export default function MoodForm({ onMoodLogged, entries }) {
  const [rating, setRating] = useState(null);
  const [note, setNote]     = useState('');
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const streak     = useMemo(() => calcStreak(entries), [entries]);
  const todayStr   = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === todayStr);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!rating) { setError('Please select a mood rating.'); return; }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${BASE}/api/moods`, { rating, note, date });
      setSuccess(true);
      onMoodLogged();
      setNote('');
      setRating(null);
      setDate(todayStr);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to log mood. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Streak banner ──────────────────────────────────── */}
      {streak > 0 && (
        <div className="j-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid rgba(212, 135, 74, 0.5)' }}>
          <span style={{ fontSize: '2rem' }}>🔥</span>
          <div>
            <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#D4874A' }}>
              {streak}-day streak!
            </p>
            <p style={{ margin: 0, fontSize: '0.88rem', fontFamily: 'Lora, serif', color: '#5C4033' }}>
              You've been consistent — keep it up!
            </p>
          </div>
        </div>
      )}

      {/* ── Today's existing entry ──────────────────────────── */}
      {todayEntry && (
        <div className="j-card j-card-curl" style={{ padding: '16px 20px' }}>
          <p style={sectionLabel}>Today's entry</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>{MOODS[todayEntry.rating - 1].emoji}</span>
            <div>
              <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: '1rem', fontWeight: 700, color: MOODS[todayEntry.rating - 1].color }}>
                {MOODS[todayEntry.rating - 1].label}
                <span style={{ color: '#5C4033', fontFamily: 'Lora, serif', fontSize: '0.92rem', fontWeight: 400, marginLeft: 8, fontStyle: 'italic' }}>
                  sentiment {todayEntry.sentiment.score > 0 ? '+' : ''}{todayEntry.sentiment.score}
                </span>
              </p>
              {todayEntry.note && (
                <p style={{ margin: '5px 0 0', fontSize: '1rem', color: '#2C1810', fontStyle: 'italic', fontFamily: 'Lora, serif', lineHeight: 1.6 }}>
                  "{todayEntry.note}"
                </p>
              )}
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontFamily: 'Lora, serif', fontSize: '0.85rem', color: '#7A5C44', fontStyle: 'italic' }}>
            Submit again to replace today's entry.
          </p>
        </div>
      )}

      {/* ── Entry form ─────────────────────────────────────── */}
      <div className="j-card j-card-curl" style={{ padding: '24px 24px 28px' }}>
        <div className="washi washi-top washi-blue" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <PenSvg />
          <h2 className="j-heading-sm">How are you feeling?</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Mood selector */}
          <div>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#4A3728', display: 'block', marginBottom: 10, letterSpacing: '0.01em' }}>
              Select your mood
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              {MOODS.map(mood => (
                <button
                  key={mood.rating}
                  type="button"
                  onClick={() => setRating(mood.rating)}
                  className={`mood-btn${rating === mood.rating ? ' mood-btn-selected' : ''}`}
                  style={rating === mood.rating ? { backgroundColor: mood.bg } : {}}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1, transition: 'transform 0.15s', transform: rating === mood.rating ? 'scale(1.1)' : 'none' }}>
                    {mood.emoji}
                  </span>
                  <span className="hidden sm:block" style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: rating === mood.rating ? mood.color : '#3D2B1F',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#2C1810', display: 'block', marginBottom: 6, letterSpacing: '0.01em' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={todayStr}
              className="j-input"
              style={{ maxWidth: 200 }}
            />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#2C1810', display: 'block', marginBottom: 6, letterSpacing: '0.01em' }}>
              How was your day?{' '}
              <span style={{ color: '#7A5C44', fontWeight: 400, fontStyle: 'italic' }}>(optional)</span>
            </label>
            <div className="j-ruled" style={{ borderBottom: '1.5px solid rgba(139,111,71,0.3)', paddingBottom: 4, marginTop: 4 }}>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Write about your day…"
                rows={4}
                className="j-textarea"
              />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#7A5C44', textAlign: 'right', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
              {note.length} chars
            </p>
          </div>

          {error   && <div className="j-error">{error}</div>}
          {success && (
            <div className="j-success">
              <span>✓</span> Entry written in your journal!
            </div>
          )}

          <button type="submit" disabled={loading || !rating} className="j-btn">
            {loading ? 'Writing…' : '✏️  Log Mood'}
          </button>
        </form>
      </div>

      {/* ── Recent entries ─────────────────────────────────── */}
      {entries.length > 0 && (
        <div className="j-card j-card-curl" style={{ padding: '20px 24px' }}>
          <h3 className="j-heading-sm" style={{ marginBottom: 16 }}>Recent Entries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {entries.slice(0, 7).map((entry, i) => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < Math.min(entries.length, 7) - 1 ? '1px solid rgba(139,111,71,0.15)' : 'none',
              }}>
                <span style={{ fontSize: '1.6rem' }}>{MOODS[entry.rating - 1].emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#2C1810' }}>
                      {entry.date}
                    </span>
                    <span className={entry.sentiment.score > 0 ? 'j-badge-pos' : entry.sentiment.score < 0 ? 'j-badge-neg' : 'j-badge-neu'}>
                      {entry.sentiment.score > 0 ? '+' : ''}{entry.sentiment.score} sentiment
                    </span>
                  </div>
                  {entry.note && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: '#5C4033', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic', fontFamily: 'Lora, serif' }}>
                      "{entry.note}"
                    </p>
                  )}
                </div>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: MOODS[entry.rating - 1].color, flexShrink: 0 }}>
                  {entry.rating}/5
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
