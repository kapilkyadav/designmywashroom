
import { Fixture } from '@/lib/supabase';

/**
 * Validates fixture data before database operations
 */
export class FixtureValidator {
  /**
   * Validate fixture data for creation
   */
  validateFixtureData(fixture: Omit<Fixture, 'id' | 'created_at' | 'updated_at' | 'margin'>): void {
    // Validate required fields
    if (!fixture.name || fixture.name.trim() === '') {
      throw new Error('Fixture name is required');
    }
    
    if (!fixture.category) {
      throw new Error('Fixture category is required');
    }
    
    // Validate prices are numbers and not negative
    if (fixture.mrp < 0) {
      throw new Error('MRP cannot be negative');
    }
    
    if (fixture.landing_price < 0) {
      throw new Error('Landing price cannot be negative');
    }
    
    if (fixture.client_price < 0) {
      throw new Error('Client price cannot be negative');
    }
    
    if (fixture.quotation_price < 0) {
      throw new Error('Quotation price cannot be negative');
    }
  }
  
  /**
   * Validate fixture update data
   */
  validateFixtureUpdateData(fixture: Partial<Fixture>): void {
    // Validate name if provided
    if (fixture.name !== undefined && fixture.name.trim() === '') {
      throw new Error('Fixture name cannot be empty');
    }
    
    // Validate prices are not negative if provided
    if (fixture.mrp !== undefined && fixture.mrp < 0) {
      throw new Error('MRP cannot be negative');
    }
    
    if (fixture.landing_price !== undefined && fixture.landing_price < 0) {
      throw new Error('Landing price cannot be negative');
    }
    
    if (fixture.client_price !== undefined && fixture.client_price < 0) {
      throw new Error('Client price cannot be negative');
    }
    
    if (fixture.quotation_price !== undefined && fixture.quotation_price < 0) {
      throw new Error('Quotation price cannot be negative');
    }
  }
}
