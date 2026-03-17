import React, { useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const MOOD_EMOJIS = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

function buildLast30Days(entries) {
  const map = {};
  entries.forEach(e => { map[e.date] = e; });
  const today = new Date();
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const entry = map[ds];
    result.push({
      date:      ds,
      label:     d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      mood:      entry ? entry.rating : null,
      sentiment: entry ? entry.sentiment.comparative : null,
    });
  }
  return result;
}

/* Cream paper tooltip */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FAF8F3',
      border: '1.5px solid rgba(92,64,51,0.3)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '2px 4px 12px rgba(44,24,16,0.16)',
    }}>
      <p style={{ margin: '0 0 4px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#2C1810', fontSize: '0.88rem' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: p.color }}>
          {p.name}: {p.value != null ? p.value.toFixed(2) : 'N/A'}
          {p.name === 'Mood' && p.value != null && ` ${MOOD_EMOJIS[Math.round(p.value)]}`}
        </p>
      ))}
    </div>
  );
};

const axisStyle = { fill: '#5C4033', fontSize: 11, fontFamily: 'Nunito, sans-serif', fontWeight: 600 };
const gridProps  = { strokeDasharray: '4 4', stroke: 'rgba(139,111,71,0.2)' };

export default function MoodChart({ entries }) {
  const data = useMemo(() => buildLast30Days(entries), [entries]);

  const avgMood = useMemo(() => {
    const vals = data.filter(d => d.mood != null).map(d => d.mood);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  }, [data]);

  if (!entries.length) {
    return (
      <div className="j-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '2.8rem', marginBottom: 14 }}>📈</p>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#5C4033', margin: 0 }}>
          No entries yet. Start logging your mood to see trends!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Mood trend ──────────────────────────────────────── */}
      <div className="j-card j-card-curl" style={{ padding: '22px 22px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 className="j-heading-sm">Mood Trend</h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.88rem', fontFamily: 'Lora, serif', color: '#5C4033', fontStyle: 'italic' }}>
              Last 30 days
            </p>
          </div>
          {avgMood && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.76rem', color: '#7A5C44' }}>30-day avg</p>
              <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#2C1810' }}>
                {avgMood} {MOOD_EMOJIS[Math.round(avgMood)]}
              </p>
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="moodGradJournal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2C1810" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2C1810" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" tick={axisStyle} interval={4} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={axisStyle} />
            <Tooltip content={<ChartTooltip />} />
            {avgMood && (
              <ReferenceLine y={parseFloat(avgMood)} stroke="#5C4033" strokeDasharray="5 5" strokeOpacity={0.4} />
            )}
            <Area
              type="monotone"
              dataKey="mood"
              name="Mood"
              stroke="#2C3E6B"
              fill="url(#moodGradJournal)"
              strokeWidth={2.5}
              dot={{ fill: '#2C3E6B', r: 3, strokeWidth: 0, opacity: 0.75 }}
              activeDot={{ r: 5, fill: '#2C3E6B' }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Sentiment trend ─────────────────────────────────── */}
      <div className="j-card j-card-curl" style={{ padding: '22px 22px 18px' }}>
        <h2 className="j-heading-sm">Sentiment Score</h2>
        <p style={{ margin: '4px 0 20px', fontSize: '0.88rem', fontFamily: 'Lora, serif', color: '#5C4033', fontStyle: 'italic', lineHeight: 1.5 }}>
          Positivity of your notes — positive = happy language, negative = sad language
        </p>

        <ResponsiveContainer width="100%" height={195}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" tick={axisStyle} interval={4} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="rgba(92,64,51,0.4)" />
            <Line
              type="monotone"
              dataKey="sentiment"
              name="Sentiment"
              stroke="#4A6741"
              strokeWidth={2.5}
              dot={{ fill: '#4A6741', r: 3, strokeWidth: 0, opacity: 0.75 }}
              activeDot={{ r: 5, fill: '#4A6741' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
