// frontend/src/components/Modals/NotificationSettingsModal.jsx
// Lets users toggle which notification types they receive. Wired to the
// existing backend API: GET/PUT /api/notifications/preferences.
import { useState, useEffect } from 'react';
import { API_URL } from '../../services/api';
import './NotificationSettingsModal.css';

// Order + labels for each preference key the backend understands.
const PREF_ROWS = [
  { key: 'replies',        icon: '💬', label: 'Replies',        desc: 'When someone replies to your confession' },
  { key: 'reply_likes',    icon: '❤️', label: 'Reply likes',    desc: 'When someone likes your reply' },
  { key: 'reactions',      icon: '🔥', label: 'Reactions',      desc: 'Milestones on your confessions' },
  { key: 'gifts',          icon: '🎁', label: 'Gifts',          desc: 'When you receive a gift' },
  { key: 'themes',         icon: '🎨', label: 'Themes',         desc: 'When you unlock a new theme' },
  { key: 'polls',          icon: '📊', label: 'Polls',          desc: 'New community polls' },
  { key: 'announcements',  icon: '📢', label: 'Announcements',  desc: 'Updates from the Cherrish team' },
  { key: 'account_status', icon: '⭐', label: 'Account status', desc: 'Premium & account alerts' },
];

// Fallback defaults if the API returns nothing (mirrors backend defaults).
const DEFAULT_PREFS = {
  reactions: true, gifts: true, themes: true, replies: true,
  reply_likes: true, announcements: true, polls: true, account_status: true,
};

export default function NotificationSettingsModal({ onClose }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications/preferences`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        const data = await res.json();
        if (active && data.success && data.preferences) {
          setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
        }
      } catch (e) {
        console.error('Failed to load notification preferences:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const toggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/notifications/preferences`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: prefs }),
      });
      const data = await res.json();
      if (data.success) {
        onClose();
      } else {
        setError('Could not save settings. Try again.');
      }
    } catch (e) {
      console.error('Failed to save notification preferences:', e);
      setError('Could not save settings. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notif-settings-overlay" onClick={onClose}>
      <div className="notif-settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="notif-settings-close" onClick={onClose} aria-label="Close">✕</button>

        <h2 className="notif-settings-title">🔔 NOTIFICATIONS</h2>
        <p className="notif-settings-subtitle">Choose what you want to be notified about</p>

        {loading ? (
          <div className="notif-settings-loading">Loading…</div>
        ) : (
          <div className="notif-settings-list">
            {PREF_ROWS.map((row) => (
              <div className="notif-settings-row" key={row.key}>
                <div className="notif-settings-info">
                  <span className="notif-settings-icon">{row.icon}</span>
                  <div className="notif-settings-text">
                    <span className="notif-settings-label">{row.label}</span>
                    <span className="notif-settings-desc">{row.desc}</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!prefs[row.key]}
                  aria-label={row.label}
                  className={`notif-toggle ${prefs[row.key] ? 'on' : 'off'}`}
                  onClick={() => toggle(row.key)}
                >
                  <span className="notif-toggle-knob" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="notif-settings-error">{error}</p>}

        <button
          className="notif-settings-save"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? 'SAVING…' : 'SAVE'}
        </button>
      </div>
    </div>
  );
}
