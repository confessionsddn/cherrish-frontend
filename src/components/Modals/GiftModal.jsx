// frontend/src/components/Modals/GiftModal.jsx
// COMPLETE GIFT MODAL - fully integrated with backend
import { useState, useEffect } from 'react';
import { API_URL } from '../../services/api';
import './GiftModal.css';

// Gift catalog - MUST match backend GIFT_CATALOG keys exactly
const GIFTS = [
  // Effects (Awards)
  { id: 'gold_hearts',  emoji: '💖', name: 'Sparkle Hearts', cost: 25,  rarity: 'uncommon',  description: 'Shower them with sparkle' },
  { id: 'cyber_glitch', emoji: '⚡', name: 'Cyber Glitch',   cost: 35,  rarity: 'rare',      description: 'Glitch in the matrix' },
  { id: 'holo_foil',    emoji: '🌈', name: 'Holo Foil',      cost: 50,  rarity: 'rare',      description: 'Holographic vibes' },
  { id: 'sunset_bg',    emoji: '🌅', name: 'Vaporwave',      cost: 40,  rarity: 'rare',      description: 'Aesthetic sunset' },
  { id: 'starry_night', emoji: '🌌', name: 'Galactic Mode',  cost: 45,  rarity: 'rare',      description: 'Out of this world' },
  { id: 'retro_vhs',    emoji: '📼', name: 'Retro VHS',      cost: 30,  rarity: 'uncommon',  description: 'Nostalgic rewind' },
  // Physical Gifts
  { id: 'roses',        emoji: '🌹', name: 'Mega Bouquet',   cost: 20,  rarity: 'common',    description: 'Classic romance' },
  { id: 'ring',         emoji: '💎', name: 'Diamond Ring',   cost: 100, rarity: 'legendary', description: 'You are precious' },
  { id: 'chocolates',   emoji: '🍫', name: 'Luxury Box',     cost: 15,  rarity: 'common',    description: 'Sweet treat' },
  { id: 'teddy',        emoji: '🧸', name: 'Giant Teddy',    cost: 40,  rarity: 'rare',      description: 'Warm cuddles' },
  { id: 'mixtape',      emoji: '🎵', name: 'Lo-Fi Mixtape',  cost: 15,  rarity: 'common',    description: 'Chill vibes only' },
  { id: 'poem',         emoji: '📝', name: 'Epic Poem',      cost: 25,  rarity: 'uncommon',  description: 'Words from the heart' },
];

const RARITY_COLORS = {
  common:    { bg: '#f0f0f0', text: '#666', border: '#ccc' },
  uncommon:  { bg: '#E8F5E9', text: '#2E7D32', border: '#4CAF50' },
  rare:      { bg: '#E3F2FD', text: '#1565C0', border: '#2196F3' },
  legendary: { bg: '#FFF9E6', text: '#E65100', border: '#FFD700' },
};

