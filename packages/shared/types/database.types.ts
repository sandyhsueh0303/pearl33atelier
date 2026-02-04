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
          cost: number | null
          created_at: string
          id: string
          internal_note: string | null
          on_hand: number
          purchase_date: string | null
          reserved: number
          updated_at: string
          vendor: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          internal_note?: string | null
          on_hand?: number
          purchase_date?: string | null
          reserved?: number
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          internal_note?: string | null
          on_hand?: number
          purchase_date?: string | null
          reserved?: number
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      product_costs: {
        Row: {
          cost_notes: string | null
          created_at: string | null
          id: string
          inventory_item_id: string | null
          labor_cost: number | null
          material_cost: number | null
          misc_cost: number | null
          pearl_quantity: number | null
          pearl_unit_cost: number | null
          product_id: string | null
        }
        Insert: {
          cost_notes?: string | null
          created_at?: string | null
          id: string
          inventory_item_id?: string | null
          labor_cost?: number | null
          material_cost?: number | null
          misc_cost?: number | null
          pearl_quantity?: number | null
          pearl_unit_cost?: number | null
          product_id?: string | null
        }
        Update: {
          cost_notes?: string | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          labor_cost?: number | null
          material_cost?: number | null
          misc_cost?: number | null
          pearl_quantity?: number | null
          pearl_unit_cost?: number | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      publish_product: {
        Args: { product_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_kind"]
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
      unpublish_product: {
        Args: { product_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_kind"]
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
      availability_kind: "IN_STOCK" | "PREORDER"
      pearl_type:
        | "WhiteAkoya"
        | "GreyAkoya"
        | "WhiteSouthSea"
        | "GoldenSouthSea"
        | "Tahitian"
        | "Freshwater"
        | "Other"
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
      availability_kind: ["IN_STOCK", "PREORDER"],
      pearl_type: [
        "WhiteAkoya",
        "GreyAkoya",
        "WhiteSouthSea",
        "GoldenSouthSea",
        "Tahitian",
        "Freshwater",
        "Other",
      ],
    },
  },
} as const
