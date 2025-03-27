
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
    // For empty keys, never rate limit
    if (!key || key.trim() === '') {
      console.log('Empty key provided to rate limiter, not limiting');
      return false;
    }
    
    const now = Date.now();
    const lastRequest = this.cache.get(key);
    
    // If no previous request, this is the first time - not rate limited
    if (!lastRequest) {
      console.log(`First request from ${key}, setting timestamp and not limiting`);
      this.cache.set(key, now);
      return false;
    }
    
    // Check if within cooldown period
    const timeSinceLastRequest = now - lastRequest;
    const isLimited = timeSinceLastRequest < cooldownPeriod;
    
    // Always update the timestamp for subsequent checks, even if rate limited
    if (!isLimited) {
      this.cache.set(key, now);
    }
    
    console.log(`Rate limit check for ${key}: last request ${timeSinceLastRequest}ms ago, cooldown: ${cooldownPeriod}ms, limited: ${isLimited}`);
    
    return isLimited;
  }
  
  /**
   * Start a timer to clean up expired entries
   */
  private startCleanupTimer() {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let removedCount = 0;
      
      // Remove entries older than TTL
      for (const [key, timestamp] of this.cache.entries()) {
        if (now - timestamp > this.timeToLive) {
          this.cache.delete(key);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        console.log(`Rate limiter cleanup: removed ${removedCount} expired entries`);
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
    console.log('Rate limiter cache cleared');
  }
  
  /**
   * Remove a specific key from the cache
   */
  remove(key: string) {
    const removed = this.cache.delete(key);
    console.log(`Removed key ${key} from rate limiter: ${removed}`);
    return removed;
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
