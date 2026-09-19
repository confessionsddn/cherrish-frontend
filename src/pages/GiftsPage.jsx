import React, { useEffect, useState } from 'react';
import { giftsAPI } from '../services/api';
import './GiftsPage.css';

const GiftsPage = () => {
  const [activeTab, setActiveTab] = useState('received');

  // Data buckets
  const [inventory, setInventory] = useState([]);
  const [sent, setSent] = useState([]);
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingTheme, setTogglingTheme] = useState(null);

  // Load everything up front so tab switches are instant.
  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, sentRes, themesRes] = await Promise.all([
        giftsAPI.getInventory(),
        giftsAPI.getSent(),
        giftsAPI.getThemes()
      ]);
      setInventory(invRes.inventory || []);
      setSent(sentRes.sent || []);
      setThemes(themesRes.themes || []);
      setActiveTheme(themesRes.active_theme || null);
      setIsAdmin(!!(invRes.is_admin || themesRes.is_admin));
    } catch (err) {
      console.error('Failed to load gifts data:', err);
      setError('Could not load your gifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleTheme = async (themeName, makeActive) => {
    setTogglingTheme(themeName);
    try {
      await giftsAPI.toggleTheme(themeName, makeActive);
      // Optimistically refresh theme state.
      setActiveTheme(makeActive ? themeName : null);
      setThemes((prev) =>
        prev.map((t) => ({
          ...t,
          is_active: makeActive ? t.theme_name === themeName : false
        }))
      );
    } catch (err) {
      console.error('Toggle theme failed:', err);
      setError(err.message || 'Failed to switch theme.');
    } finally {
      setTogglingTheme(null);
    }
  };

  return (
    <div className="gifts-page">
      <div className="gifts-header">
        <h1 className="gifts-title">
          <i className="fas fa-gift"></i> GIFTS &amp; SKINS
        </h1>
        <p className="gifts-subtitle">
          Collect gifts to unlock card skins. Activate one to style all your confessions.
        </p>
        {isAdmin && (
          <span className="gifts-admin-badge">
            <i className="fas fa-crown"></i> ADMIN — all skins unlocked
          </span>
        )}
      </div>

      <div className="gifts-tabs">
        <button
          className={`gifts-tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <i className="fas fa-inbox"></i> RECEIVED
        </button>
        <button
          className={`gifts-tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <i className="fas fa-paper-plane"></i> SENT
        </button>
        <button
          className={`gifts-tab ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveTab('themes')}
        >
          <i className="fas fa-palette"></i> SKINS
        </button>
      </div>

      {loading && <div className="gifts-loading">Loading your gifts…</div>}
      {error && !loading && <div className="gifts-error">{error}</div>}

      {!loading && !error && (
        <div className="gifts-content">
          {activeTab === 'received' && (
            <ReceivedTab inventory={inventory} />
          )}
          {activeTab === 'sent' && <SentTab sent={sent} />}
          {activeTab === 'themes' && (
            <ThemesTab
              themes={themes}
              activeTheme={activeTheme}
              togglingTheme={togglingTheme}
              onToggle={handleToggleTheme}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// RECEIVED TAB — progress bars per gift type
// ============================================
const ReceivedTab = ({ inventory }) => {
  if (!inventory.length) {
    return <div className="gifts-empty">No gift data yet. Share confessions to receive gifts!</div>;
  }

  return (
    <div className="received-grid">
      {inventory.map((item) => (
        <div
          key={item.gift_type}
          className={`gift-progress-card ${item.theme_unlocked ? 'unlocked' : ''}`}
        >
          <div className="gift-progress-head">
            <span className="gift-emoji">{item.emoji || '🎁'}</span>
            <div className="gift-names">
              <span className="gift-name">{item.gift_name}</span>
              <span className="gift-theme-label">{item.theme_name} skin</span>
            </div>
            {item.theme_unlocked && (
              <span className="unlock-tick" title="Skin unlocked">
                <i className="fas fa-check-circle"></i>
              </span>
            )}
          </div>

          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${item.progress_percentage}%` }}
            ></div>
          </div>

          <div className="progress-meta">
            <span>
              {item.total_received} / {item.needed_for_unlock}
            </span>
            {item.theme_unlocked ? (
              <span className="unlocked-text">UNLOCKED</span>
            ) : (
              <span className="remaining-text">{item.remaining} to go</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// SENT TAB — history of gifts you sent
// ============================================
const SentTab = ({ sent }) => {
  if (!sent.length) {
    return <div className="gifts-empty">You haven&apos;t sent any gifts yet.</div>;
  }

  return (
    <div className="sent-list">
      {sent.map((g) => (
        <div key={g.id} className="sent-item">
          <span className="sent-emoji">{g.emoji}</span>
          <div className="sent-body">
            <div className="sent-line">
              <span className="sent-gift-name">{g.gift_name}</span>
              <span className="sent-to">
                to {g.recipient_username}#{g.recipient_user_number}
              </span>
            </div>
            {g.confession_preview && (
              <div className="sent-preview">&ldquo;{g.confession_preview}…&rdquo;</div>
            )}
            {g.message && <div className="sent-message">💬 {g.message}</div>}
          </div>
          <div className="sent-meta">
            <span className="sent-price">-{g.gift_price} cr</span>
            <span className="sent-date">{formatDate(g.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// THEMES TAB — activate/deactivate a card skin
// ============================================
const ThemesTab = ({ themes, activeTheme, togglingTheme, onToggle }) => {
  if (!themes.length) {
    return (
      <div className="gifts-empty">
        No skins unlocked yet. Receive enough of a gift to unlock its card skin.
      </div>
    );
  }

  return (
    <div className="themes-grid">
      {themes.map((t) => {
        const isActive = t.is_active || t.theme_name === activeTheme;
        const busy = togglingTheme === t.theme_name;
        return (
          <div
            key={t.theme_name}
            className={`theme-card theme-preview-${t.theme_name} ${isActive ? 'active' : ''}`}
          >
            <div className="theme-card-top">
              <span className="theme-emoji">{t.emoji}</span>
              <span className="theme-label">{t.label}</span>
            </div>
            <button
              className={`theme-toggle-btn ${isActive ? 'on' : ''}`}
              disabled={busy}
              onClick={() => onToggle(t.theme_name, !isActive)}
            >
              {busy ? '…' : isActive ? 'ACTIVE' : 'ACTIVATE'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Small local date formatter (input already IST-adjusted by backend).
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  } catch (_) {
    return '';
  }
}

export default GiftsPage;
