/**
 * Fixed-window, in-memory counter. Good enough for a single API instance;
 * with several instances behind a load balancer each keeps its own counts.
 */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Seconds until `key` may try again, or 0 if it is not limited. */
  retryAfter(key: string): number {
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= this.now() || entry.count < this.max) return 0;
    return Math.ceil((entry.resetAt - this.now()) / 1000);
  }

  record(key: string): void {
    const now = this.now();
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      this.prune(now);
    } else {
      entry.count += 1;
    }
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  private prune(now: number): void {
    if (this.hits.size < 10_000) return;
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) this.hits.delete(key);
    }
  }
}
