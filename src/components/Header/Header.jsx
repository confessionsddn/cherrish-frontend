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
    if (window.confirm('Are you sure you want to leave?')) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent body scroll when menu is open
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
      <header className="nb-header">
        <div className="nb-container">
          
          {/* 1. LOGO */}
          <button className="nb-logo" onClick={() => window.location.href = '/'}>
            <div className="logo-box">C</div>
            <span className="logo-text">CHERRISH</span>
          </button>

          {/* 2. DESKTOP NAV (Hidden on Mobile) */}
          <nav className="nb-desktop-nav">
            <button className="nb-nav-item" onClick={() => window.location.href = '/community'}>
              Community
            </button>
            <button className="nb-nav-item" onClick={() => window.location.href = '/admin-chat'}>
              Support
              {unreadCount > 0 && <span className="nb-badge">{unreadCount}</span>}
            </button>
            {user.is_admin && (
              <button className="nb-nav-item admin" onClick={() => window.location.href = '/admin'}>
                Admin
              </button>
            )}
          </nav>

          {/* 3. RIGHT SIDE ACTIONS */}
          <div className="nb-actions">
            
            {/* CREDITS (VISIBLE ON MOBILE & DESKTOP) */}
            {/* This acts as the "Buy" trigger */}
            <button className="nb-credits-btn" onClick={onBuyCreditsClick}>
              <span className="coin-icon">
                <i className="fas fa-coins"></i>
              </span>
              <span className="credit-amount">{credits}</span>
              <div className="plus-btn">
                <i className="fas fa-plus"></i>
              </div>
            </button>

            {/* DESKTOP ONLY EXTRAS */}
            <div className="nb-desktop-extras">
              {!user.is_premium && (
                <button className="nb-premium-btn" onClick={onPremiumClick}>
                  PREMIUM <i className="fas fa-crown"></i>
                </button>
              )}
              
              <button className="nb-icon-btn" onClick={onThemeToggle}>
                <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
              </button>

              <div className="nb-user-profile">
                <div className="nb-avatar">{user.username[0].toUpperCase()}</div>
                <span className="nb-username">{user.username}</span>
              </div>
            </div>

            {/* HAMBURGER (MOBILE ONLY) */}
            <button 
              className={`nb-hamburger ${isMobileMenuOpen ? 'open' : ''}`} 
              onClick={toggleMobileMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="nb-mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="nb-mobile-menu" onClick={(e) => e.stopPropagation()}>
            
            {/* Menu Header */}
            <div className="nb-menu-header">
              <div className="nb-menu-user">
                <div className="nb-menu-avatar">
                   {user.username[0].toUpperCase()}
                </div>
                <div className="nb-menu-details">
                  <h3>{user.username} {user.is_premium && <i className="fas fa-crown gold"></i>}</h3>
                  <span className="user-id">#{user.user_number}</span>
                </div>
              </div>
              <button className="nb-close-btn" onClick={toggleMobileMenu}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Menu Links */}
            <div className="nb-menu-list">
              
              {!user.is_premium && (
                <button onClick={() => { toggleMobileMenu(); onPremiumClick(); }} className="nb-menu-item premium-highlight">
                  <span>Upgrade to Premium</span>
                  <i className="fas fa-star"></i>
                </button>
              )}

              <div className="nb-divider">Social</div>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/community'; }} className="nb-menu-item">
                <span>Community Hub</span>
                <i className="fas fa-users"></i>
              </button>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin-chat'; }} className="nb-menu-item">
                <span>Support Chat</span>
                <div className="icon-wrapper">
                  <i className="fas fa-headset"></i>
                  {unreadCount > 0 && <span className="nb-dot"></span>}
                </div>
              </button>

              {user.is_admin && (
                <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin'; }} className="nb-menu-item admin-highlight">
                  <span>Admin Panel</span>
                  <i className="fas fa-shield-halved"></i>
                </button>
              )}

              <div className="nb-divider">Account</div>

              {!user.username_changed && (
                <button onClick={() => { toggleMobileMenu(); setShowUsernameModal(true); }} className="nb-menu-item">
                  <span>Change Username</span>
                  <span className="tag">{user.is_premium ? 'FREE' : '200₹'}</span>
                </button>
              )}

              <button onClick={() => { toggleMobileMenu(); onThemeToggle(); }} className="nb-menu-item">
                <span>Switch Theme</span>
                <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
              </button>

              <div className="nb-legal-row">
                 <a href="/terms-and-conditions">Terms</a>
                 <a href="/contact-us">Contact</a>
                 <a href="/refunds-and-cancellation-policy">Refunds</a>
              </div>

              <button onClick={handleLogout} className="nb-menu-item logout">
                <span>Logout</span>
                <i className="fas fa-right-from-bracket"></i>
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
