export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      annotation_tag_entity: {
        Row: {
          createdAt: string
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      entities: {
        Row: {
          aliases: string[] | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          first_mentioned_at: string | null
          id: string
          last_mentioned_at: string | null
          mention_count: number | null
          metadata: Json | null
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aliases?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          first_mentioned_at?: string | null
          id?: string
          last_mentioned_at?: string | null
          mention_count?: number | null
          metadata?: Json | null
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aliases?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          first_mentioned_at?: string | null
          id?: string
          last_mentioned_at?: string | null
          mention_count?: number | null
          metadata?: Json | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      entity_relationships: {
        Row: {
          context: string | null
          created_at: string | null
          highlight_id: string | null
          id: string
          relationship_type: string
          source_entity_id: string
          strength: number | null
          target_entity_id: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          highlight_id?: string | null
          id?: string
          relationship_type: string
          source_entity_id: string
          strength?: number | null
          target_entity_id: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          highlight_id?: string | null
          id?: string
          relationship_type?: string
          source_entity_id?: string
          strength?: number | null
          target_entity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_relationships_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_relationships_source_entity_id_fkey"
            columns: ["source_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_relationships_target_entity_id_fkey"
            columns: ["target_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      highlight_collections: {
        Row: {
          collection_id: string
          created_at: string | null
          highlight_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          highlight_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          highlight_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlight_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlight_collections_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "highlights"
            referencedColumns: ["id"]
          },
        ]
      }
      highlight_entities: {
        Row: {
          context_position: number | null
          created_at: string | null
          entity_id: string
          highlight_id: string
          id: string
          relevance_score: number | null
        }
        Insert: {
          context_position?: number | null
          created_at?: string | null
          entity_id: string
          highlight_id: string
          id?: string
          relevance_score?: number | null
        }
        Update: {
          context_position?: number | null
          created_at?: string | null
          entity_id?: string
          highlight_id?: string
          id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "highlight_entities_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlight_entities_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "highlights"
            referencedColumns: ["id"]
          },
        ]
      }
      highlights: {
        Row: {
          captured_at: string | null
          content: string
          context_after: string | null
          context_before: string | null
          created_at: string | null
          domain: string
          entities: Json | null
          highlighted_text: string
          id: string
          is_favorite: boolean | null
          markdown_content: string
          metadata: Json | null
          processed_at: string | null
          reading_time_minutes: number | null
          search_vector: unknown | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          captured_at?: string | null
          content: string
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          domain: string
          entities?: Json | null
          highlighted_text: string
          id?: string
          is_favorite?: boolean | null
          markdown_content: string
          metadata?: Json | null
          processed_at?: string | null
          reading_time_minutes?: number | null
          search_vector?: unknown | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          captured_at?: string | null
          content?: string
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          domain?: string
          entities?: Json | null
          highlighted_text?: string
          id?: string
          is_favorite?: boolean | null
          markdown_content?: string
          metadata?: Json | null
          processed_at?: string | null
          reading_time_minutes?: number | null
          search_vector?: unknown | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          apiKey: string
          createdAt: string
          id: string
          label: string
          scopes: Json | null
          updatedAt: string
          userId: string
        }
        Insert: {
          apiKey: string
          createdAt?: string
          id: string
          label: string
          scopes?: Json | null
          updatedAt?: string
          userId: string
        }
        Update: {
          apiKey?: string
          createdAt?: string
          id?: string
          label?: string
          scopes?: Json | null
          updatedAt?: string
          userId?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          api_key_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          api_key_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          api_key_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      capture_highlight: {
        Args: {
          p_title: string
          p_url: string
          p_highlighted_text: string
          p_content?: string
          p_context_before?: string
          p_context_after?: string
          p_metadata?: Json
        }
        Returns: {
          highlight_id: string
          success: boolean
          message: string
        }[]
      }
      create_entity_relationships: {
        Args: { p_highlight_id: string; p_relationships: Json }
        Returns: number
      }
      create_user_api_key: {
        Args: { p_label: string; p_scopes?: Json }
        Returns: {
          id: string
          label: string
          api_key: string
          scopes: Json
          created_at: string
        }[]
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_by_api_key: {
        Args: { p_api_key: string }
        Returns: {
          user_id: string
          scopes: Json
          api_key_id: string
        }[]
      }
      get_user_highlights: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_status?: string
          p_domain?: string
          p_search?: string
        }
        Returns: {
          id: string
          title: string
          highlighted_text: string
          url: string
          domain: string
          tags: string[]
          entities: Json
          metadata: Json
          status: string
          is_favorite: boolean
          word_count: number
          created_at: string
          processed_at: string
        }[]
      }
      get_user_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_highlights: number
          total_entities: number
          total_domains: number
          highlights_this_week: number
          processing_queue: number
          favorite_highlights: number
        }[]
      }
      mark_highlight_processed: {
        Args: {
          p_highlight_id: string
          p_entities?: Json
          p_relationships?: Json
        }
        Returns: boolean
      }
      revoke_api_key: {
        Args: { p_api_key_id: string }
        Returns: boolean
      }
      search_highlights: {
        Args: { p_query: string; p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          title: string
          highlighted_text: string
          url: string
          domain: string
          tags: string[]
          entities: Json
          created_at: string
          rank: number
        }[]
      }
      update_user_preferences: {
        Args: { p_preferences: Json }
        Returns: Json
      }
      upsert_entities: {
        Args: { p_highlight_id: string; p_entities: Json }
        Returns: {
          entity_id: string
          entity_name: string
          entity_type: string
          was_created: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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

// Neemee-specific types for better developer experience
export type Highlight = Tables<'highlights'>
export type HighlightInsert = TablesInsert<'highlights'>
export type HighlightUpdate = TablesUpdate<'highlights'>

export type Entity = Tables<'entities'>
export type EntityInsert = TablesInsert<'entities'>
export type EntityUpdate = TablesUpdate<'entities'>

export type UserProfile = Tables<'user_profiles'>
export type UserProfileInsert = TablesInsert<'user_profiles'>
export type UserProfileUpdate = TablesUpdate<'user_profiles'>

export type UserApiKey = Tables<'user_api_keys'>
export type Collection = Tables<'collections'>
export type EntityRelationship = Tables<'entity_relationships'>

// Entity types supported by the system
export type EntityType = 'Person' | 'Organization' | 'Topic' | 'URL' | 'Event' | 'Product'

// API function return types
export type CaptureHighlightResult = Database['public']['Functions']['capture_highlight']['Returns'][0]
export type CreateApiKeyResult = Database['public']['Functions']['create_user_api_key']['Returns'][0]
export type UserStatsResult = Database['public']['Functions']['get_user_stats']['Returns'][0]
export type SearchHighlightsResult = Database['public']['Functions']['search_highlights']['Returns'][0]