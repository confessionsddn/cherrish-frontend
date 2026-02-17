// frontend/src/components/Modals/ThemeSelectorModal.jsx
import { useTheme, THEMES } from '../../context/ThemeContext';
import './ThemeSelectorModal.css';

export default function ThemeSelectorModal({ onClose, user }) {
  const { currentTheme, isDark, isAutoMode, unlockedThemes, switchTheme, toggleAutoMode } = useTheme();

  const handleSelect = (themeId) => {
    const success = switchTheme(themeId);
    if (!success) return; // Locked
    onClose();
  };

  const giftsReceived = user?.gifts_received || 0;

  return (
    <div className="theme-overlay" onClick={onClose}>
      <div className="theme-modal" onClick={e => e.stopPropagation()}>
        <button className="theme-close" onClick={onClose}>✕</button>

        <h2 className="theme-title">🎨 CHOOSE THEME</h2>
        <p className="theme-subtitle">Unlock special themes by receiving gifts</p>

        {/* Auto mode toggle */}
        <div className="auto-mode-row">
          <div className="auto-mode-info">
            <span className="auto-mode-label">🌗 AUTO MODE</span>
            <span className="auto-mode-desc">Follows your system (light/dark)</span>
          </div>
          <button
            className={`auto-toggle ${isAutoMode ? 'auto-on' : 'auto-off'}`}
            onClick={toggleAutoMode}
          >
            {isAutoMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Theme grid */}
        <div className="theme-grid">
          {Object.values(THEMES).map(theme => {
            const isUnlocked = unlockedThemes.includes(theme.id);
            const isActive = currentTheme === theme.id;
            const giftsNeeded = theme.requiredGifts - giftsReceived;

            return (
              <button
                key={theme.id}
                className={`theme-card 
                  ${isActive ? 'theme-active' : ''} 
                  ${!isUnlocked ? 'theme-locked' : ''}
                  theme-preview-${theme.id}`}
                onClick={() => handleSelect(theme.id)}
                disabled={!isUnlocked}
              >
                <div className="theme-card-inner">
                  <span className="theme-emoji">{theme.emoji}</span>
                  <span className="theme-name">{theme.name}</span>

                  {isActive && (
                    <span className="theme-badge-active">✓ ACTIVE</span>
                  )}

                  {!isUnlocked && (
                    <span className="theme-badge-locked">
                      🔒 {giftsNeeded} more gifts
                    </span>
                  )}

                  {isUnlocked && !isActive && (
                    <span className="theme-badge-free">TAP TO USE</span>
                  )}
                </div>

                {/* Preview dots */}
                <div className="theme-preview-dots">
                  <span className="dot dot-1" />
                  <span className="dot dot-2" />
                  <span className="dot dot-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Gift progress */}
        {giftsReceived < 200 && (
          <div className="gift-progress">
            <p className="gift-progress-label">
              🎁 You've received <strong>{giftsReceived}</strong> gifts
            </p>
            <div className="gift-milestones">
              {[
                { gifts: 50, theme: 'Midnight Rose 🌹' },
                { gifts: 100, theme: 'Golden Hour ✨' },
                { gifts: 200, theme: 'Neon Cyberpunk ⚡' },
              ].map(m => (
                <div key={m.gifts} className={`milestone ${giftsReceived >= m.gifts ? 'reached' : ''}`}>
                  <span className="milestone-bar">
                    <span
                      className="milestone-fill"
                      style={{ width: `${Math.min(100, (giftsReceived / m.gifts) * 100)}%` }}
                    />
                  </span>
                  <span className="milestone-label">{m.gifts} gifts → {m.theme}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
