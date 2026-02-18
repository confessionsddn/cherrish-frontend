// frontend/src/components/PWAInstallPrompt/PWAInstallPrompt.jsx
import { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show after 30 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-prompt-overlay">
      <div className="pwa-prompt-box">
        <button className="pwa-close" onClick={handleDismiss}>✕</button>
        
        <div className="pwa-icon">📱</div>
        
        <h3>INSTALL CHERRISH</h3>
        <p>Get the app experience! Faster, works offline, just like a native app.</p>
        
        <div className="pwa-benefits">
          <div className="benefit">⚡ Lightning fast</div>
          <div className="benefit">📴 Works offline</div>
          <div className="benefit">🔔 Push notifications</div>
        </div>

        <button className="pwa-install-btn" onClick={handleInstall}>
          INSTALL NOW
        </button>
        
        <button className="pwa-later-btn" onClick={handleDismiss}>
          Maybe Later
        </button>
      </div>
    </div>
  );
}
