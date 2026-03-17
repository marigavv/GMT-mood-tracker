import React, { useState, useMemo } from 'react';

const MOOD_COLORS = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
};

const MOOD_EMOJIS = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
const MOOD_LABELS = { 1: 'Very Sad', 2: 'Sad', 3: 'Neutral', 4: 'Happy', 5: 'Very Happy' };
const DAY_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MoodCalendar({ entries }) {
  const [tooltip, setTooltip] = useState(null);
  const todayStr = useMemo(() => toDateStr(new Date()), []);

  const entryMap = useMemo(() => {
    const m = {};
    entries.forEach(e => { m[e.date] = e; });
    return m;
  }, [entries]);

  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 104);
    const dow = start.getDay();
    const shift = dow === 0 ? -6 : 1 - dow;
    start.setDate(start.getDate() + shift);
    const result = [];
    const cur = new Date(start);
    while (cur <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(cur <= today ? new Date(cur) : null);
        cur.setDate(cur.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, []);

  const monthLabels = useMemo(() =>
    weeks.map(week => {
      const day = week.find(d => d !== null);
      if (!day) return '';
      return day.getDate() <= 7
        ? day.toLocaleString('default', { month: 'short' })
        : '';
    }), [weeks]);

  const stats = useMemo(() => {
    if (!entries.length) return null;
    const avg   = entries.reduce((s, e) => s + e.rating, 0) / entries.length;
    const best  = Math.max(...entries.map(e => e.rating));
    const worst = Math.min(...entries.map(e => e.rating));
    return { avg: avg.toFixed(1), best, worst, total: entries.length };
  }, [entries]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Stats row ─────────────────────────────────────── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Total',    value: stats.total                                     },
            { label: 'Avg Mood', value: `${stats.avg}/5`                                },
            { label: 'Best',     value: `${MOOD_EMOJIS[stats.best]} ${stats.best}`      },
            { label: 'Worst',    value: `${MOOD_EMOJIS[stats.worst]} ${stats.worst}`    },
          ].map(s => (
            <div key={s.label} className="j-sticky" style={{ padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#5C4033', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </p>
              <p style={{ margin: '4px 0 0', fontFamily: 'Nunito, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#2C1810' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Calendar ──────────────────────────────────────── */}
      <div className="j-card j-card-curl" style={{ padding: '22px 22px 20px' }}>
        <h2 className="j-heading-sm">Mood Calendar</h2>
        <p style={{ margin: '4px 0 18px', fontSize: '0.88rem', fontFamily: 'Lora, serif', color: '#5C4033', fontStyle: 'italic' }}>
          Last 15 weeks
        </p>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}>

            {/* Day-of-week labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 8, marginTop: 24 }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ height: 18, display: 'flex', alignItems: 'center', fontSize: '0.7rem', fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#7A5C44', width: 28 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Month labels */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 4, height: 20 }}>
                {weeks.map((_, wi) => (
                  <div key={wi} style={{ width: 18, fontSize: '0.7rem', fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#5C4033' }}>
                    {monthLabels[wi]}
                  </div>
                ))}
              </div>

              {/* Cells */}
              <div style={{ display: 'flex', gap: 3 }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {week.map((day, di) => {
                      if (!day) return <div key={di} style={{ width: 18, height: 18 }} />;
                      const ds      = toDateStr(day);
                      const entry   = entryMap[ds];
                      const isToday = ds === todayStr;
                      return (
                        <div
                          key={di}
                          className={`cal-cell${entry ? '' : ' cal-cell-empty'}`}
                          style={{
                            ...(entry ? { backgroundColor: MOOD_COLORS[entry.rating], opacity: 0.85 } : {}),
                            ...(isToday ? { outline: '2px solid #5C4033', outlineOffset: '1px' } : {}),
                          }}
                          onMouseEnter={() => setTooltip({ date: ds, entry })}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div className="j-sticky" style={{ marginTop: 14, padding: '10px 14px', maxWidth: 280 }}>
            <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: '#2C1810' }}>
              {tooltip.date}
            </p>
            {tooltip.entry ? (
              <>
                <p style={{ margin: '4px 0 0', fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#3D2B1F', fontSize: '0.9rem' }}>
                  {MOOD_EMOJIS[tooltip.entry.rating]}{' '}
                  <strong>{MOOD_LABELS[tooltip.entry.rating]}</strong>
                  {' '}({tooltip.entry.rating}/5)
                </p>
                {tooltip.entry.note && (
                  <p style={{ margin: '4px 0 0', color: '#5C4033', fontStyle: 'italic', fontSize: '0.88rem', fontFamily: 'Lora, serif', lineHeight: 1.5 }}>
                    "{tooltip.entry.note}"
                  </p>
                )}
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#7A5C44' }}>
                  Sentiment: {tooltip.entry.sentiment.score > 0 ? '+' : ''}{tooltip.entry.sentiment.score}
                </p>
              </>
            ) : (
              <p style={{ margin: '4px 0 0', color: '#7A5C44', fontStyle: 'italic', fontFamily: 'Lora, serif', fontSize: '0.88rem' }}>No entry</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: '#5C4033' }}>Mood:</span>
          {[1, 2, 3, 4, 5].map(r => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: MOOD_COLORS[r], boxShadow: '1px 1px 2px rgba(60,40,20,0.15)' }} />
              <span style={{ fontSize: '0.82rem' }}>{MOOD_EMOJIS[r]}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
            <div className="cal-cell-empty" style={{ width: 14, height: 14, borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.76rem', color: '#7A5C44' }}>No entry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
