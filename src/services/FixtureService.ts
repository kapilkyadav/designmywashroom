
import { supabase, Fixture } from '@/lib/supabase';

export const FixtureService = {
  // Get all fixtures
  async getAllFixtures(): Promise<Fixture[]> {
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching fixtures:', error);
        throw error;
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
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('category', category)
        .order('name');
      
      if (error) {
        console.error('Error fetching fixtures by category:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getFixturesByCategory:', error);
      throw error;
    }
  },
  
  // Get a fixture by ID
  async getFixtureById(id: string): Promise<Fixture> {
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching fixture:', error);
        throw error;
      }
      
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
    } catch (error) {
      console.error('Error in deleteFixture:', error);
      throw error;
    }
  }
};
