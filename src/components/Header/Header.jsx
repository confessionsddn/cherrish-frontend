// frontend/src/components/Header/Header.jsx
import { useState, useEffect } from 'react';
import './Header.css';
import ChangeUsernameModal from '../Modals/ChangeUsernameModal';
import { API_URL } from '../../services/api';

export default function Header({
  credits,
  onThemeToggle,
  onPremiumClick,
  onBuyCreditsClick,
  theme,
  isAuthenticated,
  user
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    if (window.confirm('Leaving so soon?')) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  // Fetch unread count
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin-messages/unread-count`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) setUnreadCount(data.unread_count || 0);
        }
      } catch (error) {}
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) return null;

  return (
    <>
      <header className="neo-header">
        <div className="neo-container">
          
          {/* 1. LEFT: LOGO */}
          <div className="logo-section">
            <h1 className="brand-text" onClick={() => window.location.href = '/'}>
              cherrish
            </h1>
          </div>

          {/* 2. CENTER: DESKTOP NAV (Hidden on Mobile) */}
          <nav className="desktop-nav">
            <button className="neo-btn" onClick={() => window.location.href = '/community'}>
              COMMUNITY
            </button>
            
            <button className="neo-btn" onClick={() => window.location.href = '/admin-chat'}>
              SUPPORT
              {unreadCount > 0 && <span className="neo-badge">{unreadCount}</span>}
            </button>

            {user.is_admin && (
              <button className="neo-btn admin-btn" onClick={() => window.location.href = '/admin'}>
                ADMIN
              </button>
            )}
          </nav>

          {/* 3. RIGHT: ACTIONS */}
          <div className="right-actions">
            
            {/* CREDITS (Visible everywhere) */}
            <button className="neo-btn credits-btn" onClick={onBuyCreditsClick}>
              <span className="coin-icon">●</span> 
              <span className="amt">{credits}</span>
              <div className="plus-icon">+</div>
            </button>

            {/* DESKTOP ONLY EXTRAS */}
            <div className="desktop-extras">
              <button className="neo-btn icon-btn" onClick={onThemeToggle}>
                {theme === 'light' ? '☾' : '☼'}
              </button>

              <div className="user-pill" onClick={() => setShowUsernameModal(true)}>
                 <span className="avatar-circle">{user.username[0].toUpperCase()}</span>
                 <span className="username-text">{user.username}</span>
              </div>
            </div>

            {/* MOBILE ONLY HAMBURGER */}
            <button 
              className={`neo-btn hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
              onClick={toggleMobileMenu}
            >
              <div className="bar top"></div>
              <div className="bar middle"></div>
              <div className="bar bottom"></div>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            
            <div className="drawer-header">
               <div className="drawer-user-info">
                  <div className="drawer-avatar">{user.username[0]}</div>
                  <span>@{user.username} {user.is_premium && '👑'}</span>
               </div>
               <button className="close-btn" onClick={toggleMobileMenu}>✕</button>
            </div>

            <div className="drawer-content">
              
              <div className="section-label">SOCIAL</div>
              <button onClick={() => { toggleMobileMenu(); window.location.href = '/community'; }} className="neo-btn drawer-item">
                COMMUNITY HUB <i className="fas fa-users"></i>
              </button>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin-chat'; }} className="neo-btn drawer-item">
                SUPPORT CHAT <i className="fas fa-headset"></i>
                {unreadCount > 0 && <span className="drawer-badge">{unreadCount}</span>}
              </button>

              {user.is_admin && (
                <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin'; }} className="neo-btn drawer-item admin-item">
                  ADMIN PANEL <i className="fas fa-shield"></i>
                </button>
              )}

              <div className="section-label">ACCOUNT</div>
              
              {!user.is_premium && (
                <button onClick={() => { toggleMobileMenu(); onPremiumClick(); }} className="neo-btn drawer-item premium-item">
                  GET PREMIUM <span>⭐</span>
                </button>
              )}

              {!user.username_changed && (
                <button onClick={() => { toggleMobileMenu(); setShowUsernameModal(true); }} className="neo-btn drawer-item">
                  CHANGE USERNAME
                  <span className="tag-free">{user.is_premium ? 'FREE' : '200₹'}</span>
                </button>
              )}

              <button onClick={() => { toggleMobileMenu(); onThemeToggle(); }} className="neo-btn drawer-item">
                SWITCH THEME <span className="theme-icon">{theme === 'light' ? '☾' : '☼'}</span>
              </button>

              <div className="legal-row">
                <a href="/terms-and-conditions">Terms</a>
                <a href="/contact-us">Contact</a>
                <a href="/refunds-and-cancellation-policy">Refunds</a>
              </div>

              <button onClick={handleLogout} className="neo-btn logout-btn">
                LOGOUT <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Username Modal */}
      {showUsernameModal && (
        <ChangeUsernameModal
          onClose={() => setShowUsernameModal(false)}
          currentUsername={user.username}
          isPremium={user.is_premium}
          credits={credits}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
