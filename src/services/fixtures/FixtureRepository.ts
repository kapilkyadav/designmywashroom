
import { supabase, Fixture } from '@/lib/supabase';

/**
 * Repository responsible for Supabase data operations for fixtures
 */
export class FixtureRepository {
  /**
   * Fetch all fixtures from the database
   */
  async fetchAll(): Promise<Fixture[]> {
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
      console.error('Error in fetchAll:', error);
      throw error;
    }
  }
  
  /**
   * Fetch fixtures by category
   */
  async fetchByCategory(category: 'electrical' | 'plumbing' | 'additional'): Promise<Fixture[]> {
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
      console.error('Error in fetchByCategory:', error);
      throw error;
    }
  }
  
  /**
   * Fetch a fixture by ID
   */
  async fetchById(id: string): Promise<Fixture> {
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching fixture by ID:', error);
        throw error;
      }
      
      return data as Fixture;
    } catch (error) {
      console.error('Error in fetchById:', error);
      throw error;
    }
  }
  
  /**
   * Create a new fixture
   */
  async create(fixtureData: Omit<Fixture, 'id' | 'created_at' | 'updated_at' | 'margin'>): Promise<Fixture> {
    try {
      const landingPrice = fixtureData.landing_price || 0;
      const quotationPrice = fixtureData.quotation_price || 0;
      
      // Calculate margin percentage
      const margin = landingPrice > 0 
        ? ((quotationPrice - landingPrice) / landingPrice) * 100 
        : 0;
      
      const { data, error } = await supabase
        .from('fixtures')
        .insert({
          ...fixtureData,
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
      console.error('Error in create:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing fixture
   */
  async update(id: string, fixtureData: Partial<Fixture>): Promise<Fixture> {
    try {
      let updateData: any = {
        ...fixtureData,
        updated_at: new Date().toISOString(),
      };
      
      // Recalculate margin if prices changed
      if (fixtureData.landing_price !== undefined || fixtureData.quotation_price !== undefined) {
        // Get current fixture to use existing values for the missing price fields
        const { data: currentFixture, error: fetchError } = await supabase
          .from('fixtures')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching current fixture:', fetchError);
          throw fetchError;
        }
        
        const landingPrice = fixtureData.landing_price !== undefined 
          ? fixtureData.landing_price 
          : currentFixture.landing_price;
        
        const quotationPrice = fixtureData.quotation_price !== undefined 
          ? fixtureData.quotation_price 
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
      console.error('Error in update:', error);
      throw error;
    }
  }
  
  /**
   * Delete a fixture
   */
  async delete(id: string): Promise<void> {
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
      console.error('Error in delete:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const fixtureRepository = new FixtureRepository();
