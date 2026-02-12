// frontend/src/components/Header/Header.jsx - REDESIGNED VERSION
import { useState, useEffect } from 'react';
import './Header.css';
import ChangeUsernameModal from '../Modals/ChangeUsernameModal';
import { API_URL } from '../../services/api';
import { navigateTo } from '../../utils/navigation';

const LEGAL_LINKS = [
  { path: '/contact-us', label: 'Contact' },
  { path: '/terms-and-conditions', label: 'Terms' },
  { path: '/refunds-and-cancellation-policy', label: 'Refunds' }
];

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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleAdminChatClick = () => {
    navigateTo('/admin-chat');
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
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUnreadCount(data.unread_count || 0);
          }
        }
      } catch (error) {
        // Silent fail
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-dropdown') && !e.target.closest('.user-profile-btn')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <header className="header-neo">
        <div className="header-container">
          
          {/* LEFT: LOGO */}
          <div className="header-left">
            <button
              className="logo-btn"
              onClick={() => navigateTo('/')}
              aria-label="Home"
            >
              <span className="logo-text">CHERRISH</span>
              <span className="logo-subtext">SOCIAL PLATFORM</span>
            </button>
          </div>

          {/* CENTER: NAVIGATION */}
          <div className="header-nav-wrap">
          <nav className="header-nav">
            <button 
              className="nav-link"
              onClick={() => navigateTo('/community')}
            >
              <i className="fas fa-users"></i>
              <span>Community</span>
            </button>
            
            <button 
              className="nav-link nav-link-support"
              onClick={handleAdminChatClick}
            >
              <i className="fas fa-headset"></i>
              <span>Support</span>
              {unreadCount > 0 && (
                <span className="nav-badge pulse">{unreadCount}</span>
              )}
            </button>

            {user.is_admin && (
              <button 
                className="nav-link nav-link-admin"
                onClick={() => navigateTo('/admin')}
              >
                <i className="fas fa-shield-halved"></i>
                <span>Admin</span>
              </button>
            )}
          </nav>
          <nav className="header-legal-nav" aria-label="Legal pages">
            {LEGAL_LINKS.map((link) => (
              <button
                key={link.path}
                className="nav-link-small"
                onClick={() => navigateTo(link.path)}
              >
                {link.label}
              </button>
            ))}
          </nav>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="header-right">
            
            {/* Credits Button */}
            <button 
              className="credits-btn"
              onClick={onBuyCreditsClick}
              title="Buy credits"
            >
              <div className="credits-icon">
                <i className="fas fa-coins"></i>
              </div>
              <div className="credits-info">
                <span className="credits-label">Credits</span>
                <span className="credits-value">{credits.toLocaleString()}</span>
              </div>
              <i className="fas fa-plus credits-plus"></i>
            </button>

            {/* Premium Button */}
            {!user.is_premium && (
              <button 
                className="premium-btn shine"
                onClick={onPremiumClick}
              >
                <i className="fas fa-crown"></i>
                <span>Premium</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button 
              className="icon-btn"
              onClick={onThemeToggle}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
            </button>

            {/* User Menu */}
            <div className="user-menu">
              <button 
                className="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-id">#{user.user_number}</span>
                </div>
                {user.is_premium && (
                  <i className="fas fa-crown premium-crown"></i>
                )}
                <i className={`fas fa-chevron-down dropdown-arrow ${showUserMenu ? 'rotated' : ''}`}></i>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-badge">
                      <div className="dropdown-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="dropdown-username">{user.username}</div>
                        <div className="dropdown-email">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-section">
                    <div className="dropdown-stat">
                      <i className="fas fa-coins"></i>
                      <span>{credits} Credits</span>
                    </div>
                    {user.is_premium && (
                      <div className="dropdown-stat premium">
                        <i className="fas fa-crown"></i>
                        <span>Premium Active</span>
                      </div>
                    )}
                  </div>

                  <div className="dropdown-divider"></div>

                  {!user.username_changed && (
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowUsernameModal(true);
                      }}
                    >
                      <i className="fas fa-user-edit"></i>
                      <span>Change Username</span>
                      <span className="dropdown-badge">
                        {user.is_premium ? 'FREE' : '200₹'}
                      </span>
                    </button>
                  )}

                  {user.is_admin && (
                    <button 
                      className="dropdown-item"
                      onClick={() => navigateTo('/admin/community')}
                    >
                      <i className="fas fa-poll"></i>
                      <span>Community Admin</span>
                    </button>
                  )}

                  <div className="dropdown-divider"></div>

                  <button 
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-right-from-bracket"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
            <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
              
              {/* Mobile Header */}
              <div className="mobile-menu-header">
                <div className="mobile-user-card">
                  <div className="mobile-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="mobile-user-info">
                    <div className="mobile-username">
                      {user.username}
                      {user.is_premium && <i className="fas fa-crown"></i>}
                    </div>
                    <div className="mobile-user-id">#{user.user_number}</div>
                    <div className="mobile-user-email">{user.email}</div>
                  </div>
                </div>

                <div className="mobile-credits-card">
                  <div className="mobile-credits-label">Your Balance</div>
                  <div className="mobile-credits-amount">
                    <i className="fas fa-coins"></i>
                    {credits.toLocaleString()} Credits
                  </div>
                  <button 
                    className="mobile-add-credits"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onBuyCreditsClick();
                    }}
                  >
                    <i className="fas fa-plus"></i> Buy More
                  </button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="mobile-menu-nav">
                <button 
                  className="mobile-nav-item"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateTo('/community');
                  }}
                >
                  <i className="fas fa-users"></i>
                  <span>Community</span>
                </button>

                <button 
                  className="mobile-nav-item"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleAdminChatClick();
                  }}
                >
                  <i className="fas fa-headset"></i>
                  <span>Support</span>
                  {unreadCount > 0 && (
                    <span className="mobile-badge">{unreadCount}</span>
                  )}
                </button>

                {LEGAL_LINKS.map((link) => (
                  <button
                    key={link.path}
                    className="mobile-nav-item legal-item"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo(link.path);
                    }}
                  >
                    <i className="fas fa-file-lines"></i>
                    <span>{link.label}</span>
                  </button>
                ))}

                {user.is_admin && (
                  <>
                    <button 
                      className="mobile-nav-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo('/admin');
                      }}
                    >
                      <i className="fas fa-shield-halved"></i>
                      <span>Admin Panel</span>
                    </button>

                    <button 
                      className="mobile-nav-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateTo('/admin/community');
                      }}
                    >
                      <i className="fas fa-poll"></i>
                      <span>Community Admin</span>
                    </button>
                  </>
                )}

                {!user.is_premium && (
                  <button 
                    className="mobile-nav-item premium-item"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onPremiumClick();
                    }}
                  >
                    <i className="fas fa-crown"></i>
                    <span>Get Premium</span>
                  </button>
                )}

                {!user.username_changed && (
                  <button 
                    className="mobile-nav-item"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowUsernameModal(true);
                    }}
                  >
                    <i className="fas fa-user-edit"></i>
                    <span>Change Username</span>
                    <span className="mobile-price-tag">
                      {user.is_premium ? 'FREE' : '200₹'}
                    </span>
                  </button>
                )}

                <button 
                  className="mobile-nav-item"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onThemeToggle();
                  }}
                >
                  <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
                  <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </button>

                <button 
                  className="mobile-nav-item danger-item"
                  onClick={handleLogout}
                >
                  <i className="fas fa-right-from-bracket"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Username Change Modal */}
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
    </>
  );
}
