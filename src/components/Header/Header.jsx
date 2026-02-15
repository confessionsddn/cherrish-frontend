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

  // Fetch unread count logic remains same
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
          
          {/* 1. LOGO (Text Only - Chillax Font) */}
          <div className="logo-wrapper" onClick={() => window.location.href = '/'}>
            <h1 className="brand-text">cherrish</h1>
          </div>

          {/* 2. DESKTOP NAVIGATION (Visible on Desktop) */}
          <nav className="desktop-nav">
            <button className="neo-btn nav-btn" onClick={() => window.location.href = '/community'}>
              COMMUNITY
            </button>
            
            <button className="neo-btn nav-btn" onClick={() => window.location.href = '/admin-chat'}>
              SUPPORT
              {unreadCount > 0 && <span className="neo-badge">{unreadCount}</span>}
            </button>

            {user.is_admin && (
              <button className="neo-btn nav-btn admin-btn" onClick={() => window.location.href = '/admin'}>
                ADMIN
              </button>
            )}
          </nav>

          {/* 3. RIGHT ACTIONS */}
          <div className="right-actions">
            
            {/* CREDITS PILL (Mobile & Desktop) */}
            <div className="credits-wrapper" onClick={onBuyCreditsClick}>
              <div className="credits-count">
                <span className="coin-symbol">●</span> 
                {credits}
              </div>
              <button className="plus-btn">+</button>
            </div>

            {/* DESKTOP EXTRAS (Theme, Profile, Premium) */}
            <div className="desktop-extras">
              {!user.is_premium && (
                <button className="neo-btn premium-btn" onClick={onPremiumClick}>
                  GET PREMIUM
                </button>
              )}
              
              <button className="neo-btn icon-btn" onClick={onThemeToggle}>
                {theme === 'light' ? '☾' : '☼'}
              </button>

              {/* No Icon, Just Username */}
              <div className="user-tag" onClick={() => setShowUsernameModal(true)}>
                 @{user.username}
              </div>
            </div>

            {/* HAMBURGER (Mobile Only) */}
            <button 
              className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
              onClick={toggleMobileMenu}
            >
              <div className="bar top"></div>
              <div className="bar middle"></div>
              <div className="bar bottom"></div>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            
            <div className="drawer-header">
               <span className="drawer-user">@{user.username}</span>
               <div className="drawer-close" onClick={toggleMobileMenu}>✕</div>
            </div>

            <div className="drawer-content">
              
              <div className="menu-group">
                <button onClick={() => { toggleMobileMenu(); window.location.href = '/community'; }} className="drawer-btn blue">
                  COMMUNITY HUB
                </button>

                <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin-chat'; }} className="drawer-btn blue">
                  SUPPORT CHAT
                  {unreadCount > 0 && <span className="drawer-badge">{unreadCount}</span>}
                </button>

                {user.is_admin && (
                  <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin'; }} className="drawer-btn purple">
                    ADMIN PANEL
                  </button>
                )}
              </div>

              <div className="menu-group">
                {!user.is_premium && (
                  <button onClick={() => { toggleMobileMenu(); onPremiumClick(); }} className="drawer-btn gold">
                    UPGRADE PREMIUM
                  </button>
                )}

                {!user.username_changed && (
                  <button onClick={() => { toggleMobileMenu(); setShowUsernameModal(true); }} className="drawer-btn white">
                    CHANGE USERNAME
                    <span className="price-tag">{user.is_premium ? 'FREE' : '200₹'}</span>
                  </button>
                )}

                <button onClick={() => { toggleMobileMenu(); onThemeToggle(); }} className="drawer-btn white">
                  SWITCH THEME ({theme === 'light' ? 'DARK' : 'LIGHT'})
                </button>
              </div>

              <div className="legal-links">
                <a href="/terms-and-conditions">Terms</a>
                <a href="/contact-us">Contact</a>
                <a href="/refunds-and-cancellation-policy">Refunds</a>
              </div>

              {/* CHERRY RED LOGOUT */}
              <button onClick={handleLogout} className="drawer-btn logout-btn">
                LOGOUT
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
