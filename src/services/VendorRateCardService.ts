
import { supabase } from '@/lib/supabase';

export interface VendorCategory {
  id: string;
  name: string;
  description: string | null;
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
  category?: VendorCategory;
}

export interface VendorRateCard {
  id: string;
  item_id: string;
  vendor_rate1: number | null;
  vendor_rate2: number | null;
  vendor_rate3: number | null;
  client_rate: number;
  currency: string | null;
  effective_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  item?: VendorItem;
}

export class VendorRateCardService {
  // Categories
  static async getCategories(): Promise<VendorCategory[]> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getCategory(id: string): Promise<VendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createCategory(category: Partial<VendorCategory>): Promise<VendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .insert([category])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCategory(id: string, category: Partial<VendorCategory>): Promise<VendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Items
  static async getItems(categoryId?: string): Promise<VendorItem[]> {
    let query = supabase
      .from('vendor_items')
      .select('*, category:vendor_categories(*)');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.order('sl_no');
    
    if (error) throw error;
    return data || [];
  }

  static async getItem(id: string): Promise<VendorItem> {
    const { data, error } = await supabase
      .from('vendor_items')
      .select('*, category:vendor_categories(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createItem(item: Partial<VendorItem>): Promise<VendorItem> {
    const { data, error } = await supabase
      .from('vendor_items')
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateItem(id: string, item: Partial<VendorItem>): Promise<VendorItem> {
    const { data, error } = await supabase
      .from('vendor_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Rate Cards
  static async getRateCards(itemId?: string): Promise<VendorRateCard[]> {
    let query = supabase
      .from('vendor_rate_cards')
      .select('*, item:vendor_items(*, category:vendor_categories(*))');
    
    if (itemId) {
      query = query.eq('item_id', itemId);
    }
    
    const { data, error } = await query.order('created_at');
    
    if (error) throw error;
    return data || [];
  }

  static async getRateCard(id: string): Promise<VendorRateCard> {
    const { data, error } = await supabase
      .from('vendor_rate_cards')
      .select('*, item:vendor_items(*, category:vendor_categories(*))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createRateCard(rateCard: Partial<VendorRateCard>): Promise<VendorRateCard> {
    const { data, error } = await supabase
      .from('vendor_rate_cards')
      .insert([rateCard])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateRateCard(id: string, rateCard: Partial<VendorRateCard>): Promise<VendorRateCard> {
    const { data, error } = await supabase
      .from('vendor_rate_cards')
      .update(rateCard)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteRateCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_rate_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
