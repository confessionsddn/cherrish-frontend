// frontend/src/components/Header/Header.jsx - COMPLETE WORKING VERSION
import { useState, useEffect } from 'react';
import './Header.css';
import ChangeUsernameModal from '../Modals/ChangeUsernameModal';

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

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileAction = (action) => {
    if (action) action();
    setIsMobileMenuOpen(false);
  };

  // Navigate to admin chat
  const handleAdminChatClick = () => {
    window.location.href = '/admin-chat';
  };

  // Fetch unread count
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin-messages/unread-count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (!response.ok) {
          console.error('Unread count fetch failed:', response.status);
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          setUnreadCount(data.unread_count || 0);
        }
      } catch (error) {
        console.error('Unread count error:', error);
      }
    };

    // Fetch immediately
    fetchUnreadCount();
    
    // Poll every 10 seconds (faster refresh)
    const interval = setInterval(fetchUnreadCount, 10000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* LOGO SECTION */}
        <div className="nav-brand">
          <div className="logo-icon-box">
            <i className="fas fa-heart"></i>
          </div>
          <h1 className="logo-text">cherrish.</h1>
        </div>

        {/* DESKTOP HUD */}
        <div className="desktop-controls">
          {isAuthenticated && user && (
            <>
              {/* Admin Button */}
              {user.is_admin && (
                <button
                  className="nav-btn btn-admin"
                  onClick={() => (window.location.href = '/admin')}
                  title="Admin Panel"
                >
                  <i className="fas fa-shield-alt"></i>
                </button>
              )}

              {/* SUPPORT BUTTON - FIXED */}
              <button
                type="button"
                className="nav-btn btn-support contact-admin-btn"
                title="Contact Admin"
                onClick={handleAdminChatClick}
              >
                <i className="fas fa-comment-dots"></i>
                <span className="nav-btn-text">SUPPORT</span>
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </button>

              {/* Community Buttons */}
              <button
                className="nav-btn btn-community"
                onClick={() => (window.location.href = '/community')}
                title="Community Polls & Messages"
              >
                <i className="fas fa-comments"></i> COMMUNITY
              </button>

              {user.is_admin && (
                <button
                  className="nav-btn btn-community-admin"
                  onClick={() => (window.location.href = '/admin/community')}
                  title="Manage Community"
                >
                  <i className="fas fa-poll"></i>
                </button>
              )}

              {/* Username Change */}
              {!user.username_changed && (
                <button
                  className="nav-btn btn-username"
                  onClick={() => setShowUsernameModal(true)}
                  title={`Change username (${user.is_premium ? 'FREE' : '200 credits'}) - Once only!`}
                >
                  <i className="fas fa-user-edit"></i>
                </button>
              )}

              {/* User Badge */}
              <div className="user-badge-pill">
                <div className="user-avatar">
                  <i className="fas fa-user-astronaut"></i>
                </div>
                <div className="user-details">
                  <span className="u-name">{user.username}</span>
                  <span className="u-tag">#{user.user_number}</span>
                </div>
                {user.is_premium && <span className="premium-star">⭐</span>}
              </div>

              {/* Credits */}
              <button
                className="credits-ticket clickable-credits"
                onClick={onBuyCreditsClick}
                title="Buy more credits"
              >
                <span className="c-label">BALANCE</span>
                <span className="c-value">
                  <i className="fas fa-coins"></i> {credits}
                </span>
                <i className="fas fa-plus-circle add-credits-icon"></i>
              </button>
            </>
          )}

          {/* Action Buttons */}
          <div className="action-group">
            <button className="nav-btn btn-theme" onClick={onThemeToggle}>
              <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
            </button>

            {isAuthenticated && !user?.is_premium && (
              <button className="nav-btn btn-premium wiggle-effect" onClick={onPremiumClick}>
                <i className="fas fa-crown"></i> PREMIUM
              </button>
            )}

            {isAuthenticated && (
              <button className="nav-btn btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {isAuthenticated && user && (
            <div className="mobile-user-card">
              <div className="m-card-header">
                <div className="m-avatar">
                  <i className="fas fa-user-astronaut"></i>
                </div>
                <div className="m-user-info">
                  <span className="m-username">{user.username}</span>
                  <span className="m-usertag">#{user.user_number}</span>
                  {user.is_premium && <span className="m-premium-badge">⭐ PREMIUM</span>}
                </div>
              </div>
              <div className="m-card-divider"></div>
              <div className="m-credits-row">
                <span>CREDITS AVAILABLE</span>
                <div className="m-credits-badge">
                  <i className="fas fa-coins"></i> {credits}
                </div>
              </div>
              <button
                className="m-buy-credits-btn"
                onClick={() => handleMobileAction(onBuyCreditsClick)}
              >
                <i className="fas fa-plus-circle"></i> BUY MORE CREDITS
              </button>
            </div>
          )}

          {/* Mobile Buttons */}
          <div className="mobile-grid">
            {/* SUPPORT BUTTON - MOBILE */}
            <button
              className="m-btn m-support"
              onClick={() => handleMobileAction(handleAdminChatClick)}
            >
              <i className="fas fa-comment-dots"></i> SUPPORT
              {unreadCount > 0 && (
                <span className="m-unread-badge">{unreadCount}</span>
              )}
            </button>

            {isAuthenticated && !user?.username_changed && (
              <button
                className="m-btn m-username"
                onClick={() => handleMobileAction(() => setShowUsernameModal(true))}
              >
                <i className="fas fa-user-edit"></i> CHANGE USERNAME
              </button>
            )}

            <button
              className="m-btn m-theme"
              onClick={() => handleMobileAction(onThemeToggle)}
            >
              <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
              {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
            </button>

            <button
              className="m-btn m-community"
              onClick={() => handleMobileAction(() => (window.location.href = '/community'))}
            >
              <i className="fas fa-comments"></i> COMMUNITY
            </button>

            {isAuthenticated && user?.is_admin && (
              <>
                <button
                  className="m-btn m-community-admin"
                  onClick={() =>
                    handleMobileAction(() => (window.location.href = '/admin/community'))
                  }
                >
                  <i className="fas fa-poll"></i> MANAGE COMMUNITY
                </button>

                <button
                  className="m-btn m-admin"
                  onClick={() => handleMobileAction(() => (window.location.href = '/admin'))}
                >
                  <i className="fas fa-shield-alt"></i> ADMIN PANEL
                </button>
              </>
            )}

            {isAuthenticated && !user?.is_premium && (
              <button
                className="m-btn m-premium"
                onClick={() => handleMobileAction(onPremiumClick)}
              >
                <i className="fas fa-crown"></i> GET PREMIUM
              </button>
            )}

            {isAuthenticated && (
              <button
                className="m-btn m-logout"
                onClick={() => handleMobileAction(handleLogout)}
              >
                <i className="fas fa-sign-out-alt"></i> LOGOUT
              </button>
            )}
          </div>
        </div>
      </div>

      {showUsernameModal && (
        <ChangeUsernameModal
          onClose={() => setShowUsernameModal(false)}
          currentUsername={user.username}
          isPremium={user.is_premium}
          credits={credits}
          onSuccess={(newUsername, newCredits) => {
            setShowUsernameModal(false);
            window.location.reload();
          }}
        />
      )}
    </header>
  );
}