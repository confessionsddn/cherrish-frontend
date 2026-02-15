// frontend/src/components/Header/Header.jsx - MOBILE FIRST REDESIGN
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
    if (window.confirm('Logout?')) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
      <header className="header-clean">
        <div className="header-wrap">
          
          {/* LOGO (ALWAYS VISIBLE) */}
          <button className="logo" onClick={() => window.location.href = '/'}>
            <span className="logo-main">cherrish</span>
            <span className="logo-sub">SOCIAL PLATFORM</span>
          </button>

          {/* DESKTOP NAV (HIDDEN ON MOBILE) */}
          <nav className="desktop-nav">
            <button onClick={() => window.location.href = '/community'}>
              <i className="fas fa-users"></i><span>Community</span>
            </button>
            
            <button onClick={() => window.location.href = '/admin-chat'} className="support-btn">
              <i className="fas fa-headset"></i><span>Support</span>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {user.is_admin && (
              <button onClick={() => window.location.href = '/admin'} className="admin-btn">
                <i className="fas fa-shield-halved"></i><span>Admin</span>
              </button>
            )}
          </nav>

          {/* DESKTOP LEGAL LINKS */}
          <div className="desktop-legal">
            <button onClick={() => window.location.href = '/contact-us'}>Contact</button>
            <button onClick={() => window.location.href = '/terms-and-conditions'}>Terms</button>
            <button onClick={() => window.location.href = '/refunds-and-cancellation-policy'}>Refunds</button>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="desktop-actions">
            
            {/* Credits */}
            <button className="credits-pill" onClick={onBuyCreditsClick}>
              <i className="fas fa-coins"></i>
              <div>
                <span className="label">CREDITS</span>
                <span className="value">{credits}</span>
              </div>
              <i className="fas fa-plus plus-icon"></i>
            </button>

            {/* Premium */}
            {!user.is_premium && (
              <button className="premium-pill" onClick={onPremiumClick}>
                <i className="fas fa-crown"></i><span>PREMIUM</span>
              </button>
            )}

            {/* Theme */}
            <button className="icon-only" onClick={onThemeToggle}>
              <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
            </button>

            {/* User */}
            <div className="user-badge">
              <div className="avatar">{user.username[0].toUpperCase()}</div>
              <div className="info">
                <span className="name">{user.username}</span>
                <span className="num">#{user.user_number}</span>
              </div>
              {user.is_premium && <i className="fas fa-crown crown-icon"></i>}
            </div>
          </div>

          {/* MOBILE ACTIONS (ONLY HAMBURGER + CREDITS) */}
          <div className="mobile-actions">
            <button className="mobile-credits" onClick={onBuyCreditsClick}>
              <i className="fas fa-coins"></i>
              <span>{credits}</span>
            </button>

            <button className="hamburger" onClick={toggleMobileMenu}>
              <span className={isMobileMenuOpen ? 'active' : ''}></span>
              <span className={isMobileMenuOpen ? 'active' : ''}></span>
              <span className={isMobileMenuOpen ? 'active' : ''}></span>
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-panel" onClick={(e) => e.stopPropagation()}>
            
            {/* User Card */}
            <div className="mobile-user">
              <div className="mobile-avatar">{user.username[0].toUpperCase()}</div>
              <div>
                <div className="mobile-name">{user.username} {user.is_premium && '⭐'}</div>
                <div className="mobile-email">{user.email}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mobile-menu-items">
              
              <button onClick={() => { toggleMobileMenu(); window.location.href = '/community'; }}>
                <i className="fas fa-users"></i><span>Community</span>
              </button>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin-chat'; }}>
                <i className="fas fa-headset"></i><span>Support</span>
                {unreadCount > 0 && <span className="mini-badge">{unreadCount}</span>}
              </button>

              {user.is_admin && (
                <button onClick={() => { toggleMobileMenu(); window.location.href = '/admin'; }}>
                  <i className="fas fa-shield-halved"></i><span>Admin Panel</span>
                </button>
              )}

              {!user.is_premium && (
                <button onClick={() => { toggleMobileMenu(); onPremiumClick(); }} className="premium-item">
                  <i className="fas fa-crown"></i><span>Get Premium</span>
                </button>
              )}

              {!user.username_changed && (
                <button onClick={() => { toggleMobileMenu(); setShowUsernameModal(true); }}>
                  <i className="fas fa-user-edit"></i><span>Change Username</span>
                  <span className="price-tag">{user.is_premium ? 'FREE' : '200₹'}</span>
                </button>
              )}

              <div className="divider"></div>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/contact-us'; }} className="legal-item">
                <i className="fas fa-envelope"></i><span>Contact Us</span>
              </button>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/terms-and-conditions'; }} className="legal-item">
                <i className="fas fa-file-contract"></i><span>Terms & Conditions</span>
              </button>

              <button onClick={() => { toggleMobileMenu(); window.location.href = '/refunds-and-cancellation-policy'; }} className="legal-item">
                <i className="fas fa-undo"></i><span>Refund Policy</span>
              </button>

              <div className="divider"></div>

              <button onClick={() => { toggleMobileMenu(); onThemeToggle(); }}>
                <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
                <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
              </button>

              <button onClick={handleLogout} className="danger">
                <i className="fas fa-right-from-bracket"></i><span>Logout</span>
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
