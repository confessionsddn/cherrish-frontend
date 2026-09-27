// services/deepLink.js
// Scroll to and briefly highlight a target confession when the user arrives
// via a notification deep-link (e.g. /?confession=<id>).

/** Read the ?confession= id from the current URL, or null. */
export function getTargetConfessionId() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('confession');
  } catch {
    return null;
  }
}

/** Remove the ?confession= param from the URL without reloading. */
export function clearConfessionParam() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('confession');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  } catch {
    /* no-op */
  }
}

/**
 * Scroll to the confession card and flash a highlight. Returns true if the
 * element was found (so callers can stop retrying). Safe to call repeatedly.
 */
export function scrollToConfession(confessionId) {
  if (!confessionId) return false;
  const el = document.getElementById(`confession-${confessionId}`);
  if (!el) return false;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('deeplink-highlight');
  setTimeout(() => el.classList.remove('deeplink-highlight'), 2500);
  return true;
}
