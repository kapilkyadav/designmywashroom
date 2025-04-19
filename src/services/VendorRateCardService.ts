
// Add the getItemsByIds method to the VendorRateCardService

import { supabase } from '@/lib/supabase';

export interface VendorCategory {
  id: string;
  name: string;
  description?: string;
  sequence: number;
  created_at: string;
  updated_at: string;
}

export interface VendorItem {
  id: string;
  category_id: string;
  sl_no: string;
  item_code: string;
  scope_of_work: string;
  measuring_unit: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface VendorRateCard {
  id: string;
  item_id: string;
  vendor_rate1?: number;
  vendor_rate2?: number;
  vendor_rate3?: number;
  client_rate: number;
  currency?: string;
  notes?: string;
  effective_date?: string;
  created_at: string;
  updated_at: string;
  item?: VendorItem;
}

export const VendorRateCardService = {
  // Get all categories
  async getCategories(): Promise<VendorCategory[]> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching vendor categories:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get all items
  async getItems(): Promise<VendorItem[]> {
    const { data, error } = await supabase
      .from('vendor_items')
      .select('*, category:category_id(id, name)')
      .order('sl_no');
    
    if (error) {
      console.error('Error fetching vendor items:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get items by category ID
  async getItemsByCategoryId(categoryId: string): Promise<VendorItem[]> {
    const { data, error } = await supabase
      .from('vendor_items')
      .select('*, category:category_id(id, name)')
      .eq('category_id', categoryId)
      .order('sl_no');
    
    if (error) {
      console.error('Error fetching vendor items by category:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Get items by IDs (new method)
  async getItemsByIds(itemIds: string[]): Promise<VendorItem[]> {
    if (!itemIds.length) return [];
    
    const { data, error } = await supabase
      .from('vendor_items')
      .select('*, category:category_id(id, name)')
      .in('id', itemIds);
    
    if (error) {
      console.error('Error fetching vendor items by IDs:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get all rate cards
  async getRateCards(): Promise<VendorRateCard[]> {
    const { data, error } = await supabase
      .from('vendor_rate_cards')
      .select('*, item:item_id(*, category:category_id(id, name))');
    
    if (error) {
      console.error('Error fetching vendor rate cards:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get rate card by item ID
  async getRateCardByItemId(itemId: string): Promise<VendorRateCard | null> {
    const { data, error } = await supabase
      .from('vendor_rate_cards')
      .select('*, item:item_id(*, category:category_id(id, name))')
      .eq('item_id', itemId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rate card found for this item
        return null;
      }
      console.error('Error fetching vendor rate card:', error);
      throw error;
    }
    
    return data;
  },

  // Create a category
  async createCategory(category: { name: string, description?: string }): Promise<VendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating vendor category:', error);
      throw error;
    }
    
    return data;
  },

  // Update a category
  async updateCategory(id: string, category: Partial<VendorCategory>): Promise<VendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vendor category:', error);
      throw error;
    }
    
    return data;
  },

  // Delete a category
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting vendor category:', error);
      throw error;
    }
  },

  // Create an item
  async createItem(item: { 
    category_id: string; 
    sl_no: string; 
    item_code: string; 
    scope_of_work: string; 
    measuring_unit: string 
  }): Promise<VendorItem> {
    const { data, error } = await supabase
      .from('vendor_items')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating vendor item:', error);
      throw error;
    }
    
    return data;
  },

  // Update an item
  async updateItem(id: string, item: Partial<VendorItem>): Promise<VendorItem> {
    const { data, error } = await supabase
      .from('vendor_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vendor item:', error);
      throw error;
    }
    
    return data;
  },

  // Delete an item
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting vendor item:', error);
      throw error;
    }
  },

  // Create a rate card
  async createRateCard(rateCard: { 
    item_id: string; 
    vendor_rate1?: number; 
    vendor_rate2?: number; 
    vendor_rate3?: number; 
    client_rate: number; 
    currency?: string; 
    notes?: string 
  }): Promise<VendorRateCard> {
    const { data, error } = await supabase
      .from('vendor_rate_cards')
      .insert(rateCard)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating vendor rate card:', error);
      throw error;
    }
    
    return data;
  },

  // Update a rate card
  async updateRateCard(id: string, rateCard: Partial<VendorRateCard>): Promise<VendorRateCard> {
    const { data, error } = await supabase
      .from('vendor_rate_cards')
      .update(rateCard)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vendor rate card:', error);
      throw error;
    }
    
    return data;
  },

  // Create or update a rate card
  async saveRateCard(rateCard: Omit<VendorRateCard, 'id' | 'created_at' | 'updated_at'>): Promise<VendorRateCard> {
    // Check if a rate card exists for this item
    const existingRateCard = await this.getRateCardByItemId(rateCard.item_id);
    
    if (existingRateCard) {
      // Update existing rate card
      const { data, error } = await supabase
        .from('vendor_rate_cards')
        .update(rateCard)
        .eq('id', existingRateCard.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating vendor rate card:', error);
        throw error;
      }
      
      return data;
    } else {
      // Create new rate card
      return this.createRateCard(rateCard);
    }
  },

  // Delete a rate card
  async deleteRateCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_rate_cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting vendor rate card:', error);
      throw error;
    }
  }
};
