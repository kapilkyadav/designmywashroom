
/**
 * Simple rate limiter to prevent abuse
 * Keeps track of last request time for each key and limits requests based on cooldown period
 */
export class RateLimiter {
  private cache: Map<string, number>;
  private timeToLive: number;
  private cleanupInterval: NodeJS.Timeout | null;

  /**
   * @param timeToLive Time in milliseconds to keep entries in cache
   */
  constructor(timeToLive: number) {
    this.cache = new Map<string, number>();
    this.timeToLive = timeToLive;
    this.cleanupInterval = null;
    
    // Start cleanup timer
    this.startCleanupTimer();
  }
  
  /**
   * Check if a key is rate limited
   * @param key The key to check (e.g. email, IP, etc.)
   * @param cooldownPeriod Optional cooldown period in ms, defaults to 2 minutes
   * @returns true if rate limited, false otherwise
   */
  isRateLimited(key: string, cooldownPeriod: number = 2 * 60 * 1000): boolean {
    const now = Date.now();
    const lastRequest = this.cache.get(key) || 0;
    
    // If within cooldown period, rate limit
    if (now - lastRequest < cooldownPeriod) {
      return true;
    }
    
    // Update last request time
    this.cache.set(key, now);
    return false;
  }
  
  /**
   * Start a timer to clean up expired entries
   */
  private startCleanupTimer() {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      
      // Remove entries older than TTL
      for (const [key, timestamp] of this.cache.entries()) {
        if (now - timestamp > this.timeToLive) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Run cleanup every minute
    
    // Ensure timer doesn't prevent Node from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }
  
  /**
   * Clear all entries from the cache
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * Stop the cleanup timer
   */
  stopCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
