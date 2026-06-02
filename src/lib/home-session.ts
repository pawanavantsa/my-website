export const HOME_SCROLL_KEY = "xeroura-home-scroll-y";

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
    sessionStorage.setItem(HOME_SCROLL_KEY, String(Math.max(0, y)));
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
