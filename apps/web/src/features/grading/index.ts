export function normalizeScore(score: number) {
  return Math.min(100, Math.max(0, score));
}