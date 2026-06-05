export const HERO_NAME_LINES = ["XEROURA", "TECHNOLOGIES"] as const;

export const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export const SCRAMBLE_START_DELAY_S = 0.05;
export const SCRAMBLE_LETTER_STAGGER_S = 0.08;
export const SCRAMBLE_TICK_MS = 40;
export const SCRAMBLE_TICK_COUNT = 7;

export function heroLetterCount() {
  return HERO_NAME_LINES.join("").length;
}

export function scrambleLetterStartS(index: number) {
  return SCRAMBLE_START_DELAY_S + index * SCRAMBLE_LETTER_STAGGER_S;
}

export function scrambleRevealDurationS() {
  const lastIndex = heroLetterCount() - 1;
  const lastStart = scrambleLetterStartS(lastIndex);
  const tickDuration = (SCRAMBLE_TICK_COUNT * SCRAMBLE_TICK_MS) / 1000;
  return lastStart + tickDuration;
}
