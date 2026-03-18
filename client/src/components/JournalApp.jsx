import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MoodForm from './MoodForm';
import MoodCalendar from './MoodCalendar';
import MoodChart from './MoodChart';
import WeeklySummary from './WeeklySummary';
import WordCloud from './WordCloud';

const BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const TABS = [
  { id: 'log',      label: 'Log Mood',  icon: '✏️' },
  { id: 'calendar', label: 'Calendar',  icon: '📅' },
  { id: 'trends',   label: 'Trends',    icon: '📈' },
  { id: 'summary',  label: 'Summary',   icon: '📊' },
  { id: 'words',    label: 'Words',     icon: '💬' },
];

const PenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
      stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 5l4 4" stroke="#8B6F47" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function JournalApp() {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('log');
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${BASE}/api/moods`);
      setEntries(res.data);
      setServerError(false);
    } catch {
      setServerError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="j-header px-4 py-3">
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PenIcon />
            <div>
              <h1 className="j-heading" style={{ fontSize: '1.55rem' }}>My Mood Journal</h1>
              <p style={{ margin: 0, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#6B4F35' }}>
                daily mood &amp; sentiment diary
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#4A3728' }}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </div>
            <Link
              to="/"
              style={{
                fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem', fontWeight: 600,
                color: '#7A5C44', textDecoration: 'none',
                borderBottom: '1px dashed rgba(92,64,51,0.45)',
                paddingBottom: 1, whiteSpace: 'nowrap',
              }}
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="j-nav">
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`j-tab${activeTab === tab.id ? ' j-tab-active' : ''}`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ maxWidth: 920, margin: '0 auto', padding: '20px 16px 64px' }}>

        {serverError && (
          <div className="j-error" style={{ marginBottom: 16 }}>
            Cannot connect to server. In development, make sure it's running on port 3001.
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: 14, opacity: 0.8 }}>📖</div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#5C4033', fontSize: '1rem', margin: 0 }}>
                Opening your journal…
              </p>
            </div>
          </div>
        ) : (
          <div className="j-page animate-paper-in">
            {/* Coffee stain accents */}
            <div className="coffee-stain" style={{ width: 100, height: 90, top: 8, right: 16, opacity: 1 }} />
            <div className="coffee-stain" style={{ width: 70, height: 60, bottom: 20, left: 20, opacity: 0.7 }} />

            {activeTab === 'log'      && <MoodForm onMoodLogged={fetchEntries} entries={entries} />}
            {activeTab === 'calendar' && <MoodCalendar entries={entries} />}
            {activeTab === 'trends'   && <MoodChart entries={entries} />}
            {activeTab === 'summary'  && <WeeklySummary entries={entries} />}
            {activeTab === 'words'    && <WordCloud entries={entries} />}
          </div>
        )}
      </main>
    </div>
  );
}
