
/**
 * Generic cache utility that can be used across services
 */
export interface CacheItem<T> {
  data: T | null;
  timestamp: number;
}

export interface CacheConfig {
  expiryMs: number;
}

export class CacheManager<T> {
  private cache: CacheItem<T>;
  private config: CacheConfig;
  
  constructor(expiryMs = 2 * 60 * 1000) { // Default 2 minutes
    this.cache = {
      data: null,
      timestamp: 0
    };
    this.config = {
      expiryMs
    };
  }
  
  get(): T | null {
    if (this.isValid()) {
      return this.cache.data;
    }
    return null;
  }
  
  set(data: T): void {
    this.cache = {
      data,
      timestamp: Date.now()
    };
  }
  
  isValid(): boolean {
    return this.cache.data !== null && 
      (Date.now() - this.cache.timestamp < this.config.expiryMs);
  }
  
  clear(): void {
    this.cache = {
      data: null,
      timestamp: 0
    };
  }
}
