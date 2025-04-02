export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          description: string | null
          header_row: number | null
          id: string
          name: string
          product_count: number
          sheet_name: string | null
          sheet_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          header_row?: number | null
          id?: string
          name: string
          product_count?: number
          sheet_name?: string | null
          sheet_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          header_row?: number | null
          id?: string
          name?: string
          product_count?: number
          sheet_name?: string | null
          sheet_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      execution_services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          pricing_type: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pricing_type?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pricing_type?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          category: string
          client_price: number
          created_at: string
          id: string
          landing_price: number
          margin: number
          mrp: number
          name: string
          quantity: number
          quotation_price: number
          updated_at: string
        }
        Insert: {
          category: string
          client_price?: number
          created_at?: string
          id?: string
          landing_price?: number
          margin?: number
          mrp?: number
          name: string
          quantity?: number
          quotation_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          client_price?: number
          created_at?: string
          id?: string
          landing_price?: number
          margin?: number
          mrp?: number
          name?: string
          quantity?: number
          quotation_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          lead_id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          lead_id: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          lead_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activity_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activity_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_remarks_history: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          remark: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          remark: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          remark?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_remarks_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sync_config: {
        Row: {
          column_mapping: Json
          created_at: string
          header_row: number
          id: string
          last_sync_at: string | null
          sheet_name: string
          sheet_url: string
          sync_interval_minutes: number
          updated_at: string
        }
        Insert: {
          column_mapping?: Json
          created_at?: string
          header_row?: number
          id?: string
          last_sync_at?: string | null
          sheet_name: string
          sheet_url: string
          sync_interval_minutes?: number
          updated_at?: string
        }
        Update: {
          column_mapping?: Json
          created_at?: string
          header_row?: number
          id?: string
          last_sync_at?: string | null
          sheet_name?: string
          sheet_url?: string
          sync_interval_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget_preference: string | null
          created_at: string
          customer_name: string
          email: string | null
          id: string
          last_synced_at: string | null
          lead_date: string
          location: string | null
          next_followup_date: string | null
          phone: string
          remarks: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget_preference?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          last_synced_at?: string | null
          lead_date: string
          location?: string | null
          next_followup_date?: string | null
          phone: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget_preference?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          last_synced_at?: string | null
          lead_date?: string
          location?: string | null
          next_followup_date?: string | null
          phone?: string
          remarks?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand_id: string
          category: string | null
          client_price: number
          created_at: string
          description: string | null
          extra_data: Json | null
          finish_color: string | null
          id: string
          landing_price: number
          margin: number
          model_code: string | null
          mrp: number
          name: string
          quantity: number
          quotation_price: number
          series: string | null
          size: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          category?: string | null
          client_price?: number
          created_at?: string
          description?: string | null
          extra_data?: Json | null
          finish_color?: string | null
          id?: string
          landing_price?: number
          margin?: number
          model_code?: string | null
          mrp?: number
          name: string
          quantity?: number
          quotation_price?: number
          series?: string | null
          size?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category?: string | null
          client_price?: number
          created_at?: string
          description?: string | null
          extra_data?: Json | null
          finish_color?: string | null
          id?: string
          landing_price?: number
          margin?: number
          model_code?: string | null
          mrp?: number
          name?: string
          quantity?: number
          quotation_price?: number
          series?: string | null
          size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      project_quotations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          project_id: string
          quotation_data: Json
          quotation_html: string | null
          quotation_number: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id: string
          quotation_data: Json
          quotation_html?: string | null
          quotation_number: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string
          quotation_data?: Json
          quotation_html?: string | null
          quotation_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_quotations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "real_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_washrooms: {
        Row: {
          area: number | null
          created_at: string
          height: number
          id: string
          length: number
          name: string
          project_id: string
          services: Json | null
          updated_at: string
          width: number
        }
        Insert: {
          area?: number | null
          created_at?: string
          height?: number
          id?: string
          length: number
          name: string
          project_id: string
          services?: Json | null
          updated_at?: string
          width: number
        }
        Update: {
          area?: number | null
          created_at?: string
          height?: number
          id?: string
          length?: number
          name?: string
          project_id?: string
          services?: Json | null
          updated_at?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_washrooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "real_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_email: string
          client_location: string
          client_mobile: string
          client_name: string
          created_at: string
          final_estimate: number
          fixture_cost: number
          height: number
          id: string
          length: number
          plumbing_cost: number
          project_type: string
          selected_brand: string
          selected_fixtures: Json | null
          tiling_cost: number
          timeline: string
          updated_at: string
          width: number
        }
        Insert: {
          client_email: string
          client_location: string
          client_mobile: string
          client_name: string
          created_at?: string
          final_estimate?: number
          fixture_cost?: number
          height?: number
          id?: string
          length: number
          plumbing_cost?: number
          project_type: string
          selected_brand: string
          selected_fixtures?: Json | null
          tiling_cost?: number
          timeline: string
          updated_at?: string
          width: number
        }
        Update: {
          client_email?: string
          client_location?: string
          client_mobile?: string
          client_name?: string
          created_at?: string
          final_estimate?: number
          fixture_cost?: number
          height?: number
          id?: string
          length?: number
          plumbing_cost?: number
          project_type?: string
          selected_brand?: string
          selected_fixtures?: Json | null
          tiling_cost?: number
          timeline?: string
          updated_at?: string
          width?: number
        }
        Relationships: []
      }
      real_projects: {
        Row: {
          additional_costs: Json | null
          client_email: string | null
          client_location: string | null
          client_mobile: string
          client_name: string
          converted_at: string
          created_at: string
          execution_costs: Json | null
          final_quotation_amount: number | null
          height: number | null
          id: string
          internal_notes: string | null
          last_updated_at: string
          lead_id: string | null
          length: number | null
          original_estimate: number | null
          project_details: Json
          project_estimate_id: string | null
          project_id: string
          project_type: string
          quotation_generated_at: string | null
          selected_brand: string | null
          selected_fixtures: Json | null
          status: string
          vendor_rates: Json | null
          washroom_count: number | null
          width: number | null
        }
        Insert: {
          additional_costs?: Json | null
          client_email?: string | null
          client_location?: string | null
          client_mobile: string
          client_name: string
          converted_at?: string
          created_at?: string
          execution_costs?: Json | null
          final_quotation_amount?: number | null
          height?: number | null
          id?: string
          internal_notes?: string | null
          last_updated_at?: string
          lead_id?: string | null
          length?: number | null
          original_estimate?: number | null
          project_details?: Json
          project_estimate_id?: string | null
          project_id: string
          project_type: string
          quotation_generated_at?: string | null
          selected_brand?: string | null
          selected_fixtures?: Json | null
          status?: string
          vendor_rates?: Json | null
          washroom_count?: number | null
          width?: number | null
        }
        Update: {
          additional_costs?: Json | null
          client_email?: string | null
          client_location?: string | null
          client_mobile?: string
          client_name?: string
          converted_at?: string
          created_at?: string
          execution_costs?: Json | null
          final_quotation_amount?: number | null
          height?: number | null
          id?: string
          internal_notes?: string | null
          last_updated_at?: string
          lead_id?: string | null
          length?: number | null
          original_estimate?: number | null
          project_details?: Json
          project_estimate_id?: string | null
          project_id?: string
          project_type?: string
          quotation_generated_at?: string | null
          selected_brand?: string | null
          selected_fixtures?: Json | null
          status?: string
          vendor_rates?: Json | null
          washroom_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "real_projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "real_projects_project_estimate_id_fkey"
            columns: ["project_estimate_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          breakage_percentage: number
          created_at: string
          id: string
          plumbing_rate_per_sqft: number
          tile_cost_per_unit: number
          tiling_labor_per_sqft: number
          updated_at: string
        }
        Insert: {
          breakage_percentage?: number
          created_at?: string
          id?: string
          plumbing_rate_per_sqft?: number
          tile_cost_per_unit?: number
          tiling_labor_per_sqft?: number
          updated_at?: string
        }
        Update: {
          breakage_percentage?: number
          created_at?: string
          id?: string
          plumbing_rate_per_sqft?: number
          tile_cost_per_unit?: number
          tiling_labor_per_sqft?: number
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          status: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
          status?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          status?: string
          username?: string | null
        }
        Relationships: []
      }
      vendor_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendor_items: {
        Row: {
          category_id: string
          created_at: string
          id: string
          item_code: string
          measuring_unit: string
          scope_of_work: string
          sl_no: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          item_code: string
          measuring_unit: string
          scope_of_work: string
          sl_no: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          item_code?: string
          measuring_unit?: string
          scope_of_work?: string
          sl_no?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_rate_cards: {
        Row: {
          client_rate: number
          created_at: string
          currency: string | null
          effective_date: string | null
          id: string
          item_id: string
          notes: string | null
          updated_at: string
          vendor_rate1: number | null
          vendor_rate2: number | null
          vendor_rate3: number | null
        }
        Insert: {
          client_rate: number
          created_at?: string
          currency?: string | null
          effective_date?: string | null
          id?: string
          item_id: string
          notes?: string | null
          updated_at?: string
          vendor_rate1?: number | null
          vendor_rate2?: number | null
          vendor_rate3?: number | null
        }
        Update: {
          client_rate?: number
          created_at?: string
          currency?: string | null
          effective_date?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          updated_at?: string
          vendor_rate1?: number | null
          vendor_rate2?: number | null
          vendor_rate3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_rate_cards_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "vendor_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      convertible_records: {
        Row: {
          client_name: string | null
          created_date: string | null
          real_project_id: string | null
          record_id: string | null
          record_type: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
