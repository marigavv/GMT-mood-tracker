import React, { useMemo } from 'react';

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
  'i','me','my','we','our','it','its','this','that','is','was','are','were',
  'be','been','being','have','has','had','do','does','did','will','would',
  'could','should','may','might','not','no','so','as','if','then','than',
  'very','just','from','up','out','about','into','through','during','before',
  'after','all','also','more','some','what','which','who','when','where','how',
  'there','their','they','them','he','she','his','her','him','you','your',
  'got','get','like','feel','felt','day','today','really','much','now','still',
  'even','back','going','went','good','bad','time','too','make','made','can',
  'one','two','new','well','know','think','want','need','said','see','was',
  'its','been','were','are',
]);

/* Earthy/journal palette — all dark enough for readability */
const PALETTE = [
  '#2C3E6B', '#4A6741', '#7A3F3F', '#6B5035',
  '#3A5A8B', '#5A3A7A', '#2C5B6B', '#7A5A2A',
  '#3D5A3D', '#8B3A3A', '#2C4A6B', '#6B3A5A',
  '#4A7A5A', '#5A4A2C', '#3A6B5A', '#7A4A3A',
];

function deterministicShuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (i * 2654435761) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ROTATIONS = [0, 0, 0, 90, -90];

export default function WordCloud({ entries }) {
  const words = useMemo(() => {
    const counts = {};
    entries.forEach(({ note }) => {
      if (!note) return;
      note
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w))
        .forEach(w => { counts[w] = (counts[w] || 0) + 1; });
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60);

    if (!sorted.length) return [];

    const max   = sorted[0][1];
    const min   = sorted[sorted.length - 1][1];
    const range = max - min || 1;

    return sorted.map(([word, count], i) => ({
      word,
      count,
      size:     Math.round(14 + ((count - min) / range) * 34),
      color:    PALETTE[i % PALETTE.length],
      rotation: ROTATIONS[(i * 7) % ROTATIONS.length],
    }));
  }, [entries]);

  const shuffled = useMemo(() => deterministicShuffle(words), [words]);

  if (!entries.length || !words.length) {
    return (
      <div className="j-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '2.8rem', marginBottom: 14 }}>💬</p>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#5C4033', margin: 0 }}>
          No words yet.
        </p>
        <p style={{ margin: '6px 0 0', fontFamily: 'Lora, serif', fontSize: '0.92rem', color: '#7A5C44', fontStyle: 'italic' }}>
          Add notes to your mood entries to build a word cloud!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Word cloud inside sketched border ───────────────── */}
      <div className="j-card j-card-curl" style={{ padding: '22px 22px 20px' }}>
        <div className="washi washi-top washi-pink" />
        <h2 className="j-heading-sm">Word Cloud</h2>
        <p style={{ margin: '4px 0 20px', fontSize: '0.88rem', fontFamily: 'Lora, serif', color: '#5C4033', fontStyle: 'italic' }}>
          Most frequent words across all your notes — larger = more common
        </p>

        <div className="j-sketched" style={{ padding: '20px 16px', minHeight: 200 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px', justifyContent: 'center', alignItems: 'center', lineHeight: 1 }}>
            {shuffled.map(({ word, size, color, rotation, count }) => (
              <span
                key={word}
                title={`"${word}" — ${count} time${count !== 1 ? 's' : ''}`}
                style={{
                  fontSize:    `${size}px`,
                  color,
                  transform:   `rotate(${rotation}deg)`,
                  display:     'inline-block',
                  lineHeight:  1.3,
                  cursor:      'default',
                  fontFamily:  rotation !== 0 ? 'Nunito, sans-serif' : 'Lora, serif',
                  fontWeight:  size > 28 ? 700 : 500,
                  transition:  'transform 0.15s, opacity 0.15s',
                  opacity:     0.9,
                }}
                onMouseEnter={e => { e.target.style.transform = `rotate(${rotation}deg) scale(1.12)`; e.target.style.opacity = '1'; }}
                onMouseLeave={e => { e.target.style.transform = `rotate(${rotation}deg) scale(1)`;    e.target.style.opacity = '0.9'; }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Frequency table ──────────────────────────────────── */}
      <div className="j-card j-card-curl" style={{ padding: '20px 24px' }}>
        <h3 className="j-heading-sm" style={{ marginBottom: 14 }}>Word Frequency</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 28px' }} className="md:grid-cols-3">
          {words.slice(0, 24).map(({ word, count, color }) => (
            <div key={word} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 0',
              borderBottom: '1px solid rgba(139,111,71,0.13)',
            }}>
              <span style={{ color, fontFamily: 'Lora, serif', fontSize: '0.92rem', fontWeight: 700 }}>
                {word}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  height: 5, borderRadius: 999, opacity: 0.55,
                  width: `${Math.max((count / words[0].count) * 48, 4)}px`,
                  backgroundColor: color,
                }} />
                <span style={{ fontSize: '0.78rem', fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#5C4033', minWidth: 16, textAlign: 'right' }}>
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
