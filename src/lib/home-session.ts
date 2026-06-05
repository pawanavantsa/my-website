export const HOME_SCROLL_KEY = "xeroura-home-scroll-y";
export const WELCOME_SEEN_KEY = "xeroura-welcome-seen";
export const WELCOME_LOADER_DONE_EVENT = "welcome-loader-done";

let welcomeSessionReady = false;
let welcomeLoaderDone = false;

/** Reset welcome-once flag only on a hard reload of the document. */
export function initWelcomeSession(): void {
  if (typeof window === "undefined" || welcomeSessionReady) return;
  welcomeSessionReady = true;

  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type === "reload") {
      sessionStorage.removeItem(WELCOME_SEEN_KEY);
    }
  } catch {
    /* private mode */
  }
}

/** Show welcome once per session; skip when returning to Home via in-app navigation. */
export function shouldShowWelcome(): boolean {
  if (typeof window === "undefined") return true;
  initWelcomeSession();

  try {
    return sessionStorage.getItem(WELCOME_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markWelcomeSeen(): void {
  try {
    sessionStorage.setItem(WELCOME_SEEN_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function isWelcomeLoaderDone(): boolean {
  return welcomeLoaderDone;
}

export function resetWelcomeLoaderReady(): void {
  welcomeLoaderDone = false;
}

export function dispatchWelcomeLoaderDone(): void {
  welcomeLoaderDone = true;
  window.dispatchEvent(new CustomEvent(WELCOME_LOADER_DONE_EVENT));
}

/** Subscribe to home intro ready; replays immediately if the signal already fired. */
export function subscribeWelcomeLoaderDone(callback: () => void): () => void {
  if (welcomeLoaderDone) callback();
  window.addEventListener(WELCOME_LOADER_DONE_EVENT, callback);
  return () => window.removeEventListener(WELCOME_LOADER_DONE_EVENT, callback);
}

export function getSavedHomeScroll(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(HOME_SCROLL_KEY);
    if (!raw) return 0;
    const y = parseFloat(raw);
    return Number.isFinite(y) ? Math.max(0, y) : 0;
  } catch {
    return 0;
  }
}

export function saveHomeScroll(y: number): void {
  try {
    sessionStorage.setItem(HOME_SCROLL_KEY, String(clampHomeScroll(y)));
  } catch {
    /* private mode */
  }
}

export function getMaxScrollY(): number {
  if (typeof window === "undefined") return 0;
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

export function clampHomeScroll(y: number): number {
  return Math.min(y, getMaxScrollY());
}

export const HOME_SCROLL_RESTORE = "home-scroll-restore";

export function dispatchHomeScrollRestore(y: number): void {
  window.dispatchEvent(new CustomEvent(HOME_SCROLL_RESTORE, { detail: clampHomeScroll(y) }));
}
