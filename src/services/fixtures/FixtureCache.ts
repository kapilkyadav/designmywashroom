
import { Fixture } from '@/lib/supabase';
import { CacheManager } from '@/lib/cache';

/**
 * Manages caching for fixture data
 */
export class FixtureCache {
  private allFixturesCache: CacheManager<Fixture[]>;
  private categoriesCache: Record<string, CacheManager<Fixture[]>>;
  private fixtureByIdCache: Record<string, CacheManager<Fixture>>;
  
  constructor(cacheExpiryMs = 2 * 60 * 1000) {
    this.allFixturesCache = new CacheManager<Fixture[]>(cacheExpiryMs);
    this.categoriesCache = {};
    this.fixtureByIdCache = {};
  }
  
  // All fixtures cache methods
  getAllFixtures(): Fixture[] | null {
    return this.allFixturesCache.get();
  }
  
  setAllFixtures(fixtures: Fixture[]): void {
    this.allFixturesCache.set(fixtures);
    
    // Update byId cache for quick lookups
    fixtures.forEach(fixture => {
      this.setFixtureById(fixture.id, fixture);
    });
  }
  
  // Category fixtures cache methods
  getCategoryFixtures(category: string): Fixture[] | null {
    if (!this.categoriesCache[category]) {
      this.categoriesCache[category] = new CacheManager<Fixture[]>();
    }
    return this.categoriesCache[category].get();
  }
  
  setCategoryFixtures(category: string, fixtures: Fixture[]): void {
    if (!this.categoriesCache[category]) {
      this.categoriesCache[category] = new CacheManager<Fixture[]>();
    }
    this.categoriesCache[category].set(fixtures);
  }
  
  // Single fixture cache methods
  getFixtureById(id: string): Fixture | null {
    if (!this.fixtureByIdCache[id]) {
      this.fixtureByIdCache[id] = new CacheManager<Fixture>();
    }
    return this.fixtureByIdCache[id].get();
  }
  
  setFixtureById(id: string, fixture: Fixture): void {
    if (!this.fixtureByIdCache[id]) {
      this.fixtureByIdCache[id] = new CacheManager<Fixture>();
    }
    this.fixtureByIdCache[id].set(fixture);
  }
  
  // Clear all caches
  clearAll(): void {
    this.allFixturesCache.clear();
    
    // Clear category caches
    Object.values(this.categoriesCache).forEach(cache => {
      cache.clear();
    });
    
    // Clear by ID caches
    Object.values(this.fixtureByIdCache).forEach(cache => {
      cache.clear();
    });
  }
  
  isAllFixturesCacheValid(): boolean {
    return this.allFixturesCache.isValid();
  }
}

// Export a singleton instance
export const fixtureCache = new FixtureCache();
