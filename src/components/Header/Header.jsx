import { useState, useEffect } from 'react';
import './Header.css';
import ChangeUsernameModal from '../Modals/ChangeUsernameModal';
import { API_URL } from '../../services/api';

// A simple SVG component for visual flair
const BrutalistStar = ({ color = "black", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{marginLeft: 'auto'}}>
    <path 
      d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" 
      fill={color} stroke="black" strokeWidth="2"
    />
  </svg>
);

export default function Header({
  credits, onThemeToggle, onPremiumClick, onBuyCreditsClick, theme, isAuthenticated, user
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

  useEffect(() => {
    if (!isAuthenticated) return;
    // ... (Your existing fetch logic remains the same) ...
  }, [isAuthenticated]);

  return (
    <header className="navbar">
      <div className="nav-container">
        
        {/* BRAND: Red Montserrat Text */}
        <div className="nav-brand" onClick={() => window.location.href = '/'}>
          <div className="logo-icon-box">
            <i className="fas fa-heart"></i>
          </div>
          <h1 className="logo-text">CHERRISH.</h1>
        </div>

        {/* DESKTOP HUD */}
        <div className="desktop-controls">
          {isAuthenticated && user && (
            <>
              {/* User Pill */}
              <div className="user-badge-pill">
                <div className="user-avatar"><i className="fas fa-user-astronaut"></i></div>
                <div className="user-details">
                  <span className="u-name">{user.username}</span>
                  <span className="u-tag">#{user.user_number}</span>
                </div>
              </div>

              {/* Credits Button (Green) */}
              <button className="neo-btn btn-credits" onClick={onBuyCreditsClick}>
                <i className="fas fa-coins"></i> {credits}
              </button>

              {/* Community (Blue) */}
              <button className="neo-btn btn-community" onClick={() => window.location.href = '/community'}>
                COMMUNITY
              </button>

              {/* Support */}
              <button className="neo-btn" onClick={() => window.location.href = '/admin-chat'}>
                SUPPORT {unreadCount > 0 && <span style={{color:'red', fontWeight:'900'}}>!</span>}
              </button>

              {/* Logout (Red) */}
              <button className="neo-btn btn-logout" onClick={handleLogout} title="Logout">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <button className="neo-btn btn-theme" onClick={onThemeToggle}>
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* MOBILE MENU (Full Width Overlay) */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {isAuthenticated && user && (
          <div className="m-profile">
            <div className="m-head">
              <div className="m-avatar"><i className="fas fa-user-astronaut"></i></div>
              <div>
                <div style={{fontWeight:'900', fontSize:'1.2rem'}}>{user.username}</div>
                <div style={{fontFamily:'monospace'}}>#{user.user_number}</div>
              </div>
              {user.is_premium && <BrutalistStar color="#ff3333" />}
            </div>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'2px dashed black', paddingTop:'15px'}}>
              <span style={{fontWeight:'bold'}}>BALANCE: {credits}</span>
              <button 
                onClick={() => handleMobileAction(onBuyCreditsClick)}
                style={{background:'black', color:'#00e676', border:'none', padding:'8px 12px', fontWeight:'bold', cursor:'pointer'}}
              >
                + ADD
              </button>
            </div>
          </div>
        )}

        <div className="m-btn-grid">
           {/* Huge Mobile Buttons for Easy Access */}
          <button className="neo-btn m-btn btn-community" onClick={() => handleMobileAction(() => window.location.href = '/community')}>
            <i className="fas fa-comments"></i> COMMUNITY AREA
          </button>
          
          <button className="neo-btn m-btn" onClick={() => handleMobileAction(() => window.location.href = '/admin-chat')}>
            <i className="fas fa-headset"></i> SUPPORT CHAT
          </button>

          <button className="neo-btn m-btn btn-theme" style={{width:'100%', color: 'var(--neo-yellow)'}} onClick={() => handleMobileAction(onThemeToggle)}>
             {theme === 'light' ? 'SWITCH TO DARK' : 'SWITCH TO LIGHT'}
          </button>

          {isAuthenticated && (
            <button className="neo-btn m-btn btn-logout" onClick={() => handleMobileAction(handleLogout)}>
              LOG OUT
            </button>
          )}
        </div>
      </div>

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
