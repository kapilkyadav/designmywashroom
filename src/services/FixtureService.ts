
import { supabase, Fixture } from '@/lib/supabase';

// Cache implementation for fixtures
const fixtureCache = {
  all: null as Fixture[] | null,
  categories: {} as Record<string, Fixture[]>,
  byId: {} as Record<string, Fixture>,
  timestamp: 0,
  CACHE_EXPIRY: 2 * 60 * 1000 // 2 minutes
};

export const FixtureService = {
  // Clear cache (useful after mutations)
  clearCache() {
    fixtureCache.all = null;
    fixtureCache.categories = {};
    fixtureCache.byId = {};
    fixtureCache.timestamp = 0;
  },
  
  // Check if cache is valid
  isCacheValid() {
    return fixtureCache.all !== null && 
           (Date.now() - fixtureCache.timestamp < fixtureCache.CACHE_EXPIRY);
  },
  
  // Get all fixtures
  async getAllFixtures(): Promise<Fixture[]> {
    try {
      // Return from cache if valid
      if (this.isCacheValid()) {
        return fixtureCache.all as Fixture[];
      }
      
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching fixtures:', error);
        throw error;
      }
      
      // Update cache
      fixtureCache.all = data || [];
      fixtureCache.timestamp = Date.now();
      
      // Populate id cache for faster lookups
      if (data) {
        data.forEach(fixture => {
          fixtureCache.byId[fixture.id] = fixture;
        });
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllFixtures:', error);
      throw error;
    }
  },
  
  // Get fixtures by category
  async getFixturesByCategory(category: 'electrical' | 'plumbing' | 'additional'): Promise<Fixture[]> {
    try {
      // Check category cache first
      if (fixtureCache.categories[category] && this.isCacheValid()) {
        return fixtureCache.categories[category];
      }
      
      // If we have all fixtures cached, filter from there
      if (this.isCacheValid() && fixtureCache.all) {
        const filtered = fixtureCache.all.filter(f => f.category === category);
        fixtureCache.categories[category] = filtered;
        return filtered;
      }
      
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('category', category)
        .order('name');
      
      if (error) {
        console.error('Error fetching fixtures by category:', error);
        throw error;
      }
      
      // Update category cache
      fixtureCache.categories[category] = data || [];
      
      return data || [];
    } catch (error) {
      console.error('Error in getFixturesByCategory:', error);
      throw error;
    }
  },
  
  // Get a fixture by ID
  async getFixtureById(id: string): Promise<Fixture> {
    try {
      // Check id cache first
      if (fixtureCache.byId[id] && this.isCacheValid()) {
        return fixtureCache.byId[id];
      }
      
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching fixture:', error);
        throw error;
      }
      
      // Update id cache
      fixtureCache.byId[id] = data as Fixture;
      
      return data as Fixture;
    } catch (error) {
      console.error('Error in getFixtureById:', error);
      throw error;
    }
  },
  
  // Create a new fixture
  async createFixture(fixture: Omit<Fixture, 'id' | 'created_at' | 'updated_at' | 'margin'>): Promise<Fixture> {
    try {
      const landingPrice = fixture.landing_price || 0;
      const quotationPrice = fixture.quotation_price || 0;
      
      // Calculate margin percentage
      const margin = landingPrice > 0 
        ? ((quotationPrice - landingPrice) / landingPrice) * 100 
        : 0;
      
      const { data, error } = await supabase
        .from('fixtures')
        .insert({
          ...fixture,
          margin: parseFloat(margin.toFixed(2)),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating fixture:', error);
        throw error;
      }
      
      // Invalidate caches after mutation
      this.clearCache();
      
      return data as Fixture;
    } catch (error) {
      console.error('Error in createFixture:', error);
      throw error;
    }
  },
  
  // Update a fixture
  async updateFixture(id: string, fixture: Partial<Fixture>): Promise<Fixture> {
    try {
      let updateData: any = {
        ...fixture,
        updated_at: new Date().toISOString(),
      };
      
      // Recalculate margin if prices changed
      if (fixture.landing_price !== undefined || fixture.quotation_price !== undefined) {
        // Get current fixture data for any missing values
        const currentFixture = await this.getFixtureById(id);
        
        const landingPrice = fixture.landing_price !== undefined 
          ? fixture.landing_price 
          : currentFixture.landing_price;
        
        const quotationPrice = fixture.quotation_price !== undefined 
          ? fixture.quotation_price 
          : currentFixture.quotation_price;
        
        // Calculate margin percentage
        const margin = landingPrice > 0 
          ? ((quotationPrice - landingPrice) / landingPrice) * 100 
          : 0;
        
        updateData.margin = parseFloat(margin.toFixed(2));
      }
      
      const { data, error } = await supabase
        .from('fixtures')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating fixture:', error);
        throw error;
      }
      
      // Invalidate caches after mutation
      this.clearCache();
      
      return data as Fixture;
    } catch (error) {
      console.error('Error in updateFixture:', error);
      throw error;
    }
  },
  
  // Delete a fixture
  async deleteFixture(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('fixtures')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting fixture:', error);
        throw error;
      }
      
      // Invalidate caches after mutation
      this.clearCache();
    } catch (error) {
      console.error('Error in deleteFixture:', error);
      throw error;
    }
  }
};
