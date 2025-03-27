
import { Fixture } from '@/lib/supabase';

/**
 * Handles fixture pricing calculations and preparations
 */
export class FixturePricingService {
  /**
   * Calculate margin based on landing and quotation prices
   */
  calculateMargin(landingPrice: number, quotationPrice: number): number {
    if (landingPrice <= 0) return 0;
    
    const margin = ((quotationPrice - landingPrice) / landingPrice) * 100;
    return parseFloat(margin.toFixed(2));
  }
  
  /**
   * Prepare fixture data for creation by calculating the margin
   */
  prepareFixtureForCreation(
    fixture: Omit<Fixture, 'id' | 'created_at' | 'updated_at' | 'margin'>
  ): Omit<Fixture, 'id' | 'created_at' | 'updated_at'> {
    const landingPrice = fixture.landing_price || 0;
    const quotationPrice = fixture.quotation_price || 0;
    
    // Calculate margin
    const margin = this.calculateMargin(landingPrice, quotationPrice);
    
    // Return fixture with calculated margin
    return {
      ...fixture,
      margin
    };
  }
  
  /**
   * Prepare fixture data for update by calculating margin if prices changed
   */
  prepareFixtureForUpdate(
    currentFixture: Fixture,
    updateData: Partial<Fixture>
  ): Partial<Fixture> {
    // If prices are not being updated, return the original update data
    if (updateData.landing_price === undefined && updateData.quotation_price === undefined) {
      return updateData;
    }
    
    // Get the prices to use for margin calculation
    const landingPrice = updateData.landing_price !== undefined 
      ? updateData.landing_price 
      : currentFixture.landing_price;
      
    const quotationPrice = updateData.quotation_price !== undefined 
      ? updateData.quotation_price 
      : currentFixture.quotation_price;
    
    // Calculate new margin
    const margin = this.calculateMargin(landingPrice, quotationPrice);
    
    // Return update data with calculated margin
    return {
      ...updateData,
      margin
    };
  }
}
