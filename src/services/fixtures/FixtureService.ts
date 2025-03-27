
import { Fixture } from '@/lib/supabase';
import { fixtureCache } from './FixtureCache';
import { fixtureRepository } from './FixtureRepository';

/**
 * FixtureService provides a high-level interface for fixture operations
 * with caching built in
 */
export class FixtureService {
  /**
   * Get all fixtures
   */
  async getAllFixtures(): Promise<Fixture[]> {
    try {
      // Check cache first
      const cachedFixtures = fixtureCache.getAllFixtures();
      if (cachedFixtures) {
        return cachedFixtures;
      }
      
      // Fetch from database
      const fixtures = await fixtureRepository.fetchAll();
      
      // Update cache
      fixtureCache.setAllFixtures(fixtures);
      
      return fixtures;
    } catch (error) {
      console.error('Error in getAllFixtures:', error);
      throw error;
    }
  }
  
  /**
   * Get fixtures by category
   */
  async getFixturesByCategory(category: 'electrical' | 'plumbing' | 'additional'): Promise<Fixture[]> {
    try {
      // Check category cache first
      const cachedFixtures = fixtureCache.getCategoryFixtures(category);
      if (cachedFixtures) {
        return cachedFixtures;
      }
      
      // If we have all fixtures cached, filter from there
      const allCachedFixtures = fixtureCache.getAllFixtures();
      if (allCachedFixtures && fixtureCache.isAllFixturesCacheValid()) {
        const filteredFixtures = allCachedFixtures.filter(f => f.category === category);
        fixtureCache.setCategoryFixtures(category, filteredFixtures);
        return filteredFixtures;
      }
      
      // Fetch from database
      const fixtures = await fixtureRepository.fetchByCategory(category);
      
      // Update cache
      fixtureCache.setCategoryFixtures(category, fixtures);
      
      return fixtures;
    } catch (error) {
      console.error('Error in getFixturesByCategory:', error);
      throw error;
    }
  }
  
  /**
   * Get a fixture by ID
   */
  async getFixtureById(id: string): Promise<Fixture> {
    try {
      // Check ID cache first
      const cachedFixture = fixtureCache.getFixtureById(id);
      if (cachedFixture) {
        return cachedFixture;
      }
      
      // Fetch from database
      const fixture = await fixtureRepository.fetchById(id);
      
      // Update cache
      fixtureCache.setFixtureById(id, fixture);
      
      return fixture;
    } catch (error) {
      console.error('Error in getFixtureById:', error);
      throw error;
    }
  }
  
  /**
   * Create a new fixture
   */
  async createFixture(fixture: Omit<Fixture, 'id' | 'created_at' | 'updated_at' | 'margin'>): Promise<Fixture> {
    try {
      const newFixture = await fixtureRepository.create(fixture);
      
      // Invalidate cache after mutation
      fixtureCache.clearAll();
      
      return newFixture;
    } catch (error) {
      console.error('Error in createFixture:', error);
      throw error;
    }
  }
  
  /**
   * Update a fixture
   */
  async updateFixture(id: string, fixture: Partial<Fixture>): Promise<Fixture> {
    try {
      const updatedFixture = await fixtureRepository.update(id, fixture);
      
      // Invalidate cache after mutation
      fixtureCache.clearAll();
      
      return updatedFixture;
    } catch (error) {
      console.error('Error in updateFixture:', error);
      throw error;
    }
  }
  
  /**
   * Delete a fixture
   */
  async deleteFixture(id: string): Promise<void> {
    try {
      await fixtureRepository.delete(id);
      
      // Invalidate cache after mutation
      fixtureCache.clearAll();
    } catch (error) {
      console.error('Error in deleteFixture:', error);
      throw error;
    }
  }
  
  /**
   * Clear fixture cache
   */
  clearCache(): void {
    fixtureCache.clearAll();
  }
  
  /**
   * Check if cache is valid
   */
  isCacheValid(): boolean {
    return fixtureCache.isAllFixturesCacheValid();
  }
}

// Export singleton instance 
export const fixtureService = new FixtureService();