export default function GiftModal({ confession, onClose, user, onCreditsUpdate }) {
  const [selectedGift, setSelectedGift] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [giftHistory, setGiftHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'history'

  useEffect(() => {
    if (activeTab === 'history') fetchGiftHistory();
  }, [activeTab]);

  const fetchGiftHistory = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/gifts/confession/${confession.id}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      const data = await res.json();
      if (data.success) setGiftHistory(data.gifts);
    } catch (e) {
      console.error('Fetch gift history error:', e);
    }
  };

  const sendGift = async () => {
    if (!selectedGift) return;
    if (user.credits < selectedGift.cost) {
      setError(`Not enough credits! Need ${selectedGift.cost}, have ${user.credits}`);
      return;
    }

    setSending(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/gifts/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confession_id: confession.id,
          gift_type: selectedGift.id,
          message: message.trim() || null
        })
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        onCreditsUpdate && onCreditsUpdate(data.credits_remaining);
        setTimeout(() => onClose(), 2500);
      } else {
        setError(data.error || 'Failed to send gift');
      }
    } catch (e) {
      setError('Network error. Try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="gift-overlay" onClick={onClose}>
        <div className="gift-sent-screen" onClick={e => e.stopPropagation()}>
          <div className="gift-sent-emoji">{selectedGift?.emoji}</div>
          <h2>GIFT SENT! 🎉</h2>
          <p>Your {selectedGift?.name} was sent successfully!</p>
          <p className="gift-sent-sub">Closing in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gift-overlay" onClick={onClose}>
      <div className="gift-modal" onClick={e => e.stopPropagation()}>
        <button className="gift-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="gift-header">
          <h2>🎁 SEND A GIFT</h2>
          <p className="gift-to">To: <strong>{confession.username} #{confession.user_number}</strong></p>
          <div className="gift-credits-badge">
            💰 {user?.credits || 0} credits
          </div>
        </div>

        {/* Tabs */}
        <div className="gift-tabs">
          <button
            className={`gift-tab ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            🎁 SEND
          </button>
          <button
            className={`gift-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 HISTORY
          </button>
        </div>

        {/* SEND TAB */}
        {activeTab === 'send' && (
          <>
            {/* Gift grid */}
            <div className="gift-grid">
              {GIFTS.map(gift => {
                const rarity = RARITY_COLORS[gift.rarity];
                const canAfford = (user?.credits || 0) >= gift.cost;
                const isSelected = selectedGift?.id === gift.id;

                return (
                  <button
                    key={gift.id}
                    className={`gift-item ${isSelected ? 'selected' : ''} ${!canAfford ? 'cant-afford' : ''}`}
                    style={{
                      '--rarity-bg': rarity.bg,
                      '--rarity-border': rarity.border,
                      '--rarity-text': rarity.text,
                    }}
                    onClick={() => canAfford && setSelectedGift(isSelected ? null : gift)}
                  >
                    <span className="gift-item-emoji">{gift.emoji}</span>
                    <span className="gift-item-name">{gift.name}</span>
                    <span className="gift-item-cost">{gift.cost} 💰</span>
                    {!canAfford && <span className="gift-item-lock">🔒</span>}
                    {isSelected && <span className="gift-item-check">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Selected gift preview */}
            {selectedGift && (
              <div className="gift-selected-preview">
                <span className="preview-emoji">{selectedGift.emoji}</span>
                <div className="preview-info">
                  <strong>{selectedGift.name}</strong>
                  <span>{selectedGift.description}</span>
                </div>
                <span className="preview-cost">{selectedGift.cost} credits</span>
              </div>
            )}

            {/* Message input */}
            <textarea
              className="gift-message-input"
              placeholder="Add a sweet message... (optional)"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={100}
              rows={2}
            />
            {message && (
              <div className="gift-char-count">{message.length}/100</div>
            )}

            {/* Error */}
            {error && <div className="gift-error">⚠️ {error}</div>}

            {/* Send button */}
            <button
              className={`gift-send-btn ${!selectedGift ? 'disabled' : ''}`}
              onClick={sendGift}
              disabled={!selectedGift || sending}
            >
              {sending ? '✨ SENDING...' : selectedGift ? `SEND ${selectedGift.emoji} (${selectedGift.cost} credits)` : 'SELECT A GIFT'}
            </button>
          </>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="gift-history">
            {giftHistory.length === 0 ? (
              <div className="gift-history-empty">
                <p>🎁 No gifts sent yet</p>
                <small>Be the first to send a gift!</small>
              </div>
            ) : (
              giftHistory.map((g, i) => {
                const giftData = GIFTS.find(x => x.id === g.gift_type);
                return (
                  <div key={i} className="gift-history-item">
                    <span className="gh-emoji">{giftData?.emoji || '🎁'}</span>
                    <div className="gh-info">
                      <strong>Anonymous</strong>
                      {g.message && <span className="gh-message">"{g.message}"</span>}
                    </div>
                    <span className="gh-time">{timeAgo(g.created_at)}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}
