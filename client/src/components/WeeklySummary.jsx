import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOODS = [
  { rating: 1, emoji: '😢', label: 'Very Sad',  color: '#ef4444' },
  { rating: 2, emoji: '😕', label: 'Sad',        color: '#f97316' },
  { rating: 3, emoji: '😐', label: 'Neutral',    color: '#eab308' },
  { rating: 4, emoji: '🙂', label: 'Happy',      color: '#84cc16' },
  { rating: 5, emoji: '😄', label: 'Very Happy', color: '#22c55e' },
];

function moodEmoji(rating) {
  const r = Math.round(Math.min(Math.max(rating, 1), 5));
  return MOODS[r - 1]?.emoji ?? '😐';
}

function moodColor(rating) {
  const r = Math.round(Math.min(Math.max(rating, 1), 5));
  return MOODS[r - 1]?.color ?? '#5C4033';
}

const PaperclipIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
      stroke="#5C4033" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

export default function WeeklySummary({ entries }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/moods/summary/weekly')
      .then(r => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [entries]);

  const exportSummary = () => {
    if (!summary) return;
    const text = [
      'MOOD TRACKER — WEEKLY SUMMARY',
      `Period : ${summary.period.start} → ${summary.period.end}`,
      `Created: ${new Date().toLocaleDateString()}`,
      '',
      '─────────────────────────────',
      'OVERVIEW',
      '─────────────────────────────',
      `Average Mood    : ${summary.avgMood}/5 ${moodEmoji(summary.avgMood || 3)}`,
      `Average Sentiment: ${summary.avgSentiment >= 0 ? '+' : ''}${summary.avgSentiment}`,
      `Current Streak  : ${summary.streak} day${summary.streak !== 1 ? 's' : ''} 🔥`,
      `Total Entries   : ${summary.totalEntries}`,
      '',
      '─────────────────────────────',
      'DAILY BREAKDOWN',
      '─────────────────────────────',
      ...(summary.entries.length
        ? summary.entries
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(e => `  ${e.date}  ${e.rating}/5 ${moodEmoji(e.rating)}${e.note ? `  "${e.note}"` : ''}`)
        : ['  No entries this week.']),
      '',
      '─────────────────────────────',
      'TOP WORDS',
      '─────────────────────────────',
      ...(summary.topWords.length
        ? summary.topWords.slice(0, 10).map((w, i) => `  ${i + 1}. ${w.word} (×${w.count})`)
        : ['  No words yet.']),
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href:     url,
      download: `mood-summary-${summary.period.start}.txt`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#5C4033' }}>
          Flipping to the summary page…
        </p>
      </div>
    );
  }
  if (!summary) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#5C4033' }}>
          Failed to load summary.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Header ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PaperclipIcon />
          <div>
            <h2 className="j-heading-sm">Weekly Summary</h2>
            <p style={{ margin: '2px 0 0', fontFamily: 'Lora, serif', fontSize: '0.88rem', color: '#5C4033', fontStyle: 'italic' }}>
              {summary.period.start} → {summary.period.end}
            </p>
          </div>
        </div>
        <button onClick={exportSummary} className="j-btn-sm">
          📥 Export
        </button>
      </div>

      {/* ── Stats grid (sticky notes) ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="md:grid-cols-4">
        <StatNote
          label="Avg Mood"
          value={summary.avgMood || '—'}
          sub="out of 5"
          icon={moodEmoji(summary.avgMood || 3)}
          valueColor="#2C1810"
          washiClass="washi-blue"
        />
        <StatNote
          label="This Week"
          value={summary.entries.length}
          sub="entries"
          icon="📝"
          valueColor="#2C1810"
          washiClass="washi-green"
        />
        <StatNote
          label="Sentiment"
          value={`${summary.avgSentiment >= 0 ? '+' : ''}${summary.avgSentiment}`}
          sub="avg score"
          icon={summary.avgSentiment > 0 ? '😊' : summary.avgSentiment < 0 ? '😔' : '😑'}
          valueColor={summary.avgSentiment > 0 ? '#3A5A30' : summary.avgSentiment < 0 ? '#9B1C1C' : '#5C4033'}
          washiClass="washi-pink"
        />
        <StatNote
          label="Streak"
          value={summary.streak}
          sub="days"
          icon="🔥"
          valueColor="#D4874A"
          washiClass="washi-amber"
        />
      </div>

      {/* ── Daily breakdown ───────────────────────────────── */}
      {summary.entries.length > 0 ? (
        <div className="j-card j-card-curl" style={{ padding: '20px 24px' }}>
          <div className="washi washi-top washi-green" />
          <h3 className="j-heading-sm" style={{ marginBottom: 16 }}>Daily Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {summary.entries
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((entry, i, arr) => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(139,111,71,0.14)' : 'none',
                }}>
                  <div style={{ minWidth: 52, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#2C1810' }}>
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.76rem', color: '#7A5C44' }}>
                      {entry.date.slice(5)}
                    </p>
                  </div>

                  <span style={{ fontSize: '1.6rem' }}>{MOODS[entry.rating - 1].emoji}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      height: 6, borderRadius: 999,
                      marginBottom: entry.note ? 4 : 0,
                      backgroundColor: moodColor(entry.rating),
                      width: `${entry.rating * 20}%`,
                      opacity: 0.7,
                    }} />
                    {entry.note && (
                      <p title={entry.note} style={{ margin: 0, fontSize: '0.88rem', fontFamily: 'Lora, serif', color: '#3D2B1F', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
                        "{entry.note}"
                      </p>
                    )}
                  </div>

                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: moodColor(entry.rating), flexShrink: 0 }}>
                    {entry.rating}/5
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="j-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📅</p>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#5C4033', margin: 0 }}>
            No entries this week yet.
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Lora, serif', fontSize: '0.88rem', color: '#7A5C44', fontStyle: 'italic' }}>
            Start logging to see your weekly summary!
          </p>
        </div>
      )}

      {/* ── Top words ────────────────────────────────────── */}
      {summary.topWords.length > 0 && (
        <div className="j-card j-card-curl" style={{ padding: '20px 24px' }}>
          <div className="washi washi-top washi-amber" />
          <h3 className="j-heading-sm" style={{ marginBottom: 14 }}>Top Words This Week</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {summary.topWords.slice(0, 15).map(({ word, count }) => (
              <span key={word} style={{
                background: 'rgba(44,24,16,0.07)',
                border: '1.5px solid rgba(44,24,16,0.18)',
                borderRadius: 999,
                padding: '3px 12px',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#2C1810',
              }}>
                {word}{' '}
                <span style={{ color: '#7A5C44', fontSize: '0.78rem', fontWeight: 400 }}>×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatNote({ label, value, sub, icon, valueColor, washiClass }) {
  return (
    <div className="j-sticky" style={{ padding: '20px 12px 14px', textAlign: 'center', position: 'relative', overflow: 'visible' }}>
      <div className={`washi washi-top ${washiClass}`} />
      <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#5C4033', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ margin: '6px 0 2px', fontSize: '1.8rem' }}>{icon}</p>
      <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: valueColor }}>
        {value}
      </p>
      <p style={{ margin: '2px 0 0', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.76rem', color: '#7A5C44' }}>
        {sub}
      </p>
    </div>
  );
}
