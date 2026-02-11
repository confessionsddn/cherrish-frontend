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
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  };

  const handleMobileAction = (action) => {
    if (action) action();
    setIsMobileMenuOpen(false);
  };

  // Fetch unread count logic (kept same as original)
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
      } catch (error) { console.error(error); }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // --- RENDER HELPERS ---
  
  const UnreadBadge = () => unreadCount > 0 && (
    <span className="badge-count">{unreadCount}</span>
  );

  return (
    <header className="navbar">
      <div className="nav-container">
        
        {/* 1. BRAND */}
        <div className="nav-brand" onClick={() => window.location.href = '/'}>
          <div className="logo-icon-box">
            <i className="fas fa-heart"></i>
          </div>
          <h1 className="logo-text">cherrish.</h1>
        </div>

        {/* 2. DESKTOP CONTROLS */}
        <div className="desktop-controls">
          {isAuthenticated && user && (
            <>
              {/* User Tag */}
              <div className="user-tag">
                <div className="u-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="u-info">
                  <span className="u-name">{user.username}</span>
                  <span className="u-num">#{user.user_number}</span>
                </div>
              </div>

              {/* Credits */}
              <button className="nb-btn btn-credits" onClick={onBuyCreditsClick} title="Add Credits">
                <div className="credits-inner">
                  <span className="credits-lbl">BALANCE</span>
                  <span className="credits-val">{credits}</span>
                </div>
                <i className="fas fa-plus-circle"></i>
              </button>

              {/* Actions */}
              {!user.username_changed && (
                <button className="nb-btn" onClick={() => setShowUsernameModal(true)} title="Change Username">
                  <i className="fas fa-pen"></i>
                </button>
              )}

              <button className="nb-btn btn-community" onClick={() => window.location.href = '/community'}>
                COMMUNITY
              </button>

              <button className="nb-btn btn-support" onClick={() => window.location.href = '/admin-chat'}>
                <i className="fas fa-comment-dots"></i>
                <UnreadBadge />
              </button>

              {user.is_admin && (
                <button className="nb-btn btn-admin" onClick={() => window.location.href = '/admin'}>
                  <i className="fas fa-shield-alt"></i>
                </button>
              )}

              {!user.is_premium && (
                <button className="nb-btn btn-premium" onClick={onPremiumClick}>
                  PREMIUM
                </button>
              )}

              <button className="nb-btn btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </>
          )}

          <button className="nb-btn btn-theme" onClick={onThemeToggle}>
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
          </button>
        </div>

        {/* 3. MOBILE TOGGLE */}
        <button 
          className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* 4. MOBILE MENU OVERLAY */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {isAuthenticated && user && (
          <div className="m-profile-card">
            <div className="m-header-row">
              <div className="m-avatar-lg">
                <i className="fas fa-user-astronaut"></i>
              </div>
              <div className="u-info">
                <span className="u-name" style={{fontSize: '1.2rem'}}>{user.username}</span>
                <span className="u-num">#{user.user_number}</span>
                {user.is_premium && <span style={{fontWeight:'bold', color: 'var(--pop-pink)'}}>PREMIUM MEMBER</span>}
              </div>
            </div>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong>CREDITS: {credits}</strong>
            </div>

            <button className="nb-btn m-buy-credits" onClick={() => handleMobileAction(onBuyCreditsClick)}>
              <i className="fas fa-coins"></i> GET MORE CREDITS
            </button>
          </div>
        )}

        <div className="m-grid">
          {/* Theme Toggle - Full Width */}
          <button className="nb-btn m-full-width" onClick={() => handleMobileAction(onThemeToggle)}>
             <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i> &nbsp;
             SWITCH TO {theme === 'light' ? 'DARK' : 'LIGHT'}
          </button>

          {isAuthenticated ? (
            <>
              <button className="nb-btn m-full-width btn-community" onClick={() => handleMobileAction(() => window.location.href = '/community')}>
                <i className="fas fa-comments"></i> COMMUNITY
              </button>

              <button className="nb-btn m-full-width btn-support" onClick={() => handleMobileAction(() => window.location.href = '/admin-chat')}>
                <i className="fas fa-headset"></i> SUPPORT
                <UnreadBadge />
              </button>

              {!user?.is_premium && (
                <button className="nb-btn m-full-width btn-premium" onClick={() => handleMobileAction(onPremiumClick)}>
                   <i className="fas fa-crown"></i> UPGRADE TO PREMIUM
                </button>
              )}

              {/* Smaller Utility Buttons */}
              {!user?.username_changed && (
                <button className="nb-btn" onClick={() => handleMobileAction(() => setShowUsernameModal(true))}>
                  CHANGE NAME
                </button>
              )}
              
              <button className="nb-btn btn-logout" onClick={() => handleMobileAction(handleLogout)}>
                LOGOUT
              </button>

              {user?.is_admin && (
                <button className="nb-btn btn-admin m-full-width" onClick={() => handleMobileAction(() => window.location.href = '/admin')}>
                  ADMIN DASHBOARD
                </button>
              )}
            </>
          ) : (
            // Guest State for Mobile
            <div style={{textAlign: 'center', gridColumn: '1/-1'}}>
              <p>Please log in to access features.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
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
