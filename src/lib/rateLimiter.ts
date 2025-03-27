
/**
 * Rate limiter utility to prevent excessive submissions
 */
export class RateLimiter {
  private cache: Map<string, number>;
  private expiryMs: number;
  
  constructor(expiryMs = 2 * 60 * 1000) { // Default 2 minutes
    this.cache = new Map<string, number>();
    this.expiryMs = expiryMs;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }
  
  isRateLimited(key: string, limitMs: number = this.expiryMs): boolean {
    if (!key) return false;
    
    const normalizedKey = key.toLowerCase();
    const lastSubmission = this.cache.get(normalizedKey);
    const now = Date.now();
    
    // If we have a previous submission within the rate limit window, rate limit
    if (lastSubmission && (now - lastSubmission < limitMs)) {
      return true;
    }
    
    // Update the last submission time
    this.cache.set(normalizedKey, now);
    return false;
  }
  
  // Cleanup expired entries to prevent memory leaks
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, timestamp] of this.cache.entries()) {
      if (now - timestamp > this.expiryMs) {
        this.cache.delete(key);
      }
    }
  }
}
