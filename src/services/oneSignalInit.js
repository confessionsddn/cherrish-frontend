// services/oneSignalInit.js — OneSignal SDK initialization
import { API_URL } from './api';

const ONESIGNAL_APP_ID = '79ef7558-1556-4939-81ca-70747e98e33a';

let initialized = false;
let currentPlayerId = null;

/**
 * Initialize OneSignal after user authenticates
 */
export async function initOneSignal(userId) {
  if (initialized) return;
  if (!window.OneSignalDeferred) {
    console.warn('OneSignal SDK not loaded');
    return;
  }

  try {
    window.OneSignalDeferred.push(async function(OneSignal) {
      // Initialize
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: { enable: false }, // We use our own bell
        allowLocalhostAsSecureOrigin: true
      });

      initialized = true;
      console.log('✅ OneSignal initialized');

      // Login user (associates this device with user)
      await OneSignal.login(userId);

      // Request permission if not granted
      const permission = OneSignal.Notifications.permission;
      if (!permission) {
        // Wait a few seconds before prompting (less intrusive)
        setTimeout(async () => {
          await OneSignal.Notifications.requestPermission();
        }, 5000);
      }

      // Listen for subscription changes (get player_id)
      OneSignal.User.PushSubscription.addEventListener('change', (event) => {
        const playerId = event.current?.id;
        if (playerId && playerId !== currentPlayerId) {
          currentPlayerId = playerId;
          registerPlayerWithBackend(playerId);
        }
      });

      // Also check current subscription
      const subscription = OneSignal.User.PushSubscription;
      if (subscription?.id) {
        currentPlayerId = subscription.id;
        registerPlayerWithBackend(subscription.id);
      }
    });
  } catch (error) {
    console.error('OneSignal init error:', error);
  }
}

/**
 * Register player_id with backend
 */
async function registerPlayerWithBackend(playerId) {
  try {
    const response = await fetch(`${API_URL}/api/notifications/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ player_id: playerId, device_type: getDeviceType() })
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Push notifications registered:', playerId.substring(0, 8) + '...');
    }
  } catch (error) {
    console.error('Failed to register player_id:', error);
  }
}

/**
 * Unregister on logout
 */
export async function unregisterOneSignal() {
  if (!currentPlayerId) return;

  try {
    await fetch(`${API_URL}/api/notifications/unregister`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ player_id: currentPlayerId })
    });
  } catch (error) {
    console.error('Unregister error:', error);
  }

  currentPlayerId = null;
}

/**
 * Detect device type
 */
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios_web';
  if (/Android/.test(ua)) return 'android_web';
  return 'web';
}
