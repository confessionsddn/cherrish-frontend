// services/oneSignalInit.js — OneSignal SDK initialization (v16 User Model)
import { API_URL } from './api';

const ONESIGNAL_APP_ID = '79ef7558-1556-4939-81ca-70747e98e33a';

let initialized = false;
let currentPlayerId = null;

/**
 * Whether we're running inside an installed PWA (required for iOS web push).
 */
function isStandalonePWA() {
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    // iOS Safari exposes this non-standard flag when launched from home screen
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Initialize OneSignal after user authenticates.
 */
export async function initOneSignal(userId) {
  if (initialized) return;
  if (!window.OneSignalDeferred) {
    console.warn('[OneSignal] SDK not loaded');
    return;
  }

  // iOS ONLY delivers web push when the site is installed to the home screen.
  // In a normal Safari tab there is no point prompting — it will never deliver.
  if (isIOS() && !isStandalonePWA()) {
    console.warn(
      '[OneSignal] iOS detected in a browser tab. System push requires ' +
      '"Add to Home Screen" (iOS 16.4+). Skipping push subscription.'
    );
    // Still mark initialized so we don't loop, but do not attempt subscribe.
  }

  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        // Use our single combined worker (sw.js imports OneSignalSDKWorker.js).
        // This prevents the two-service-worker scope conflict that silently
        // breaks push subscription on Chrome/Android.
        serviceWorkerPath: '/sw.js',
        serviceWorkerParam: { scope: '/' },
        notifyButton: { enable: false }, // We use our own bell
        allowLocalhostAsSecureOrigin: true
      });

      initialized = true;
      console.log('[OneSignal] initialized');

      // Associate this device/subscription with the logged-in user.
      await OneSignal.login(String(userId));

      // Register the change listener BEFORE prompting so we never miss the
      // moment the subscription id is created.
      OneSignal.User.PushSubscription.addEventListener('change', (event) => {
        const playerId = event.current?.id;
        const optedIn = event.current?.optedIn;
        console.log('[OneSignal] subscription change:', { playerId, optedIn });
        if (playerId && optedIn && playerId !== currentPlayerId) {
          currentPlayerId = playerId;
          registerPlayerWithBackend(playerId);
        }
      });

      // On iOS-in-tab we already bailed on subscribing.
      if (isIOS() && !isStandalonePWA()) return;

      // permission is a boolean in v16 (true = granted).
      const granted = OneSignal.Notifications.permission;

      if (!granted) {
        // Prompt shortly after load (less intrusive). requestPermission()
        // must be triggered in response to the user gesture on some browsers;
        // OneSignal handles the native prompt here.
        setTimeout(async () => {
          try {
            await OneSignal.Notifications.requestPermission();
            // After granting, explicitly opt the subscription in.
            await OneSignal.User.PushSubscription.optIn();
          } catch (err) {
            console.warn('[OneSignal] permission request failed:', err);
          }
        }, 5000);
      } else {
        // Already granted — make sure we're opted in and grab the id.
        try {
          await OneSignal.User.PushSubscription.optIn();
        } catch (_) { /* already opted in */ }
      }

      // Grab the current subscription id if it already exists.
      const existingId = OneSignal.User.PushSubscription.id;
      if (existingId && existingId !== currentPlayerId) {
        currentPlayerId = existingId;
        registerPlayerWithBackend(existingId);
      }
    } catch (error) {
      console.error('[OneSignal] init error:', error);
    }
  });
}

/**
 * Register player_id with backend.
 */
async function registerPlayerWithBackend(playerId) {
  try {
    const response = await fetch(`${API_URL}/api/notifications/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ player_id: playerId, device_type: getDeviceType() })
    });

    const data = await response.json();
    if (data.success) {
      console.log('[OneSignal] push registered:', playerId.substring(0, 8) + '...');
    } else {
      console.warn('[OneSignal] backend register failed:', data);
    }
  } catch (error) {
    console.error('[OneSignal] failed to register player_id:', error);
  }
}

/**
 * Unregister on logout.
 */
export async function unregisterOneSignal() {
  if (!currentPlayerId) return;

  try {
    await fetch(`${API_URL}/api/notifications/unregister`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ player_id: currentPlayerId })
    });
  } catch (error) {
    console.error('[OneSignal] unregister error:', error);
  }

  currentPlayerId = null;
}

/**
 * Detect device type.
 */
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios_web';
  if (/Android/.test(ua)) return 'android_web';
  return 'web';
}
