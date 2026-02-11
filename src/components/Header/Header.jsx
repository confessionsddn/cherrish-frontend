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

  // --- ACTIONS ---
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  const closeMenu = (callback) => {
    setIsMobileMenuOpen(false);
    if (callback) callback();
  };

  // --- POLLING FOR MESSAGES ---
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
      } catch (error) {
        console.error('Header polling error:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <header className="navbar">
      <div className="nav-container">
        
        {/* 1. BRAND LOGO */}
        <div className="nav-brand" onClick={() => window.location.href = '/'}>
          <div className="logo-box">
            <i className="fas fa-heart"></i>
          </div>
          <h1 className="logo-text">CHERRISH.</h1>
        </div>

        {/* 2. DESKTOP MENU (Hidden on Mobile) */}
        <div className="desktop-menu">
          {isAuthenticated && user && (
            <>
              {/* User Info Pill */}
              <div className="user-pill">
                <div className="pill-avatar"><i className="fas fa-user"></i></div>
                <div className="pill-info">
                  <span className="pill-name">{user.username}</span>
                  <span className="pill-tag">#{user.user_number}</span>
                </div>
              </div>

              {/* Credits */}
              <button className="neo-btn btn-credits" onClick={onBuyCreditsClick}>
                <i className="fas fa-coins"></i> {credits}
              </button>

              {/* Admin Actions Group */}
              {user.is_admin && (
                <>
                  <button className="neo-btn btn-admin btn-icon-only" 
                    onClick={() => window.location.href = '/admin'} 
                    title="Admin Panel"
                  >
                    <i className="fas fa-shield-alt"></i>
                  </button>
                  <button className="neo-btn btn-admin btn-icon-only" 
                    onClick={() => window.location.href = '/admin/community'} 
                    title="Manage Polls/Community"
                  >
                    <i className="fas fa-poll"></i>
                  </button>
                </>
              )}

              {/* Community */}
              <button className="neo-btn btn-community" onClick={() => window.location.href = '/community'}>
                COMMUNITY
              </button>

              {/* Support / Contact Admin */}
              <button className="neo-btn btn-support" onClick={() => window.location.href = '/admin-chat'}>
                SUPPORT
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {/* Username Change (If eligible) */}
              {!user.username_changed && (
                <button className="neo-btn" onClick={() => setShowUsernameModal(true)}>
                  <i className="fas fa-pen"></i>
                </button>
              )}

              {/* Premium Upsell */}
              {!user.is_premium && (
                <button className="neo-btn btn-premium" onClick={onPremiumClick}>
                  PREMIUM
                </button>
              )}

              {/* Logout */}
              <button className="neo-btn btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <button className="neo-btn btn-icon-only" onClick={onThemeToggle} style={{background: 'var(--nb-black)', color: 'white'}}>
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
          </button>
        </div>

        {/* 3. MOBILE HAMBURGER BUTTON */}
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div></div>
          <div></div>
          <div></div>
        </button>
      </div>

      {/* 4. MOBILE DRAWER (All Buttons Restored Here) */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        
        {isAuthenticated && user ? (
          <>
            {/* Mobile Profile Card */}
            <div className="m-profile">
              <div className="m-user-row">
                <div className="m-avatar-box"><i className="fas fa-user-astronaut"></i></div>
                <div>
                  <div style={{fontWeight: 900, fontSize: '1.2rem'}}>{user.username}</div>
                  <div style={{fontFamily: 'monospace'}}>#{user.user_number}</div>
                  {user.is_premium && <span style={{color: 'var(--nb-pink)', fontWeight: 'bold'}}>PREMIUM MEMBER</span>}
                </div>
              </div>
              
              <button className="neo-btn btn-credits span-2" style={{width: '100%'}} onClick={() => closeMenu(onBuyCreditsClick)}>
                <i className="fas fa-coins"></i> BALANCE: {credits} (ADD)
              </button>
            </div>

            {/* Mobile Action Grid */}
            <div className="m-actions-grid">
              
              {/* Community */}
              <button className="neo-btn m-btn btn-community span-2" onClick={() => closeMenu(() => window.location.href = '/community')}>
                <i className="fas fa-comments"></i> COMMUNITY
              </button>

              {/* Support */}
              <button className="neo-btn m-btn btn-support span-2" onClick={() => closeMenu(() => window.location.href = '/admin-chat')}>
                <i className="fas fa-headset"></i> CONTACT SUPPORT
                {unreadCount > 0 && <span className="notif-badge" style={{top: '10px', right: '10px'}}>{unreadCount}</span>}
              </button>

              {/* Admin Area (Restored!) */}
              {user.is_admin && (
                <>
                  <button className="neo-btn m-btn btn-admin" onClick={() => closeMenu(() => window.location.href = '/admin')}>
                    <i className="fas fa-shield-alt"></i> ADMIN PANEL
                  </button>
                  <button className="neo-btn m-btn btn-admin" onClick={() => closeMenu(() => window.location.href = '/admin/community')}>
                    <i className="fas fa-poll"></i> MANAGE POLLS
                  </button>
                </>
              )}

              {/* Utilities */}
              {!user.username_changed && (
                <button className="neo-btn m-btn" onClick={() => closeMenu(() => setShowUsernameModal(true))}>
                  CHANGE NAME
                </button>
              )}

              {!user.is_premium && (
                <button className="neo-btn m-btn btn-premium span-2" onClick={() => closeMenu(onPremiumClick)}>
                   GET PREMIUM
                </button>
              )}

              <button className="neo-btn m-btn" onClick={() => closeMenu(onThemeToggle)}>
                {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
              </button>

              <button className="neo-btn m-btn btn-logout" onClick={handleLogout}>
                LOGOUT
              </button>
            </div>
          </>
        ) : (
          // Guest View
          <div className="m-actions-grid">
            <button className="neo-btn m-btn span-2" onClick={onThemeToggle}>
              SWITCH THEME
            </button>
          </div>
        )}
      </div>

      {/* MODAL RENDER */}
      {showUsernameModal && (
        <ChangeUsernameModal
          onClose={() => setShowUsernameModal(false)}
          currentUsername={user.username}
          isPremium={user.is_premium}
          credits={credits}
          onSuccess={() => {
            setShowUsernameModal(false);
            window.location.reload();
          }}
        />
      )}
    </header>
  );
}
