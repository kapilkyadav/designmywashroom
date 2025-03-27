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
          quotation_price?: number
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
          id: string
          landing_price: number
          margin: number
          mrp: number
          name: string
          quotation_price: number
          updated_at: string
        }
        Insert: {
          brand_id: string
          category?: string | null
          client_price?: number
          created_at?: string
          description?: string | null
          extra_data?: Json | null
          id?: string
          landing_price?: number
          margin?: number
          mrp?: number
          name: string
          quotation_price?: number
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category?: string | null
          client_price?: number
          created_at?: string
          description?: string | null
          extra_data?: Json | null
          id?: string
          landing_price?: number
          margin?: number
          mrp?: number
          name?: string
          quotation_price?: number
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
    }
    Views: {
      [_ in never]: never
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
