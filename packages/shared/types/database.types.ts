export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_products: {
        Row: {
          availability: Database["public"]["Enums"]["availability_kind"]
          category: Database["public"]["Enums"]["product_category"] | null
          created_at: string
          description: string | null
          id: string
          inventory_item_id: string | null
          material: string | null
          note: string | null
          original_price: number | null
          pearl_type: Database["public"]["Enums"]["pearl_type"]
          preorder_note: string | null
          published: boolean
          published_at: string | null
          sell_price: number | null
          shape: string | null
          size_mm: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_kind"]
          category?: Database["public"]["Enums"]["product_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          inventory_item_id?: string | null
          material?: string | null
          note?: string | null
          original_price?: number | null
          pearl_type: Database["public"]["Enums"]["pearl_type"]
          preorder_note?: string | null
          published?: boolean
          published_at?: string | null
          sell_price?: number | null
          shape?: string | null
          size_mm?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_kind"]
          category?: Database["public"]["Enums"]["product_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          inventory_item_id?: string | null
          material?: string | null
          note?: string | null
          original_price?: number | null
          pearl_type?: Database["public"]["Enums"]["pearl_type"]
          preorder_note?: string | null
          published?: boolean
          published_at?: string | null
          sell_price?: number | null
          shape?: string | null
          size_mm?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          allocated_quantity: number
          category: string | null
          cost: number | null
          created_at: string
          id: string
          internal_note: string | null
          name: string | null
          purchase_date: string | null
          total_quantity: number
          updated_at: string
        }
        Insert: {
          allocated_quantity?: number
          category?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          internal_note?: string | null
          name?: string | null
          purchase_date?: string | null
          total_quantity?: number
          updated_at?: string
        }
        Update: {
          allocated_quantity?: number
          category?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          internal_note?: string | null
          name?: string | null
          purchase_date?: string | null
          total_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          published: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          published?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          published?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_summary"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_materials: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          notes: string | null
          product_id: string
          quantity_per_unit: number
          sort_order: number | null
          unit_cost_snapshot: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          notes?: string | null
          product_id: string
          quantity_per_unit?: number
          sort_order?: number | null
          unit_cost_snapshot?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          notes?: string | null
          product_id?: string
          quantity_per_unit?: number
          sort_order?: number | null
          unit_cost_snapshot?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_summary"
            referencedColumns: ["product_id"]
          },
        ]
      }
      sales_records: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string
          notes: string | null
          order_number: string | null
          platform: string | null
          product_id: string
          profit: number
          profit_margin: number | null
          quantity: number
          sale_date: string
          total_cost: number
          total_price: number
          unit_cost: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          platform?: string | null
          product_id: string
          profit: number
          profit_margin?: number | null
          quantity?: number
          sale_date?: string
          total_cost: number
          total_price: number
          unit_cost: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          platform?: string | null
          product_id?: string
          profit?: number
          profit_margin?: number | null
          quantity?: number
          sale_date?: string
          total_cost?: number
          total_price?: number
          unit_cost?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_sales_summary"
            referencedColumns: ["product_id"]
          },
        ]
      }
    }
    Views: {
      product_sales_summary: {
        Row: {
          avg_profit_margin: number | null
          current_cost: number | null
          current_price: number | null
          current_profit: number | null
          first_sale_date: string | null
          last_sale_date: string | null
          product_id: string | null
          slug: string | null
          title: string | null
          total_cost: number | null
          total_orders: number | null
          total_profit: number | null
          total_revenue: number | null
          total_units_sold: number | null
        }
        Relationships: []
      }
      sales_overview: {
        Row: {
          avg_margin: number | null
          cost: number | null
          day: string | null
          month: string | null
          profit: number | null
          revenue: number | null
          total_orders: number | null
          total_units: number | null
          week: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      adjust_inventory_quantity: {
        Args: { item_id: string; quantity_change: number }
        Returns: undefined
      }
      get_product_pearl_cost: { Args: { prod_id: string }; Returns: number }
      get_product_profit: {
        Args: { prod_id: string }
        Returns: {
          profit: number
          profit_margin: number
          total_cost: number
        }[]
      }
      get_product_total_cost: { Args: { prod_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      produce_product: {
        Args: { prod_id: string; produce_quantity: number }
        Returns: Json
      }
      publish_product: {
        Args: { product_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_kind"]
          category: Database["public"]["Enums"]["product_category"] | null
          created_at: string
          description: string | null
          id: string
          inventory_item_id: string | null
          material: string | null
          note: string | null
          original_price: number | null
          pearl_type: Database["public"]["Enums"]["pearl_type"]
          preorder_note: string | null
          published: boolean
          published_at: string | null
          sell_price: number | null
          shape: string | null
          size_mm: number | null
          slug: string
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "catalog_products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      sell_product: {
        Args: { prod_id: string; sell_quantity: number }
        Returns: Json
      }
      unpublish_product: {
        Args: { product_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_kind"]
          category: Database["public"]["Enums"]["product_category"] | null
          created_at: string
          description: string | null
          id: string
          inventory_item_id: string | null
          material: string | null
          note: string | null
          original_price: number | null
          pearl_type: Database["public"]["Enums"]["pearl_type"]
          preorder_note: string | null
          published: boolean
          published_at: string | null
          sell_price: number | null
          shape: string | null
          size_mm: number | null
          slug: string
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "catalog_products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      availability_kind: "IN_STOCK" | "PREORDER" | "OUT_OF_STOCK"
      pearl_type:
        | "WhiteAkoya"
        | "GreyAkoya"
        | "WhiteSouthSea"
        | "GoldenSouthSea"
        | "Tahitian"
        | "Freshwater"
        | "Other"
      product_category:
        | "BRACELETS"
        | "NECKLACES"
        | "EARRINGS"
        | "STUDS"
        | "RINGS"
        | "PENDANTS"
        | "LOOSE_PEARLS"
        | "BROOCHES"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_kind: ["IN_STOCK", "PREORDER", "OUT_OF_STOCK"],
      pearl_type: [
        "WhiteAkoya",
        "GreyAkoya",
        "WhiteSouthSea",
        "GoldenSouthSea",
        "Tahitian",
        "Freshwater",
        "Other",
      ],
      product_category: [
        "BRACELETS",
        "NECKLACES",
        "EARRINGS",
        "STUDS",
        "RINGS",
        "PENDANTS",
        "LOOSE_PEARLS",
        "BROOCHES",
      ],
    },
  },
} as const
