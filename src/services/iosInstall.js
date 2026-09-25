// services/iosInstall.js
// Shared helpers + a tiny event bus for the iOS "Add to Home Screen" prompt.
// iOS Safari never fires `beforeinstallprompt`, and iOS only delivers web push
// once the site is installed to the Home Screen (iOS 16.4+). We nudge users to
// install, but politely: dismissals snooze rather than disable forever, and the
// prompt disappears permanently the moment the app is actually installed.

const SNOOZE_KEY = 'ios_install_snooze_until';
const SNOOZE_DAYS = 3;
export const IOS_PROMPT_EVENT = 'cherrish:show-ios-install';

/** True on iPhone/iPad/iPod, including iPadOS 13+ which reports as Mac. */
export function isIOS() {
  const ua = window.navigator.userAgent;
  const iOSDevice = /iPhone|iPad|iPod/.test(ua);
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

/** True when the app is running as an installed PWA (Home Screen / standalone). */
export function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator.standalone === true
  );
}

/**
 * Whether an iOS user could benefit from installing: it's iOS AND not already
 * installed. Used both to auto-show the prompt and to decide whether to show
 * the "Add to Home Screen" control in the menu.
 */
export function canInstallOnIOS() {
  return isIOS() && !isStandalone();
}

/** True if the prompt is currently snoozed (recently dismissed). */
export function isSnoozed() {
  const until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
  return Date.now() < until;
}

/** Snooze the auto-prompt for a few days after a dismissal. */
export function snooze() {
  const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(SNOOZE_KEY, String(until));
}

/** Clear the snooze (used when the user manually re-triggers from the menu). */
export function clearSnooze() {
  localStorage.removeItem(SNOOZE_KEY);
}

/**
 * Manually trigger the prompt (e.g. from a Settings/menu button). Clears the
 * snooze so the prompt shows immediately even if recently dismissed.
 */
export function triggerIOSInstallPrompt() {
  clearSnooze();
  window.dispatchEvent(new CustomEvent(IOS_PROMPT_EVENT));
}
