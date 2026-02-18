// frontend/src/components/Header/Header.jsx
import { useState, useEffect } from 'react';
import './Header.css';
import ChangeUsernameModal from '../Modals/ChangeUsernameModal';
import { API_URL } from '../../services/api';

export default function Header({
  credits,
  onPremiumClick,
  onBuyCreditsClick,
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
      {/* FONTS INJECTION */}
      <link href="https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&display=swap" rel="stylesheet" />
      <link href="https://api.fontshare.com/v2/css?f[]=archivo@400,600,700&display=swap" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />

      <header className="neo-header">
        <div className="neo-container">
          
          {/* 1. LEFT: LOGO (Clash Display, Smaller, Extreme Left) */}
          <div className="header-left">
            <h1 className="brand-logo" onClick={() => window.location.href = '/'}>
              cherrish
            </h1>
          </div>

          {/* 2. CENTER: DESKTOP NAV (Hidden on Mobile) */}
          <nav className="header-center desktop-nav">
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

          {/* 3. RIGHT: ACTIONS (Extreme Right) */}
          <div className="header-right">
            
            {/* CREDITS (Pill Shaped, No Dot) */}
            <button className="credits-pill" onClick={onBuyCreditsClick}>
              <span className="amt">{credits}</span>
              <div className="plus-circle">+</div>
            </button>

            {/* DESKTOP EXTRAS */}
            <div className="desktop-extras">
              {!user.is_premium && (
                 <button className="neo-btn premium-btn" onClick={onPremiumClick}>
                   GET PREMIUM
                 </button>
              )}

              <div className="user-text-only" onClick={() => setShowUsernameModal(true)}>
                 <span className="u-name">@{user.username}</span>
                 <span className="u-num">#{user.user_number || '1'}</span>
                 {user.is_premium && <i className="fas fa-crown black-crown"></i>}
              </div>

              <button className="neo-btn logout-desktop" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>

            {/* MOBILE HAMBURGER (No Border, 3 Lines) */}
            <button 
              className={`hamburger-clean ${isMobileMenuOpen ? 'active' : ''}`} 
              onClick={toggleMobileMenu}
            >
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            
            <div className="drawer-header">
               <div className="drawer-user-info">
                  <span>@{user.username}</span>
                  <span className="batch-badge">#{user.user_number || '1'}</span>
                  {user.is_premium && <i className="fas fa-crown black-crown-lg"></i>}
               </div>
               <button className="close-btn" onClick={toggleMobileMenu}>✕</button>
            </div>

            <div className="drawer-content">
              
              <div className="section-label">SOCIAL</div>
              <button onClick={() => { toggleMobileMenu(); window.location.href = '/community'; }} className="drawer-item">
                COMMUNITY HUB <i className="fas fa-users"></i>
              </button>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin-chat'; }} className="drawer-item">
                SUPPORT CHAT <i className="fas fa-headset"></i>
                {unreadCount > 0 && <span className="drawer-badge">{unreadCount}</span>}
              </button>

              {user.is_admin && (
                <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin'; }} className="drawer-item admin-item">
                  ADMIN PANEL <i className="fas fa-shield-alt"></i>
                </button>
              )}

              <div className="section-label">ACCOUNT</div>
              
              {!user.is_premium && (
                <button onClick={() => { toggleMobileMenu(); onPremiumClick(); }} className="drawer-item premium-item">
                  GET PREMIUM <i className="fas fa-star"></i>
                </button>
              )}

              {!user.username_changed && (
                <button onClick={() => { toggleMobileMenu(); setShowUsernameModal(true); }} className="drawer-item">
                  CHANGE USERNAME
                </button>
              )}

              <div className="legal-row">
                <a href="/terms-and-conditions">Terms</a>
                <a href="/contact-us">Contact</a>
                <a href="/refunds-and-cancellation-policy">Refunds</a>
              </div>

              {/* CHERRY RED LOGOUT BUTTON */}
              <button onClick={handleLogout} className="logout-btn-mobile">
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
