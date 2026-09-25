// frontend/src/components/PWAInstallPrompt/IOSInstallPrompt.jsx
// iOS Safari does NOT fire `beforeinstallprompt`, so the standard PWA prompt
// never shows on iPhone/iPad. iOS also only delivers web push when the site
// is installed to the Home Screen (iOS 16.4+). This component nudges iOS
// users to add the app so they can receive system push notifications.
//
// Behaviour:
//  - Auto-shows (after a short delay) on iOS when NOT installed and NOT snoozed.
//  - Dismissing snoozes for a few days rather than disabling forever, so users
//    who forgot to install are reminded on a later visit.
//  - Never shows once the app is actually installed (standalone).
//  - Can be re-triggered on demand from the menu via triggerIOSInstallPrompt().
import { useState, useEffect } from 'react';
import './IOSInstallPrompt.css';
import {
  canInstallOnIOS,
  isSnoozed,
  snooze,
  IOS_PROMPT_EVENT
} from '../../services/iosInstall';

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Auto-show path: only iOS + not installed + not recently snoozed.
    let timer;
    if (canInstallOnIOS() && !isSnoozed()) {
      timer = setTimeout(() => setShow(true), 8000);
    }

    // Manual re-trigger path: menu button dispatches this event.
    const onManualTrigger = () => {
      // Still pointless if already installed; canInstallOnIOS guards that.
      if (canInstallOnIOS()) setShow(true);
    };
    window.addEventListener(IOS_PROMPT_EVENT, onManualTrigger);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(IOS_PROMPT_EVENT, onManualTrigger);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    snooze(); // remind again in a few days instead of never
  };

  if (!show) return null;

  return (
    <div className="ios-install-overlay" role="dialog" aria-labelledby="ios-install-title">
      <div className="ios-install-box">
        <button className="ios-install-close" onClick={handleDismiss} aria-label="Dismiss">
          ✕
        </button>

        <div className="ios-install-icon">🔔</div>

        <h3 id="ios-install-title">TURN ON NOTIFICATIONS</h3>
        <p>
          To get replies, gifts and reactions on your Home Screen, add Cherrish
          to your Home Screen first. It only takes a second.
        </p>

        <ol className="ios-install-steps">
          <li>
            <span className="ios-step-num">1</span>
            <span>
              Tap the <strong>Share</strong> button
              <span className="ios-share-icon" aria-hidden="true"> ⬆️</span> in Safari
            </span>
          </li>
          <li>
            <span className="ios-step-num">2</span>
            <span>Choose <strong>Add to Home Screen</strong></span>
          </li>
          <li>
            <span className="ios-step-num">3</span>
            <span>Open Cherrish from your Home Screen &amp; allow notifications</span>
          </li>
        </ol>

        <button className="ios-install-ok" onClick={handleDismiss}>
          GOT IT
        </button>
      </div>
    </div>
  );
}
